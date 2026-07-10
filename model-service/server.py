"""
Persistent model service for face enrollment + attendance verification.

Why this exists as its own process: the Node backend (attendance-backend)
is JavaScript and can't load these Python ML models directly. This FastAPI
app loads DeepFace/MediaPipe/Whisper ONCE at startup (see `warm_up()` below)
and keeps them resident in memory — every request after that only pays
inference cost, not model-loading cost. Node calls this service over HTTP;
nothing here talks to MongoDB directly.

Run it with:
    uvicorn server:app --host 0.0.0.0 --port 8001

(see README.md in this folder for full setup)
"""

import base64
import json
import os
import tempfile
import time

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from concurrent.futures import ThreadPoolExecutor

import config
from utils import extract_frames, extract_audio
from frame_analysis import analyze_frames, analyze_frame, _rotate
from face_match import get_embedding, evaluate_face_match
from liveness import evaluate_liveness
from speech_match import evaluate_speech_match, transcribe
from lip_sync import evaluate_lip_sync
from classifier import classify
from identify import identify_employee

app = FastAPI(title="Attendance Verification Model Service")

_warm = {"done": False, "warmed_at": None, "error": None}


def warm_up():
    """
    Forces every model to load into memory now, using the bundled test.jpg,
    instead of on the first real request. This is the difference the
    warm_vs_cold_test.py script in the original prototype demonstrates —
    we just run it once automatically when the server process starts.
    """
    t0 = time.perf_counter()
    try:
        test_image_path = os.path.join(os.path.dirname(__file__), "test.jpg")
        frame = cv2.cvtColor(cv2.imread(test_image_path), cv2.COLOR_BGR2RGB)

        # Loads the face detector + ArcFace embedding model + MiniFASNet
        # anti-spoofing model (all bundled inside DeepFace.extract_faces /
        # represent).
        analyze_frame(frame)

        # Loads the Whisper (or faster-whisper) model into _model_cache.
        # We don't have real audio here, so just force the model load —
        # transcribe() on silence is fine, we're not checking the result.
        silent_wav = tempfile.mktemp(suffix=".wav")
        _write_silence(silent_wav, seconds=0.5)
        try:
            transcribe(silent_wav)
        finally:
            if os.path.exists(silent_wav):
                os.remove(silent_wav)

        # Loads MediaPipe FaceMesh's underlying model graph.
        from lip_sync import extract_mouth_signal
        extract_mouth_signal([frame])

        _warm["done"] = True
        _warm["warmed_at"] = time.time()
        print(f"[model-service] Warm-up complete in {time.perf_counter() - t0:.2f}s — models are resident.")
    except Exception as exc:  # pragma: no cover - startup diagnostics only
        _warm["error"] = str(exc)
        print(f"[model-service] Warm-up failed: {exc}")


def _write_silence(path, seconds=0.5, sample_rate=16000):
    import wave
    n_samples = int(seconds * sample_rate)
    with wave.open(path, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(b"\x00\x00" * n_samples)


@app.on_event("startup")
def _on_startup():
    warm_up()


@app.get("/health")
def health():
    return {"status": "ok", "warm": _warm["done"], "warmed_at": _warm["warmed_at"], "error": _warm["error"]}


# ---------------- Enrollment ----------------

class EmbedError(Exception):
    pass


def _decode_image_base64(image_base64: str) -> np.ndarray:
    # Accepts either a raw base64 string or a data URL ("data:image/png;base64,...").
    if "," in image_base64 and image_base64.strip().startswith("data:"):
        image_base64 = image_base64.split(",", 1)[1]
    try:
        raw = base64.b64decode(image_base64)
    except Exception as exc:
        raise EmbedError(f"Could not decode base64 image: {exc}")

    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)  # BGR
    if img is None:
        raise EmbedError("Could not decode image data — is it a valid image?")
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


