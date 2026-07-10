// Talks to the Node backend's mobile check-in endpoint
// (attendance-backend/src/routes/mobileRoutes.js -> POST /api/mobile/checkin).
//
// IMPORTANT: "localhost" on a physical phone or a device running inside
// Expo Go means the PHONE itself, not your computer. Set
// EXPO_PUBLIC_API_URL to your computer's LAN IP (e.g. http://192.168.1.23:5000)
// in a .env file at the project root — see .env.example.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export type CheckInResult = {
  decision: 'pass' | 'fail' | 'malicious';
  status: 'success' | 'failed' | 'malicious';
  reasons: string[];
  scores: Record<string, number>;
  recognized: boolean;
  employeeId: string | null;
  employeeName: string | null;
  photoUrl: string | null;
  time: string;
  date: string;
  logId: string | null;
};

export class ApiError extends Error {}

// videoUri is a local file:// uri from CameraView.recordAsync().
export async function checkIn({
  videoUri,
  phrase,
  attendanceType,
  attendanceClass,
}: {
  videoUri: string;
  phrase: string;
  attendanceType: 'checkin' | 'checkout';
  attendanceClass: 'day' | 'break';
}): Promise<CheckInResult> {
  const form = new FormData();
  // React Native's FormData accepts this { uri, name, type } file shape,
  // unlike web FormData/Blob.
  form.append('video', {
    uri: videoUri,
    name: 'clip.mp4',
    type: 'video/mp4',
  } as unknown as Blob);
  form.append('phrase', phrase);
  form.append('attendanceType', attendanceType);
  form.append('attendanceClass', attendanceClass);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/mobile/checkin`, {
      method: 'POST',
      body: form,
      // Deliberately no Content-Type header here — React Native's fetch
      // sets the correct "multipart/form-data; boundary=..." automatically
      // when the body is a FormData instance. Setting it manually (without
      // a boundary) breaks multipart parsing on the server.
    });
  } catch (err) {
    throw new ApiError(
      `Could not reach the server at ${API_BASE_URL}. Make sure the backend is running and EXPO_PUBLIC_API_URL points at your computer's LAN IP.`
    );
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Check-in failed (${res.status}).`);
  }

  return data as CheckInResult;
}
