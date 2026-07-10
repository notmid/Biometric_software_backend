# Attendance System Backend (MERN)

REST API for the ProJenius admin dashboard. Built so the same endpoints can
be reused by the mobile app later — nothing here is web-specific.

## Stack

Node.js + Express + MongoDB (Mongoose) + JWT auth.

## Project structure

```
src/
  config/db.js           MongoDB connection
  models/                Mongoose schemas (Employee, AttendanceLog, LeaveForm, Query, Payroll, WorkingDaysData, Admin)
  middleware/auth.js      JWT verification (protects routes)
  middleware/errorHandler.js
  controllers/            Business logic per resource
  routes/                 Route definitions (map URLs -> controllers)
  scripts/seed.js         Creates a test admin login + sample employees
  server.js               App entry point
```

## 1. Install MongoDB

You need a MongoDB instance to connect to. Two options:

**Option A — MongoDB Atlas (free, no local install, recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
2. Create a free "M0" cluster
3. Under "Database Access," create a user with a password
4. Under "Network Access," allow access from your current IP (or `0.0.0.0/0` while testing)
5. Click "Connect" → "Drivers" → copy the connection string, it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/attendance`

**Option B — Install MongoDB locally**
- Mac: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
- Windows: download the installer from https://www.mongodb.com/try/download/community
- Then your connection string is just: `mongodb://127.0.0.1:27017/attendance`

## 2. Set up the project

```bash
cd attendance-backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your connection string from step 1
- `JWT_SECRET` — any long random string. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

## 3. Seed test data

```bash
npm run seed
```

This creates:
- An admin login: **email `admin@projenius.com` / password `admin123`**
- 5 sample employees

## 4. Run the server

```bash
npm run dev
```

You should see:
```
MongoDB connected: <your cluster host>
Server running on http://localhost:5000
```

## 5. Test it

**Quickest way — your browser + a REST client.** Install the free **Postman** app (postman.com/downloads), or use `curl` from a terminal.

### Log in first (every other endpoint requires this token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projenius.com","password":"admin123"}'
```

You'll get back:
```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "admin": { "name": "Admin User", ... } }
```

Copy that `token` value — you need it for every request below.

### Then call any other endpoint, with the token attached

```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer PASTE_YOUR_TOKEN_HERE"
```

### Full endpoint list

| Method | Endpoint | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | No | Log in, get a token |
| GET | `/api/auth/me` | Yes | Check who the current token belongs to |
| GET | `/api/employees` | Yes | List all employees |
| POST | `/api/employees` | Yes | Add an employee |
| PATCH | `/api/employees/:id` | Yes | Update an employee |
| DELETE | `/api/employees/:id` | Yes | Remove an employee |
| GET | `/api/leave-requests` | Yes | List all leave requests |
| POST | `/api/leave-requests` | Yes | Submit a new leave request |
| PATCH | `/api/leave-requests/:id` | Yes | Approve/decline + optional note |
| GET | `/api/queries` | Yes | List all queries |
| POST | `/api/queries` | Yes | Submit a new query |
| PATCH | `/api/queries/:id` | Yes | Answer a query |
| GET | `/api/payroll` | Yes | List past payroll runs |
| POST | `/api/payroll/initiate` | Yes | Run payroll for a date range |
| GET | `/api/attendance/today-summary` | Yes | Present/total count for today |
| GET | `/api/attendance/calendar?month=7&year=2026` | Yes | Full month attendance calendar |
| GET | `/api/reports/monthly?month=7&year=2026` | Yes | Department + employee monthly report |
| GET | `/api/health` | No | Confirms the server is up |

## 6. Connect it to your React dashboard

In your frontend project, add a config file:

```js
// src/config.js
export const API_BASE_URL = 'http://localhost:5000/api';
```

Then in `App.jsx`, replace the dummy data with real fetches. Example for employees:

```js
import { API_BASE_URL } from './config';

useEffect(() => {
  const token = localStorage.getItem('token');
  fetch(`${API_BASE_URL}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(setEmployees);
}, []);
```

And update your login flow to call the real endpoint and store the token:

```js
const res = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
localStorage.setItem('token', data.token);
localStorage.setItem('adminUser', JSON.stringify(data.admin));
```

I can wire this up for you directly once you're ready — just say so.

## 7. About the mobile app later

None of these routes are web-specific — they're plain REST resources. When
you build the mobile app's backend calls, it hits the exact same endpoints
(e.g. `POST /api/leave-requests`, `GET /api/employees`). The one new endpoint
you'll add later is something like `POST /api/attendance/verify` that accepts
the image + video and runs your face-recognition model — that wasn't built
yet since you asked to focus on the website first.

## 8. Deploying this backend so your mobile app / live dashboard can reach it

Same idea as deploying the frontend — Render or Railway both support Node
+ MongoDB Atlas easily:
1. Push this project to a GitHub repo
2. On Render.com: "New Web Service" → connect the repo → Build command `npm install` → Start command `npm start`
3. Add your `.env` values as environment variables in Render's dashboard (never commit `.env` itself)
4. Once deployed, you'll get a URL like `https://attendance-backend.onrender.com` — that becomes your `API_BASE_URL`
