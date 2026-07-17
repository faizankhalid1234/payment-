# Payment Ledger — Frontend

Next.js frontend (PWA) for payment entry.

## Backend

Backend is in a separate repository:
[https://github.com/faizankhalid1234/backend-repo](https://github.com/faizankhalid1234/backend-repo)

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set `BACKEND_URL` in `.env.local` to your backend API URL (default `http://localhost:5000`).

App: [http://localhost:3000](http://localhost:3000)

## Features

- Login / Register (secure password auth)
- Income & expense entries
- Edit / delete entries
- Import & export CSV
- Filters (date, day, time, type, search)
- Light / dark theme
- Installable PWA
