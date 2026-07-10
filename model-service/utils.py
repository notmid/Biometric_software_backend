"""
Utility functions for pulling frames and audio out of a video file.
Requires ffmpeg installed on the system (for audio extraction).
"""

import subprocess
import tempfile

import cv2
import numpy as np

import config

import json

def _get_rotation_degrees(video_path):
    """
    Phones store portrait video in the sensor's native (landscape)
    orientation, with a rotation flag telling players to rotate it for
    display — every phone does this, it's not specific to a model or OS.
    cv2.VideoCapture frequently ignores that flag, so without reading it
    explicitly here, every frame comes out sideways.
    """
    cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream_tags=rotate:stream_side_data=rotation",
        "-of", "json", video_path,
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
        data = json.loads(result.stdout or "{}")
        stream = (data.get("streams") or [{}])[0]
        if "tags" in stream and "rotate" in stream["tags"]:
            return int(stream["tags"]["rotate"]) % 360
        for sd in stream.get("side_data_list", []):
            if "rotation" in sd:
                return int(sd["rotation"]) % 360
    except Exception:
        pass
    return 0


def _apply_rotation(frame, degrees):
    if degrees == 90:
        return cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
    if degrees in (-90, 270):
        return cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
    if degrees in (180, -180):
        return cv2.rotate(frame, cv2.ROTATE_180)
    return frame

def extract_frames(video_path, max_frames=None):
    """
    Sample `max_frames` evenly-spaced frames across the whole video, regardless
    of its length or fps. This keeps per-video cost constant and predictable
    (a 3-second clip and a 10-second clip both cost the same to analyze),
    instead of "every Nth frame" which scales with video length.

    Returns a list of RGB numpy arrays (H, W, 3).
    """
    max_frames = max_frames or config.MAX_FRAMES
    rotation = _get_rotation_degrees(video_path)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise IOError(f"Could not open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        # Some containers don't report frame count reliably — fall back to
        # sequential read.
        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            frames.append(_apply_rotation(frame, rotation))
            if len(frames) >= max_frames:
                break
        cap.release()
        if not frames:
            raise ValueError(f"No frames could be extracted from {video_path}")
        return frames

    n = min(max_frames, total_frames)
    indices = np.linspace(0, total_frames - 1, n, dtype=int)

    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if ret:
            frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            frames.append(_apply_rotation(frame, rotation))
    cap.release()

    if not frames:
        raise ValueError(f"No frames could be extracted from {video_path}")

    return frames


def extract_audio(video_path):
    """
    Extract mono 16kHz audio track from a video into a temp .wav file.
    Returns the path to the wav file. Caller is responsible for cleanup.
    """
    out_path = tempfile.mktemp(suffix=".wav")
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-ac", "1",
        "-ar", "16000",
        out_path,
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg failed to extract audio: {result.stderr.decode(errors='ignore')}"
        )
    return out_path
