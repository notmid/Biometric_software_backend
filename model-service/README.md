# Model Service (Face Enrollment + Attendance Verification)

A small, always-on Python service that wraps the identity-verification
pipeline (face match, liveness, speech match, lip-sync) as an HTTP API, so
the Node backend (`attendance-backend`) can call it without needing to run
Python itself.

## Why a separate process

The Node backend is JavaScript — it can't load DeepFace/MediaPipe/Whisper
directly. This service loads all of those models **once, at startup** (see
`warm_up()` in `server.py`) and keeps them resident in memory for the
lifetime of the process. Every request after that only pays inference cost,
not model-loading cost — this is the same "warm vs cold" distinction the
original `warm_vs_cold_test.py` script demonstrated, just applied
automatically every time the service boots instead of manually in a script.

## Setup

```bash
cd model-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# ffmpeg must also be installed on the system (used for audio extraction)
```

First run downloads model weights (ArcFace, MiniFASNet, Whisper) — expect a
delay and an internet connection the very first time only.

## Running it

```bash
uvicorn server:app --host 0.0.0.0 --port 8001
```

Wait for this line before using it:
```
[model-service] Warm-up complete in NN.NNs — models are resident.
```
That means every model is loaded and subsequent requests will be fast. You
can also check `GET http://localhost:8001/health` — `"warm": true` means
it's ready.

**Keep this process running** the same way you keep the Node server and
MongoDB running — it's a third long-lived process your app depends on.

## Endpoints

### `POST /embed`
Used when an admin adds/updates an employee with a photo. Produces a face
embedding for one enrollment photo.

Body (form-data or JSON-like form field):
- `image_base64` — a data URL or raw base64 string (what the admin
  dashboard sends), **or**
- `image` — a multipart file upload

Response:
```json
{ "embedding": [0.123, -0.045, ...] }
```
Returns `422` if no face was detected in the photo.

### `POST /verify`
Used by the mobile app's check-in/check-out flow. Runs the full pipeline
AND identifies which employee it is (1:N — see `identify.py`), since the
mobile app never asks "who are you" up front.

Body (multipart form-data):
- `video` — the recorded check-in clip (file)
- `phrase` — the phrase the employee was asked to read aloud
- `candidates` — JSON string: `[{"id": "...", "name": "...", "embedding": [...]}, ...]`
  for every enrolled employee (Node fetches these from MongoDB and passes
  them in — this service has no direct database access, by design)
- `whisper_size` — optional override (`tiny`/`base`/`small`/...)

Response:
```json
{
  "decision": "pass",
  "reasons": ["all_checks_passed"],
  "scores": { "...": "..." },
  "identifiedEmployeeId": "6a4caf...",
  "identifiedName": "Aarav Mehta"
}
```
`identifiedEmployeeId`/`identifiedName` are `null` if nobody in `candidates`
matched closely enough.

### `GET /health`
`{ "status": "ok", "warm": true, "warmed_at": <unix ts>, "error": null }`

## Files carried over unchanged from the original prototype

`config.py`, `utils.py`, `frame_analysis.py`, `face_match.py`, `liveness.py`,
`speech_match.py`, `lip_sync.py`, `classifier.py` — same tuning, same
decision logic. `identify.py` and `server.py` are new: `identify.py` extends
the existing 1:1 `evaluate_face_match` logic to search across every enrolled
employee (1:N), and `server.py` is the FastAPI wrapper + warm-start.
