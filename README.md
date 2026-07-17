# Payment Ledger — Frontend

Next.js PWA for income/expense payment entry.

## Live Backend

`https://backend-repo-tawny.vercel.app`

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel

1. Import this repo
2. Framework: **Next.js** (root directory = `.`)
3. Add env:
   - `BACKEND_URL` = `https://backend-repo-tawny.vercel.app`

On the backend Vercel project, set:
- `FRONTEND_URL` = your frontend Vercel URL (e.g. `https://payment-xxx.vercel.app`)
- `MONGODB_URI`
- `JWT_SECRET`

## Features

- Login / Register
- Add / Edit / Delete entries
- Import / Export CSV
- Filters (date, day, time, type)
- Light / Dark theme
- PWA
