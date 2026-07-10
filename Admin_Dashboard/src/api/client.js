// Central API client. Every network call in the app goes through here.
// Backend is expected to be running locally at BASE_URL (see README for the
// full endpoint list this was built against).

const BASE_URL = 'http://localhost:5000';

const TOKEN_KEY = 'authToken';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      `Could not reach the server at ${BASE_URL}. Is it running?`,
      0
    );
  }

  // Some endpoints (e.g. DELETE) may return no body.
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data;
}

// ---------------- Auth ----------------

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  if (data?.token) setToken(data.token);
  return data;
}

export function fetchMe() {
  return request('/api/auth/me');
}

export function logout() {
  setToken(null);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

// ---------------- Employees ----------------

function normalizeEmployee(e) {
  if (!e) return e;
  return {
    id: e.id || e._id,
    name: e.name,
    department: e.department,
    designation: e.designation,
    contact: e.contact,
    dateOfJoining: e.dateOfJoining,
    baseSalary: e.baseSalary,
    photoUrl: e.photoUrl ?? null,
  };
}

export async function fetchEmployees() {
  const data = await request('/api/employees');
  const list = Array.isArray(data) ? data : data?.employees ?? [];
  return list.map(normalizeEmployee);
}

export async function createEmployee(payload) {
  const data = await request('/api/employees', { method: 'POST', body: payload });
  return normalizeEmployee(data?.employee ?? data);
}

export async function updateEmployee(id, payload) {
  const data = await request(`/api/employees/${id}`, { method: 'PATCH', body: payload });
  return normalizeEmployee(data?.employee ?? data);
}

export function deleteEmployee(id) {
  return request(`/api/employees/${id}`, { method: 'DELETE' });
}

// ---------------- Leave requests ----------------

function normalizeLeaveRequest(l) {
  if (!l) return l;
  // The backend's leave_form schema is: id, name, reason, status. Dates are
  // optional/not guaranteed — only carry them through if the server sends them.
  return {
    id: l.id || l._id,
    employeeName: l.employeeName || l.name,
    startDate: l.startDate || l.date || null,
    endDate: l.endDate || l.date || null,
    reason: l.reason,
    status: l.status || 'pending',
    note: l.adminNote ?? l.note ?? null,
  };
}

export async function fetchLeaveRequests() {
  const data = await request('/api/leave-requests');
  const list = Array.isArray(data) ? data : data?.leaveRequests ?? [];
  return list.map(normalizeLeaveRequest);
}

// employeeId is the Mongo _id of the employee this leave belongs to —
// required by the backend (employee, name, reason, startDate, endDate).
export async function createLeaveRequest({ employeeId, name, reason, startDate, endDate }) {
  const data = await request('/api/leave-requests', {
    method: 'POST',
    body: { employee: employeeId, name, reason, startDate, endDate },
  });
  return normalizeLeaveRequest(data?.leaveRequest ?? data);
}

export async function decideLeaveRequest(id, status, note) {
  const data = await request(`/api/leave-requests/${id}`, {
    method: 'PATCH',
    body: { status, adminNote: note },
  });
  return normalizeLeaveRequest(data?.leaveRequest ?? data);
}

// ---------------- Queries ----------------

function normalizeQuery(q) {
  if (!q) return q;
  return {
    id: q.id || q._id,
    employeeName: q.employeeName || q.name,
    subject: q.subject ?? q.query?.slice(0, 60) ?? '',
    message: q.message || q.query,
    status: q.status || 'unanswered',
    answer: q.answer ?? null,
  };
}

export async function fetchQueries() {
  const data = await request('/api/queries');
  const list = Array.isArray(data) ? data : data?.queries ?? [];
  return list.map(normalizeQuery);
}

export async function createQuery({ employeeId, name, subject, message }) {
  const data = await request('/api/queries', {
    method: 'POST',
    body: { employee: employeeId, name, subject, message },
  });
  return normalizeQuery(data?.query ?? data);
}

export async function answerQuery(id, answer) {
  const data = await request(`/api/queries/${id}`, {
    method: 'PATCH',
    body: { status: 'answered', answer },
  });
  return normalizeQuery(data?.query ?? data);
}

// ---------------- Payroll ----------------

function normalizePayrollRun(p) {
  if (!p) return p;
  // The payroll schema is per-employee (emp_id, emp_name, total_leave, salary).
  // A "run" returned by the API is expected to wrap those rows with run-level
  // metadata (date range, when it was processed, grand total) — but fall back
  // to summing the per-employee rows if the server only sends those.
  const rows = p.employees ?? p.rows ?? [];
  const total = p.total ?? (rows.length ? rows.reduce((sum, r) => sum + (r.salary ?? 0), 0) : p.salary ?? 0);
  return {
    id: p.id || p._id,
    startDate: p.startDate,
    endDate: p.endDate,
    processedOn: p.processedOn || p.createdAt,
    total,
    employees: rows,
  };
}

export async function fetchPayrollRuns() {
  const data = await request('/api/payroll');
  const list = Array.isArray(data) ? data : data?.payrollRuns ?? [];
  return list.map(normalizePayrollRun);
}

export async function initiatePayroll(startDate, endDate) {
  const data = await request('/api/payroll/initiate', {
    method: 'POST',
    body: { startDate, endDate },
  });
  return normalizePayrollRun(data?.payrollRun ?? data);
}

// ---------------- Attendance ----------------

export async function fetchTodayAttendanceSummary() {
  const data = await request('/api/attendance/today-summary');
  return {
    present: data?.present ?? 0,
    total: data?.total ?? 0,
  };
}

export async function fetchAttendanceCalendar(month, year) {
  const data = await request(`/api/attendance/calendar?month=${month}&year=${year}`);
  const list = Array.isArray(data) ? data : data?.days ?? [];
  return list;
}

// ---------------- Reports ----------------

export async function fetchMonthlyReport(month, year) {
  const data = await request(`/api/reports/monthly?month=${month}&year=${year}`);
  return {
    employeeReport: data?.employeeReport ?? data?.employees ?? [],
    departmentReport: data?.departmentReport ?? data?.departments ?? [],
  };
}

// ---------------- Working days / holidays ----------------

export async function fetchWorkingDays(month, year) {
  const data = await request(`/api/working-days?month=${month}&year=${year}`);
  return {
    month: data?.month ?? month,
    year: data?.year ?? year,
    holidays: data?.holidays ?? [],
  };
}

export async function setWorkingDays(month, year, holidays) {
  const data = await request('/api/working-days', {
    method: 'PUT',
    body: { month, year, holidays },
  });
  return {
    month: data?.month ?? month,
    year: data?.year ?? year,
    holidays: data?.holidays ?? [],
  };
}

// ---------------- Health ----------------

export function checkHealth() {
  return request('/api/health', { auth: false });
}

export { ApiError };
