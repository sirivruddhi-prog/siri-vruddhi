# Deployment Guide

This project can be deployed in two ways:

---

## Option A: Deploy to Hostinger (Production — sirivruddhi.com)

### Prerequisites

- Domain `sirivruddhi.com` (GoDaddy)
- Hosting plan on Hostinger
- Node.js installed locally (for building)

### 1. Build the frontend

```powershell
cd frontend
npm install
npm run build:hostinger
```

Build output goes to `frontend/dist/siri-vruddhi/` (includes `.htaccess` for Apache/Hostinger).

### 2. Upload to Hostinger

Upload **everything inside** `frontend/dist/siri-vruddhi/` to Hostinger **`public_html/`** (the website root for sirivruddhi.com).

```
Hostinger File Manager
└── public_html/          ← upload HERE (not a subfolder)
    ├── .htaccess         ← required for /gallery and other routes
    ├── index.html
    ├── favicon.ico
    ├── main.*.js
    ├── polyfills.*.js
    ├── runtime.*.js
    ├── styles.*.css
    ├── 3rdpartylicenses.txt
    └── assets/
        └── images/
```

Steps:

1. Log in to **Hostinger hPanel** → **File Manager**
2. Open **`public_html/`**
3. Select all old site files (keep nothing except what you need) and delete, or overwrite on upload
4. Upload **all contents** of `frontend/dist/siri-vruddhi/` into **`public_html/`** directly
5. Confirm **`.htaccess`** is visible in `public_html/` (enable “show hidden files” in File Manager if needed)

Do **not** upload the `dist` or `siri-vruddhi` folder itself — only its **contents** go into `public_html/`.

Alternatively, use **FTP** (FileZilla / WinSCP) with credentials from hPanel → FTP Accounts.

### 3. DNS Setup (GoDaddy → Hostinger)

**Option A — Change nameservers (recommended):**
1. In Hostinger hPanel, find your nameservers (e.g., `ns1.dns-parking.com`, `ns2.dns-parking.com`)
2. In GoDaddy → My Domains → sirivruddhi.com → DNS → Nameservers → Change to Custom
3. Enter Hostinger's nameservers and save

**Option B — A records in GoDaddy:**
1. In Hostinger, find your hosting IP address
2. In GoDaddy DNS, add:
   - A record: `@` → Hostinger IP
   - A record: `www` → Hostinger IP (or CNAME `www` → `sirivruddhi.com`)

DNS propagation takes up to 24–48 hours (usually 1–2 hours).

### 4. SSL (HTTPS)

1. Hostinger hPanel → SSL → Install free SSL for `sirivruddhi.com`
2. Enable "Force HTTPS" redirect

### 5. Backend (Contact Form)

The Express backend requires a Node.js host. If your Hostinger plan is shared hosting:

- Deploy the `backend/` to [Render](https://render.com), [Railway](https://railway.app), or similar
- Update `frontend/src/environments/environment.prod.ts` with the backend URL
- Rebuild and re-upload the frontend

If your Hostinger plan includes Node.js (VPS/Cloud), run the backend there.

### Re-deploying after changes

```powershell
cd frontend
npm run build:hostinger
```

Then re-upload **all contents** of `frontend/dist/siri-vruddhi/` to **`public_html/`**.

---

## Option B: Deploy to GitHub Pages (Alternative)

This repository includes two scripts that let you deploy the built frontend to the `gh-pages` branch without using GitHub Actions.

Options
- Bash (Linux/macOS/Windows w/ Git Bash): `scripts/deploy-ghpages.sh`
- PowerShell (Windows / pwsh): `scripts/deploy-ghpages.ps1`

How it works
- Installs frontend dependencies and builds the Angular app.
- Initializes a temporary git repository inside the build output directory (`frontend/dist/<repo-name>`), commits the static files, and force-pushes them to the `gh-pages` branch on `origin`.

Quick steps (Bash)
```bash
# from repo root
npm run --prefix scripts deploy:ghpages:sh
```

Quick steps (PowerShell)
```powershell
# from repo root
npm run --prefix scripts deploy:ghpages:ps1
```

Notes
- You must have push access to the repository `origin` for the force-push to succeed.
- The scripts derive the repository name from `git remote get-url origin` to place the correct `base-href` during build.
- This approach avoids running CI on GitHub and so is not subject to Actions usage limits.
