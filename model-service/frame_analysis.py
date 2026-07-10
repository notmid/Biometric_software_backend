"""
Runs face detection ONCE per frame and reuses the result for both face-match
embedding and liveness scoring.

Why this matters: face detection (RetinaFace/YuNet/etc.) is the single most
expensive step in the pipeline. The original version ran it twice per frame —
once inside DeepFace.extract_faces() for liveness, and again inside
DeepFace.represent() for embeddings. This module detects once, crops the face
once, and reuses that crop for the embedding (via detector_backend="skip"),
cutting detector cost roughly in half.
"""

import cv2
import numpy as np
from deepface import DeepFace

import config

def _rotate(frame, degrees):
    if degrees == 90:
        return cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
    if degrees == 270:
        return cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
    if degrees == 180:
        return cv2.rotate(frame, cv2.ROTATE_180)
    return frame


def detect_video_rotation(frames, detector_backend=None):
    """
    Some phone/encoder combos don't embed usable rotation metadata at all,
    so instead of trusting metadata, this tries each 90-degree rotation on
    a couple of early frames and keeps whichever orientation a face is
    actually found in. Determined ONCE per video (not per frame), then
    applied to every frame — so we're not paying a 4x cost throughout.
    """
    detector_backend = detector_backend or config.FACE_DETECTOR_BACKEND
    for degrees in (0, 90, 270, 180):
        for frame in frames[:3]:
            test_frame = _rotate(_resize_if_needed(frame), degrees)
            try:
                faces = DeepFace.extract_faces(
                    img_path=test_frame, detector_backend=detector_backend,
                    anti_spoofing=False, align=False, enforce_detection=False,
                )
                if faces and faces[0].get("confidence", 0) > 0:
                    return degrees
            except Exception:
                continue
    return 0  # no orientation found a face — leave frames as-is

def _resize_if_needed(frame, max_dim=None):
    """Downscale so the longer side is at most max_dim pixels — detector cost
    scales with pixel count, and full phone-camera resolution is overkill."""
    max_dim = max_dim or config.MAX_FRAME_DIMENSION
    h, w = frame.shape[:2]
    longer_side = max(h, w)
    if longer_side <= max_dim:
        return frame
    scale = max_dim / longer_side
    new_size = (int(w * scale), int(h * scale))
    return cv2.resize(frame, new_size, interpolation=cv2.INTER_AREA)


def _crop_to_uint8(face_crop):
    """DeepFace returns face crops as float arrays in [0, 1]; represent()
    expects standard uint8 [0, 255] images."""
    if face_crop.dtype != np.uint8:
        face_crop = np.clip(face_crop * 255.0, 0, 255).astype(np.uint8)
    return face_crop


def analyze_frame(frame, detector_backend=None):
    """
    Single detection pass on one frame. Returns a dict:
      {
        detected: bool,
        embedding: np.ndarray or None,
        is_real: bool,
        antispoof_score: float,
      }
    """
    detector_backend = detector_backend or config.FACE_DETECTOR_BACKEND
    frame = _resize_if_needed(frame)

    try:
        faces = DeepFace.extract_faces(
            img_path=frame,
            detector_backend=detector_backend,
            anti_spoofing=True,
            align=True,
        )
    except Exception:
        return {"detected": False, "embedding": None, "is_real": False, "antispoof_score": 0.0}

    if not faces:
        return {"detected": False, "embedding": None, "is_real": False, "antispoof_score": 0.0}

    face = max(faces, key=lambda f: f.get("confidence", 0.0))
    is_real = bool(face.get("is_real", False))
    antispoof_score = float(face.get("antispoof_score", 0.0))

    embedding = None
    try:
        crop = _crop_to_uint8(face["face"])
        reps = DeepFace.represent(
            img_path=crop,
            model_name=config.FACE_EMBEDDING_MODEL,
            detector_backend="skip",  # face is already detected & cropped — don't redo it
            enforce_detection=False,
        )
        if reps:
            embedding = np.array(reps[0]["embedding"])
    except Exception:
        embedding = None

    return {
        "detected": True,
        "embedding": embedding,
        "is_real": is_real,
        "antispoof_score": antispoof_score,
    }


def analyze_frames(frames, detector_backend=None):
    """Runs analyze_frame() across a list of frames."""
    detector_backend = detector_backend or config.FACE_DETECTOR_BACKEND
    rotation = detect_video_rotation(frames, detector_backend)
    if rotation:
        frames = [_rotate(f, rotation) for f in frames]
    return [analyze_frame(f, detector_backend) for f in frames], rotation
