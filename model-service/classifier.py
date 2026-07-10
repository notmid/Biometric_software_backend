"""
Combines face-match, liveness, speech-match, and lip-sync results into a
final decision: pass / fail / malicious.

Decision logic:
  1. Liveness fails (spoof detected)                     -> MALICIOUS
  2. Face + speech pass but lip-sync fails                -> MALICIOUS
     (real face, correct phrase heard, but audio doesn't match mouth
     movement — suggests a dubbed/replayed clip or audio injection)
  3. All checks pass                                       -> PASS
  4. Anything else                                          -> FAIL
"""

from enum import Enum


class Decision(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    MALICIOUS = "malicious"


def _scores(face_result, liveness_result, speech_result, lipsync_result):
    return {
        "face_match_pct": face_result["match_pct"],
        "liveness_real_ratio": liveness_result["real_ratio"],
        "speech_similarity": speech_result["similarity"],
        "lipsync_correlation": lipsync_result["correlation"],
    }


def classify(face_result, liveness_result, speech_result, lipsync_result):
    reasons = []
    scores = _scores(face_result, liveness_result, speech_result, lipsync_result)

    if not liveness_result["passed"]:
        reasons.append("liveness_failed_possible_spoof")
        return {"decision": Decision.MALICIOUS, "reasons": reasons, "scores": scores}

    if face_result["passed"] and speech_result["passed"] and not lipsync_result["passed"]:
        reasons.append("audio_video_mismatch_possible_dub_or_replay")
        return {"decision": Decision.MALICIOUS, "reasons": reasons, "scores": scores}

    if face_result["passed"] and speech_result["passed"] and lipsync_result["passed"]:
        reasons.append("all_checks_passed")
        return {"decision": Decision.PASS, "reasons": reasons, "scores": scores}

    if not face_result["passed"]:
        reasons.append("face_match_below_threshold")
    if not speech_result["passed"]:
        reasons.append("phrase_not_spoken_correctly")
    if not lipsync_result["passed"]:
        reasons.append("lip_sync_below_threshold")

    return {"decision": Decision.FAIL, "reasons": reasons, "scores": scores}
