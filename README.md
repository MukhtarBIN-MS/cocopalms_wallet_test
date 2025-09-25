# Cocopalms Wallet Test

A full-stack demo app where an admin can log in, create Programs (gift card templates), add Users, and issue Google Wallet Gift Cards.

Built with:

- **Frontend**: Next.js 15 (NextJS, TypeScript, Tailwind)
- **Backend**: Express 5 + TypeScript + MongoDB
- **Database**: MongoDB (Atlas or local)
- **Auth**: JWT or cookie-based sessions
- **Wallet**: Google Wallet API (with mock mode for testing)

---

## Project Structure

.
├── apps

     ─ api # Express backend

     ─ web # Next.js frontend

├── docker-compose.yml

├── pnpm-workspace.yaml

└── README.md

yaml
Copy code

---

## ⚡ Hosted Demo

Hosted Submission Link: https://cocopalmswallet.netlify.app/

The live backend (Render) + frontend (Netlify) are connected.  
**Important**: the hosted backend is using **my Google Wallet cloud credentials**.  

👉 For the best experience, **use your own Google Cloud credentials** as shown in the `.env.example` files and run locally.

---

## 1. Running Locally (recommended)

### Prerequisites
- Node.js 20+
- pnpm (run `corepack enable` once to set up)
- MongoDB (Atlas or local)

### Install
```bash

### Clone & Install
git clone <repo>
pnpm install

### Run backend and frontend together
pnpm dev (from root)

### Run backend and frontend separately
pnpm --filter api dev ( from /apps/api )  # backend only
pnpm --filter web dev ( from /apps/web )  # frontend only

### By default
API → http://localhost:4000
Web → http://localhost:3000

### Environment setup
Create `.env` files from the examples:
apps/api/.env.example
**use your own Google Cloud credentials** as shown in the `.env.example` files and run locally.
Download `service-credentials.json` 
GW_ENABLE_MOCK=0  # If you don't have credentials yet, set GW_ENABLE_MOCK=1 to use mock flows
GOOGLE_WALLET_SERVICE_CREDENTIALS_JSON_PATH=/opt/render/project/src/apps/api/service-credentials.json
GOOGLE_WALLET_ISSUER_ID=your-issuer-id
GOOGLE_WALLET_CLASS_ID_PREFIX=your-class-prefix

Others:

PORT=4000
MONGODB_URI=mongodb://root:root@mongodb:27017/cocop?authSource=admin
JWT_SECRET=devsecret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
CORS_ORIGIN:CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

---

## 2. Running with Docker Compose

### Prerequisites
Docker Desktop or Docker Engine

### Run
docker compose up --build

This starts:
MongoDB → port 27017
API → port 4000
Web → port 3000

### Test
API health → http://localhost:4000/healthz
Web → http://localhost:3000

---

## 3. Production Deployment

### Backend → Render
Connect GitHub repo to Render.  
Create a Web Service with Root Directory `apps/api`.

Build Command:
corepack enable && pnpm install --frozen-lockfile && pnpm build

Start Command:
node dist/server.js

Set environment variables:  
Upload `service-credentials.json` in Render Secret Files:
GW_ENABLE_MOCK=0  # If you don't have credentials yet, set GW_ENABLE_MOCK=1 to use mock flows
GOOGLE_WALLET_SERVICE_CREDENTIALS_JSON_PATH=/opt/render/project/src/apps/api/service-credentials.json
GOOGLE_WALLET_ISSUER_ID=your-issuer-id
GOOGLE_WALLET_CLASS_ID_PREFIX=your-class-prefix

---

### Frontend → Netlify
Connect GitHub repo to Netlify.  
Base directory: `apps/web`

Build command:
pnpm install && pnpm build

Publish directory:
.next

Add env variable:
NEXT_PUBLIC_API_BASE_URL=https://<your-api>.onrender.com

---

## Seeding Admin

Locally:
pnpm --filter api seed:admin

On Render (Shell tab):
pnpm seed:admin