@app.post("/embed")
async def embed(
    image: UploadFile = File(None),
    image_base64: str = Form(None),
):
    """
    Produces a face embedding for ONE enrollment photo. Called by the Node
    backend when an admin adds/updates an employee with a photo, so it can
    store the resulting vector in Employee.faceEmbedding.

    Accepts either a multipart file (`image`) or a base64/data-URL string
    (`image_base64`) — the Node admin dashboard sends photos as data URLs,
    so `image_base64` is the primary path.
    """
    if image is None and not image_base64:
        raise HTTPException(400, "Provide either an 'image' file or 'image_base64'.")

    try:
        if image_base64:
            img_rgb = _decode_image_base64(image_base64)
        else:
            raw = await image.read()
            arr = np.frombuffer(raw, dtype=np.uint8)
            img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                raise EmbedError("Could not decode the uploaded image.")
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    except EmbedError as exc:
        raise HTTPException(400, str(exc))

    embedding = get_embedding(img_rgb)
    if embedding is None:
        raise HTTPException(
            422,
            "No face could be detected in that photo. Please use a clear, "
            "front-facing photo with a single visible face.",
        )

    return {"embedding": embedding.tolist()}


# ---------------- Attendance check-in verification ----------------

@app.post("/verify")
async def verify(
    video: UploadFile = File(...),
    phrase: str = Form(...),
    candidates: str = Form(...),  # JSON string: [{"id":..., "name":..., "embedding":[...]}]
    whisper_size: str = Form(None),
):
    """
    Runs the full verification pipeline on a check-in/check-out video and
    identifies WHICH employee it is (1:N — see identify.py), since the
    mobile app never collects an employee ID up front.

    `candidates` is supplied by Node (every employee that has a stored
    faceEmbedding) rather than fetched here — this service has no direct
    database access on purpose.
    """
    try:
        candidates_list = json.loads(candidates)
    except json.JSONDecodeError:
        raise HTTPException(400, "candidates must be a JSON array string.")

    if not candidates_list:
        raise HTTPException(
            422,
            "No enrolled faces to compare against — add employees with a "
            "photo before using check-in.",
        )

    suffix = os.path.splitext(video.filename or "")[1] or ".mp4"
    tmp_video_path = tempfile.mktemp(suffix=suffix)
    audio_path = None

    try:
        with open(tmp_video_path, "wb") as f:
            f.write(await video.read())

        frames = extract_frames(tmp_video_path)
        lipsync_frames = extract_frames(tmp_video_path, max_frames=config.LIPSYNC_SAMPLE_FRAMES)
        audio_path = extract_audio(tmp_video_path)

        with ThreadPoolExecutor(max_workers=3) as pool:
            frame_analyses_future = pool.submit(analyze_frames, frames)
            speech_future = pool.submit(
                evaluate_speech_match, audio_path, phrase,
                model_size=whisper_size or config.WHISPER_MODEL_SIZE,
            )
            frame_analyses, rotation = frame_analyses_future.result()

            if rotation:
                lipsync_frames = [_rotate(f, rotation) for f in lipsync_frames]
            lipsync_future = pool.submit(evaluate_lip_sync, lipsync_frames, audio_path)

            speech_result = speech_future.result()
            lipsync_result = lipsync_future.result()

        liveness_result = evaluate_liveness(frame_analyses)
        identified = identify_employee(frame_analyses, candidates_list)
        print(f"[debug] detected faces in {sum(a['detected'] for a in frame_analyses)}/{len(frame_analyses)} sampled frames")
        speech_result = speech_future.result()
        lipsync_result = lipsync_future.result()

        liveness_result = evaluate_liveness(frame_analyses)
        identified = identify_employee(frame_analyses, candidates_list)

        if identified:
            face_result = {
                "match_pct": identified["match_pct"],
                "passed": identified["passed"],
                "per_frame_scores": identified["per_frame_scores"],
            }
        else:
            # Nobody in the candidate list cleared the match threshold —
            # treat like a normal failed face-match for classify(), rather
            # than a special case, so the existing decision logic still applies.
            face_result = {"match_pct": 0.0, "passed": False, "per_frame_scores": []}

        verdict = classify(face_result, liveness_result, speech_result, lipsync_result)
        verdict["identifiedEmployeeId"] = identified["id"] if identified else None
        verdict["identifiedName"] = identified["name"] if identified else None

        return JSONResponse(verdict)
    finally:
        for path in (tmp_video_path, audio_path):
            if path and os.path.exists(path):
                os.remove(path)
