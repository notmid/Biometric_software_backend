"""
1:N face identification.

The original pipeline (face_match.py) is 1:1 — it checks a video against ONE
known reference embedding. The mobile check-in app never asks "who are you"
(no login, no employee picker — see app/home.tsx), so at verification time we
don't know the identity yet. This module searches across every enrolled
employee's stored embedding and returns whichever one the session's face
best matches, using the same per-frame-threshold / pass-ratio logic as
face_match.py's evaluate_face_match — just repeated once per candidate.
"""

import numpy as np

import config
from face_match import cosine_similarity


def identify_employee(frame_analyses, candidates, frame_threshold=None, pass_ratio=None):
    """
    frame_analyses: output of frame_analysis.analyze_frames() (already computed
    once for the session — reused here, no extra detection cost).
    candidates: list of {"id": ..., "name": ..., "embedding": [floats]} for
    every employee who has an enrolled face_embedding.

    Returns the best-matching candidate as a dict with match_pct/passed, or
    None if nobody clears pass_ratio (i.e. unrecognized face).
    """
    frame_threshold = frame_threshold or config.FACE_FRAME_SIMILARITY_THRESHOLD
    pass_ratio = pass_ratio or config.FACE_MATCH_PASS_RATIO

    frame_embeddings = [a.get("embedding") for a in frame_analyses]
    if not any(e is not None for e in frame_embeddings):
        return None

    best = None
    for cand in candidates:
        ref = np.array(cand["embedding"])
        per_frame_scores = [
            cosine_similarity(e, ref) if e is not None else 0.0 for e in frame_embeddings
        ]
        pass_flags = [s >= frame_threshold for s in per_frame_scores]
        match_pct = sum(pass_flags) / len(pass_flags) if pass_flags else 0.0

        if best is None or match_pct > best["match_pct"]:
            best = {
                "id": cand["id"],
                "name": cand["name"],
                "match_pct": match_pct,
                "per_frame_scores": per_frame_scores,
                "passed": match_pct >= pass_ratio,
            }

    return best if (best and best["passed"]) else None
