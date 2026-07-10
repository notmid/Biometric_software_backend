"""
Speech-to-text + phrase matching.

Prefers faster-whisper (CTranslate2 backend — roughly 4x faster than stock
openai-whisper on CPU, same underlying pretrained Whisper weights, just a
faster inference runtime) if installed. Falls back to openai-whisper
automatically otherwise, so this works either way with no code changes needed.
"""

import difflib

import config

_backend = None  # "faster" or "openai"
_model_cache = {}


def _load_model(size=None):
    global _backend
    size = size or config.WHISPER_MODEL_SIZE

    if size in _model_cache:
        return _model_cache[size]

    if config.USE_FASTER_WHISPER:
        try:
            from faster_whisper import WhisperModel
            model = WhisperModel(size, device="cpu", compute_type="int8")
            _backend = "faster"
            _model_cache[size] = model
            return model
        except ImportError:
            pass  # fall through to openai-whisper

    import whisper
    model = whisper.load_model(size)
    _backend = "openai"
    _model_cache[size] = model
    return model


def transcribe(audio_path, model_size=None):
    model = _load_model(model_size)

    if _backend == "faster":
        segments, _info = model.transcribe(audio_path)
        return " ".join(seg.text for seg in segments).strip()
    else:
        result = model.transcribe(audio_path, fp16=False)
        return result["text"].strip()


def phrase_similarity(expected_phrase, transcribed_text):
    """Simple ratio-based fuzzy match (0-1). Tolerant of minor ASR errors."""
    a = expected_phrase.lower().strip()
    b = transcribed_text.lower().strip()
    return difflib.SequenceMatcher(None, a, b).ratio()


def evaluate_speech_match(audio_path, expected_phrase, threshold=None, model_size=None):
    threshold = threshold or config.PHRASE_SIMILARITY_THRESHOLD

    transcript = transcribe(audio_path, model_size)
    similarity = phrase_similarity(expected_phrase, transcript)

    return {
        "transcript": transcript,
        "expected_phrase": expected_phrase,
        "similarity": similarity,
        "passed": similarity >= threshold,
    }
