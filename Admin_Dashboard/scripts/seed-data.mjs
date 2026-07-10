#!/usr/bin/env node
/**
 * Seeds sample data into the leave-requests, queries, and payroll
 * collections by calling your live server's own API — nothing touches
 * the database directly, so this only works while the server (expected
 * at http://localhost:5000) is running.
 *
 * Why this exists: the server currently only has employee data. This
 * script uses the documented endpoints to create realistic sample rows
 * for the other collections, using whatever real employees are already
 * in your database.
 *
 * Usage:
 *   node scripts/seed-data.mjs <admin-email> <admin-password>
 *   (or set SEED_EMAIL / SEED_PASSWORD env vars)
 *
 * Requires Node 18+ (built-in fetch).
 *
 * NOTE: request body shapes below (e.g. { name, reason } for a leave
 * request) are my best guess based on the documented schema in
 * database_structure.docx. If your server expects slightly different
 * field names, tweak the `body` objects below — the console output
 * will show you exactly what each endpoint replied with.
 */

const BASE_URL = 'http://localhost:5000';

const email = process.argv[2] || process.env.SEED_EMAIL;
const password = process.argv[3] || process.env.SEED_PASSWORD;

if (!email || !password) {
  console.error('Usage: node scripts/seed-data.mjs <admin-email> <admin-password>');
  process.exit(1);
}

let token = null;

async function call(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log(`Checking server at ${BASE_URL}...`);
  await call('/api/health', { auth: false }).catch(() => {
    throw new Error(`Could not reach ${BASE_URL}/api/health — is the server running?`);
  });
  console.log('Server is up.\n');

  console.log('Logging in...');
  const loginRes = await call('/api/auth/login', { method: 'POST', body: { email, password } });
  token = loginRes.token;
  if (!token) throw new Error('Login did not return a token. Check the response shape:\n' + JSON.stringify(loginRes));
  console.log('Logged in.\n');

  console.log('Fetching existing employees...');
  const employeesRes = await call('/api/employees');
  const employees = Array.isArray(employeesRes) ? employeesRes : employeesRes.employees ?? [];
  if (employees.length === 0) {
    throw new Error('No employees found — add at least one employee before seeding leave/query/payroll data.');
  }
  console.log(`Found ${employees.length} employees.\n`);

  const names = employees.map((e) => e.name);
  const ids = employees.map((e) => e.id || e._id);
  const pick = (i) => ({ id: ids[i % ids.length], name: names[i % names.length] });

  // ---------------- Leave requests ----------------
  console.log('Creating leave requests...');
  const today = new Date();
  const inDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };
  const leaveSeeds = [
    { ...pick(0), reason: 'Family function out of town', startDate: inDays(3), endDate: inDays(5) },
    { ...pick(1), reason: 'Medical appointment', startDate: inDays(1), endDate: inDays(1) },
    { ...pick(2), reason: 'Fever and cold', startDate: inDays(-4), endDate: inDays(-2) },
    { ...pick(3), reason: 'Internet technician visit', startDate: inDays(-1), endDate: inDays(-1) },
  ];
  const createdLeaves = [];
  for (const seed of leaveSeeds) {
    const created = await call('/api/leave-requests', {
      method: 'POST',
      body: {
        employee: seed.id,
        name: seed.name,
        reason: seed.reason,
        startDate: seed.startDate,
        endDate: seed.endDate,
      },
    });
    createdLeaves.push(created.leaveRequest ?? created);
    console.log(`  + leave request for ${seed.name}`);
  }

  // Decide a couple of them so the leave list isn't all "pending".
  if (createdLeaves[2]?.id || createdLeaves[2]?._id) {
    const id = createdLeaves[2].id || createdLeaves[2]._id;
    await call(`/api/leave-requests/${id}`, {
      method: 'PATCH',
      body: { status: 'approved', adminNote: null },
    });
    console.log(`  ~ approved leave request for ${leaveSeeds[2].name}`);
  }
  if (createdLeaves[3]?.id || createdLeaves[3]?._id) {
    const id = createdLeaves[3].id || createdLeaves[3]._id;
    await call(`/api/leave-requests/${id}`, {
      method: 'PATCH',
      body: { status: 'declined', adminNote: null },
    });
    console.log(`  ~ declined leave request for ${leaveSeeds[3].name}`);
  }
  console.log('');

  // ---------------- Queries ----------------
  console.log('Creating queries...');
  const querySeeds = [
    { ...pick(4), subject: 'Overtime hours look off', message: 'My overtime hours for last week seem lower than expected. Could someone take a look?' },
    { ...pick(5), subject: 'Payslip download not working', message: 'The download payslip button does not respond on my device.' },
    { ...pick(6), subject: 'Need to update my address', message: 'I need to update my home address on file for tax purposes.' },
  ];
  const createdQueries = [];
  for (const seed of querySeeds) {
    const created = await call('/api/queries', {
      method: 'POST',
      body: { employee: seed.id, name: seed.name, subject: seed.subject, message: seed.message },
    });
    createdQueries.push(created.query ?? created);
    console.log(`  + query from ${seed.name}`);
  }

  if (createdQueries[1]?.id || createdQueries[1]?._id) {
    const id = createdQueries[1].id || createdQueries[1]._id;
    await call(`/api/queries/${id}`, {
      method: 'PATCH',
      body: { answer: 'This has been fixed. Please try downloading again from Payroll.' },
    });
    console.log(`  ~ answered query from ${querySeeds[1].name}`);
  }
  console.log('');

  // ---------------- Payroll ----------------
  console.log('Initiating a payroll run...');
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  const fmt = (d) => d.toISOString().split('T')[0];
  const payrollRes = await call('/api/payroll/initiate', {
    method: 'POST',
    body: { startDate: fmt(start), endDate: fmt(end) },
  });
  console.log('  + payroll run created:', JSON.stringify(payrollRes.payrollRun ?? payrollRes));

  console.log('\nDone. Refresh the dashboard to see the seeded data.');
}

main().catch((err) => {
  console.error('\nSeeding failed:', err.message);
  process.exit(1);
});
