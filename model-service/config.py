# Centralized thresholds — tune these based on real test data.
LIPSYNC_SAMPLE_FRAMES = 30
# Per-frame cosine similarity needed for a face embedding to "match" the reference
FACE_FRAME_SIMILARITY_THRESHOLD = 0.55

# Fraction of frames that must individually pass face match for overall pass
FACE_MATCH_PASS_RATIO = 0.50

# Fraction of frames that must be classified "real" (not spoofed) to pass liveness
LIVENESS_REAL_RATIO_THRESHOLD = 0.40

# Text similarity (0-1) between spoken phrase and expected phrase to pass
PHRASE_SIMILARITY_THRESHOLD = 0.75

# Cross-correlation threshold between mouth-movement and audio-energy signals
LIPSYNC_CORRELATION_THRESHOLD = 0.40

# Max frame lag (in sampled-frame units) searched when aligning audio/video for lip-sync
LIPSYNC_MAX_LAG = 5

# --- Speed-tuned defaults ---
# Whisper model size: tiny / base / small / medium / large.
# "tiny" is fine here because we're matching against a short KNOWN phrase,
# not doing open-vocabulary transcription — fuzzy match tolerates its lower accuracy.
WHISPER_MODEL_SIZE = "tiny"

# Prefer faster-whisper (CTranslate2 backend, ~4x faster on CPU) if installed,
# fall back to openai-whisper automatically if not.
USE_FASTER_WHISPER = True

# Face detector backend. "yunet" is a fast, lightweight OpenCV-based detector
# (good mobile/CPU tradeoff). Other options: "opencv" (fastest, least accurate),
# "retinaface"/"mtcnn" (slower, most accurate) — use those only if you see
# too many missed detections with yunet on your real footage.
FACE_DETECTOR_BACKEND = "yunet"

FACE_EMBEDDING_MODEL = "ArcFace"

# Downscale frames before face detection. Detector cost scales with pixel
# count, and a phone-camera frame (1080p+) is way more resolution than a face
# detector needs. Shrinking the longer side to this many pixels before
# detection is one of the single biggest speedups available.
MAX_FRAME_DIMENSION = 480

# Evenly-spaced frame sampling — total number of frames analyzed per video,
# regardless of video length/fps. Fewer frames = faster, and the >50%-of-frames
# rule still works fine with a smaller sample.
MAX_FRAMES = 10
