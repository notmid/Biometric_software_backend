"""
Lip-sync scoring.

Approach: track mouth-opening (Mouth Aspect Ratio) per frame using MediaPipe's
pretrained FaceMesh landmarks, and audio loudness (RMS envelope) per matching
time slice. If the mouth is actually producing the audio, the two signals
should be correlated (mouth opens ~when volume rises). We search a small lag
window to allow for minor audio/video misalignment and take the best
correlation found.

Note: this is a lightweight heuristic proxy, good enough for a first pass.
For production-grade accuracy, swap this module for a dedicated pretrained
sync model such as SyncNet (Chung & Zisserman) or Wav2Lip's sync discriminator.
"""

import numpy as np
import mediapipe as mp
import librosa

import config

mp_face_mesh = mp.solutions.face_mesh

# MediaPipe FaceMesh landmark indices for the outer lip
UPPER_LIP_IDX = 13
LOWER_LIP_IDX = 14
LEFT_CORNER_IDX = 61
RIGHT_CORNER_IDX = 291


def _mouth_aspect_ratio(landmarks, width, height):
    def pt(idx):
        lm = landmarks[idx]
        return np.array([lm.x * width, lm.y * height])

    vertical = np.linalg.norm(pt(UPPER_LIP_IDX) - pt(LOWER_LIP_IDX))
    horizontal = np.linalg.norm(pt(LEFT_CORNER_IDX) - pt(RIGHT_CORNER_IDX))
    return vertical / horizontal if horizontal > 0 else 0.0


def extract_mouth_signal(frames):
    """Returns a 1D array of mouth-aspect-ratio values, one per frame."""
    signal = []
    with mp_face_mesh.FaceMesh(
        static_image_mode=True, max_num_faces=1, refine_landmarks=True
    ) as fm:
        for frame in frames:
            h, w = frame.shape[:2]
            result = fm.process(frame)  # expects RGB, which our frames already are
            if result.multi_face_landmarks:
                mar = _mouth_aspect_ratio(result.multi_face_landmarks[0].landmark, w, h)
            else:
                mar = 0.0
            signal.append(mar)
    return np.array(signal)


def extract_audio_envelope(audio_path, n_samples):
    """Returns an RMS loudness envelope resampled to n_samples points."""
    y, sr = librosa.load(audio_path, sr=None)
    rms = librosa.feature.rms(y=y)[0]
    if len(rms) == 0:
        return np.zeros(n_samples)
    if len(rms) != n_samples and n_samples > 0:
        rms = np.interp(
            np.linspace(0, len(rms) - 1, n_samples),
            np.arange(len(rms)),
            rms,
        )
    return rms


def evaluate_lip_sync(frames, audio_path, max_lag=None, threshold=None):
    max_lag = max_lag if max_lag is not None else config.LIPSYNC_MAX_LAG
    threshold = threshold or config.LIPSYNC_CORRELATION_THRESHOLD

    mouth_signal = extract_mouth_signal(frames)
    audio_signal = extract_audio_envelope(audio_path, len(frames))

    if mouth_signal.std() == 0 or audio_signal.std() == 0:
        return {"correlation": 0.0, "best_lag": 0, "passed": False}

    mouth_norm = (mouth_signal - mouth_signal.mean()) / mouth_signal.std()
    audio_norm = (audio_signal - audio_signal.mean()) / audio_signal.std()

    best_corr = -1.0
    best_lag = 0
    for lag in range(-max_lag, max_lag + 1):
        if lag < 0:
            a, b = mouth_norm[-lag:], audio_norm[: len(audio_norm) + lag]
        elif lag > 0:
            a, b = mouth_norm[: len(mouth_norm) - lag], audio_norm[lag:]
        else:
            a, b = mouth_norm, audio_norm

        n = min(len(a), len(b))
        if n < 2:
            continue

        corr = np.corrcoef(a[:n], b[:n])[0, 1]
        if not np.isnan(corr) and corr > best_corr:
            best_corr = corr
            best_lag = lag

    return {
        "correlation": float(best_corr),
        "best_lag": best_lag,
        "passed": best_corr >= threshold,
    }
