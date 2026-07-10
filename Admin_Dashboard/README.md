# ProJenius Admin Dashboard

Frontend-only React admin dashboard (Vite + Tailwind via CDN). Dummy data, no backend.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

This creates a `dist/` folder with the final static site — that's what you deploy.

## Deploy to Netlify

**Option A — drag and drop (fastest):**
1. Run `npm run build` locally.
2. Go to https://app.netlify.com/drop
3. Drag the `dist/` folder onto the page. You'll get a live URL instantly.

**Option B — connect Git (auto-deploys on every push):**
1. Push this project to a GitHub repo.
2. On Netlify, click "Add new site" → "Import an existing project" → pick the repo.
3. Build command: `npm run build`, Publish directory: `dist` (already set in `netlify.toml`).
4. Deploy — Netlify rebuilds automatically every time you push.

## Project structure

```
src/
  components/   Reusable UI pieces (Card, Avatar, TopNav, modals, calendar)
  pages/        One file per section (Dashboard, LeaveRequests, Queries, Employees, Payroll)
  data/         Dummy data — swap for real API calls later
  utils/        Shared helper functions
  theme.js      Brand colors in one place
  App.jsx       Wires everything together
```
