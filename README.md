# PaisaBook — Payment Entry PWA

Split into separate **frontend** and **backend** folders.

## Structure

```
payment-/
??? frontend/   # Next.js UI + PWA
??? backend/    # Node.js (Express) API + MongoDB
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API runs on [http://localhost:5000](http://localhost:5000)

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000)

Frontend proxies `/api/*` to the backend (`BACKEND_URL`).

## Features

- Register / Login (JWT cookie auth)
- Income and expense entries
- Source, category, note, date + time
- Dashboard totals + cashflow chart
- Search / filter / CSV export
- Light + Dark theme
- Installable PWA

## Environment

**backend/.env**
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL=http://localhost:3000`
- `PORT=5000`

**frontend/.env.local**
- `BACKEND_URL=http://localhost:5000`

## Security

Do not commit `.env` files. Rotate MongoDB passwords if they were ever shared publicly.
