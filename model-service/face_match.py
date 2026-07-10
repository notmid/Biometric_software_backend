"""
Face embedding matching.

Consumes the shared per-frame analysis from frame_analysis.py (embeddings
already extracted there in the same detection pass used for liveness) —
this module does NOT call DeepFace directly, to avoid a second detection pass.
"""

import numpy as np
from deepface import DeepFace

import config


def get_embedding(image, model_name=None, detector_backend=None):
    """
    Standalone single-image embedding — used for enrolling the REFERENCE
    image only (once per user), not for per-frame video analysis.
    """
    model_name = model_name or config.FACE_EMBEDDING_MODEL
    detector_backend = detector_backend or config.FACE_DETECTOR_BACKEND

    try:
        reps = DeepFace.represent(
            img_path=image,
            model_name=model_name,
            detector_backend=detector_backend,
            enforce_detection=True,
        )
        if not reps:
            return None
        return np.array(reps[0]["embedding"])
    except Exception:
        return None


def cosine_similarity(a, b):
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def evaluate_face_match(frame_analyses, reference_embedding, frame_threshold=None, pass_ratio=None):
    """
    frame_analyses: output of frame_analysis.analyze_frames() — reuses
    embeddings already computed there, no extra detection cost here.
    """
    frame_threshold = frame_threshold or config.FACE_FRAME_SIMILARITY_THRESHOLD
    pass_ratio = pass_ratio or config.FACE_MATCH_PASS_RATIO

    per_frame_scores = []
    for analysis in frame_analyses:
        emb = analysis.get("embedding")
        if emb is None:
            per_frame_scores.append(0.0)  # no face / no embedding = fail this frame
            continue
        per_frame_scores.append(cosine_similarity(emb, reference_embedding))

    pass_flags = [s >= frame_threshold for s in per_frame_scores]
    match_pct = sum(pass_flags) / len(pass_flags) if pass_flags else 0.0

    return {
        "per_frame_scores": per_frame_scores,
        "match_pct": match_pct,
        "passed": match_pct >= pass_ratio,
    }
