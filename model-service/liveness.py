"""
Liveness / anti-spoofing aggregation.

Detects common static-image / replay attacks: printed photos, phone/tablet
screens held up to the camera, etc. — via MiniFASNet (pretrained, run inside
DeepFace's extract_faces(anti_spoofing=True)).

This module does NOT call DeepFace directly anymore — the per-frame
is_real/antispoof_score values are already computed once in
frame_analysis.analyze_frames() and shared with face_match.py, so this is
now pure aggregation logic (fast, no model inference here).
"""

import config


def evaluate_liveness(frame_analyses, real_ratio_threshold=None):
    """
    frame_analyses: output of frame_analysis.analyze_frames().

    Passing requires the fraction of frames flagged "real" to exceed
    real_ratio_threshold — a single fake-looking frame shouldn't sink the
    whole session (motion blur, bad angle, etc.), but a consistently fake
    signal should.
    """
    real_ratio_threshold = real_ratio_threshold or config.LIVENESS_REAL_RATIO_THRESHOLD

    real_flags = [a["is_real"] for a in frame_analyses if a["detected"]]
    scores = [a["antispoof_score"] for a in frame_analyses if a["detected"]]

    real_ratio = sum(real_flags) / len(real_flags) if real_flags else 0.0
    avg_score = sum(scores) / len(scores) if scores else 0.0

    return {
        "real_ratio": real_ratio,
        "avg_score": avg_score,
        "passed": real_ratio >= real_ratio_threshold,
    }
