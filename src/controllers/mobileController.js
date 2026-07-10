import Employee from '../models/Employee.js';
import AttendanceLog from '../models/AttendanceLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyAttendance } from '../utils/modelService.js';

// POST /api/mobile/checkin
// The mobile app has no login step (see app/home.tsx) — it never tells us
// which employee is checking in. So this endpoint sends the recorded clip
// PLUS every enrolled employee's face embedding to the model service, which
// identifies the closest match (1:N, see model-service/identify.py) and
// runs liveness/speech/lip-sync checks, then reports back a verdict.
export const checkIn = asyncHandler(async (req, res) => {
  const { phrase, attendanceType, attendanceClass } = req.body;

  if (!phrase || !attendanceType || !attendanceClass) {
    res.statusCode = 400;
    throw new Error('phrase, attendanceType, and attendanceClass are required.');
  }
  if (!req.file) {
    res.statusCode = 400;
    throw new Error('A recorded video is required (field name "video").');
  }

  const employees = await Employee.find({
    faceEmbedding: { $exists: true, $not: { $size: 0 } },
  });

  if (employees.length === 0) {
    res.statusCode = 422;
    throw new Error('No employees have an enrolled face yet — add a photo when creating an employee first.');
  }

  const candidates = employees.map((e) => ({
    id: e._id.toString(),
    name: e.name,
    embedding: e.faceEmbedding,
  }));

  const verdict = await verifyAttendance({
    videoBuffer: req.file.buffer,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    phrase,
    candidates,
  });

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const status = verdict.decision === 'pass' ? 'success'
    : verdict.decision === 'malicious' ? 'malicious'
    : 'failed';

  const employeeDoc = verdict.identifiedEmployeeId
    ? employees.find((e) => e._id.toString() === verdict.identifiedEmployeeId)
    : null;

  // Only write a log when we can attribute it to a real employee — the
  // schema requires `employee`, and an unrecognized face genuinely isn't
  // anyone on file yet.
  let log = null;
  if (employeeDoc) {
    log = await AttendanceLog.create({
      employee: employeeDoc._id,
      name: employeeDoc.name,
      date: now,
      time,
      status,
      attendanceType,
      attendanceClass,
    });
  }

  res.json({
    decision: verdict.decision,
    status,
    reasons: verdict.reasons ?? [],
    scores: verdict.scores ?? {},
    recognized: Boolean(employeeDoc),
    employeeId: employeeDoc?._id ?? null,
    employeeName: employeeDoc?.name ?? verdict.identifiedName ?? null,
    photoUrl: employeeDoc?.photoUrl ?? null,
    time,
    date: now.toISOString().split('T')[0],
    logId: log?._id ?? null,
  });
});
