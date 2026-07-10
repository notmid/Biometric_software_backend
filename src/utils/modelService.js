// Talks to the model-service (FastAPI, see /model-service) over HTTP.
// That service keeps DeepFace/MediaPipe/Whisper warm in memory — this file
// is just the thin client Node uses to call it. No ML happens in this file.

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://localhost:8001';

class ModelServiceError extends Error {}

async function parseJsonSafely(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Sends an enrollment photo (base64/data URL, exactly what the admin
// dashboard's "Add Employee" form produces) and returns the face embedding
// to store on Employee.faceEmbedding.
export async function getFaceEmbedding(imageBase64) {
  let res;
  try {
    res = await fetch(`${MODEL_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ image_base64: imageBase64 }),
    });
  } catch (err) {
    throw new ModelServiceError(
      `Could not reach the face-recognition service at ${MODEL_SERVICE_URL}. ` +
      `Is model-service running (see model-service/README.md)?`
    );
  }

  const data = await parseJsonSafely(res);
  if (!res.ok) {
    throw new ModelServiceError(
      data?.detail || `Face embedding request failed (${res.status}).`
    );
  }
  return data.embedding;
}

// Sends a check-in/check-out video + the list of every enrolled employee's
// embedding, and gets back the pass/fail/malicious verdict plus (if
// recognized) which employee it was. See model-service/README.md for the
// full response shape.
export async function verifyAttendance({ videoBuffer, filename, mimeType, phrase, candidates, whisperSize }) {
  const form = new FormData();
  form.append('video', new Blob([videoBuffer], { type: mimeType || 'video/mp4' }), filename || 'clip.mp4');
  form.append('phrase', phrase);
  form.append('candidates', JSON.stringify(candidates));
  if (whisperSize) form.append('whisper_size', whisperSize);

  let res;
  try {
    res = await fetch(`${MODEL_SERVICE_URL}/verify`, { method: 'POST', body: form });
  } catch (err) {
    throw new ModelServiceError(
      `Could not reach the face-recognition service at ${MODEL_SERVICE_URL}. ` +
      `Is model-service running (see model-service/README.md)?`
    );
  }

  const data = await parseJsonSafely(res);
  if (!res.ok) {
    throw new ModelServiceError(
      data?.detail || `Verification request failed (${res.status}).`
    );
  }
  return data;
}

export async function checkModelServiceHealth() {
  try {
    const res = await fetch(`${MODEL_SERVICE_URL}/health`);
    return await parseJsonSafely(res);
  } catch {
    return { status: 'unreachable' };
  }
}

export { ModelServiceError };
