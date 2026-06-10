# Backend on Render + MySQL on Hostinger

This guide connects **sirivruddhi.com** (static site on Hostinger) to **api.sirivruddhi.com** (Express API on Render) using **MySQL on Hostinger**.

---

## Architecture

```
Visitor → sirivruddhi.com (Hostinger, Angular static files)
       → api.sirivruddhi.com (Render, Node/Express)
       → MySQL (Hostinger, remote access enabled)
```

---

## Part 1 — Hostinger MySQL

### 1. Create database

1. Log in to **Hostinger hPanel**
2. **Databases → MySQL Databases**
3. Create a new database (e.g. `u123456789_sirivruddhi`)
4. Create a user with a strong password and assign it to the database
5. Note these values (you will need them on Render):

   | Setting | Example | Your value |
   |---------|---------|------------|
   | **DB_HOST** | `auth-db1553.hstgr.io` (from hPanel / phpMyAdmin URL) | __________ |
   | **DB_USER** | `u123456789_admin` | __________ |
   | **DB_PASSWORD** | (your password) | __________ |
   | **DB_DATABASE** | `u123456789_sirivruddhi` | __________ |

### 2. Import schema

1. hPanel → **phpMyAdmin** → click your database in the left sidebar (e.g. `u914954551_sirivruddhi_db`)
2. **Import** → choose `backend/schema.sql` from this repo
3. Run import — you should see an `inquiries` table

> **Hostinger note:** Do not use `CREATE DATABASE` in the SQL file. Your database is already created in hPanel. If import fails with “Access denied to database `siri_vruddhi`”, you are using an old schema file — pull the latest `schema.sql` from this repo (it only creates the `inquiries` table).

### 3. Allow remote connections (required for Render)

1. hPanel → **Databases → Remote MySQL**
2. Add access host: **`%`** (any host)  
   Render uses changing IPs; Hostinger requires this for external API servers.
3. Save

> If `%` is not allowed on your plan, check Hostinger docs or contact support for Render IP allowlisting.

---

## Part 2 — Deploy API to Render

### Option A — Blueprint (recommended)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. **New → Blueprint**
3. Connect repo: `sirivruddhi-prog/siri-vruddhi`
4. Render reads `render.yaml` at the repo root
5. When prompted, enter secret env vars:

   | Variable | Value |
   |----------|--------|
   | `DB_HOST` | Hostinger MySQL hostname |
   | `DB_USER` | Hostinger MySQL user |
   | `DB_PASSWORD` | Hostinger MySQL password |
   | `DB_DATABASE` | Hostinger database name |

6. Click **Apply** — deploy takes ~2–5 minutes
7. Test: `https://siri-vruddhi-api.onrender.com/api/health`  
   Expected: `{"status":"ok","service":"Siri Vruddhi Backend","db":"mysql"}`

### Option B — Manual web service

1. **New → Web Service** → connect GitHub repo
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Health Check Path:** `/api/health`
6. Add environment variables from `backend/.env.example`
7. Deploy

---

## Part 3 — Custom domain `api.sirivruddhi.com`

### On Render

1. Open your web service → **Settings → Custom Domains**
2. Add `api.sirivruddhi.com`
3. Render shows a **CNAME target** (e.g. `siri-vruddhi-api.onrender.com`)

### On GoDaddy (DNS for sirivruddhi.com)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `api` | `siri-vruddhi-api.onrender.com` | 600 |

Wait 5–30 minutes, then test:

```text
https://api.sirivruddhi.com/api/health
```

---

## Part 4 — Update the live website

The frontend is already configured to call `https://api.sirivruddhi.com/api`.

Rebuild and upload to Hostinger:

```powershell
cd frontend
npm install
npx ng build --configuration production --base-href /
```

Upload everything inside `frontend/dist/siri-vruddhi/` to Hostinger `public_html/` (include `.htaccess`).

### Test the contact form

1. Open https://sirivruddhi.com → scroll to **Plan Your Celebration**
2. Submit a test inquiry
3. In Hostinger **phpMyAdmin**, check the `inquiries` table for the new row

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Health returns `"Database connection failed"` | Check `DB_*` vars on Render; verify Remote MySQL `%` on Hostinger |
| SSL connection error | Set `DB_SSL=true` on Render (already in `render.yaml`) |
| CORS error in browser | Ensure `CORS_ORIGINS` includes `https://sirivruddhi.com` |
| Form works locally but not live | Rebuild frontend after changing `environment.prod.ts` and re-upload |
| Render free tier slow first request | Free services sleep after inactivity; upgrade to Starter ($7/mo) for always-on |

### Test DB locally before Render

Create `backend/.env` from `.env.example` with Hostinger credentials:

```powershell
cd backend
npm install
node scripts/test-db.js
```

---

## Environment reference (Render)

| Variable | Production value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `DB_TYPE` | `mysql` |
| `DB_SSL` | `true` |
| `DB_HOST` | from Hostinger hPanel |
| `DB_PORT` | `3306` |
| `DB_USER` | from Hostinger |
| `DB_PASSWORD` | from Hostinger |
| `DB_DATABASE` | from Hostinger |
| `CORS_ORIGINS` | `https://sirivruddhi.com,https://www.sirivruddhi.com` |
