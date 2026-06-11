# Admin subdomain — `admin.sirivruddhi.com`

## DNS (GoDaddy)

Add a record pointing the admin subdomain to Hostinger:

| Type  | Name  | Value                    |
|-------|-------|--------------------------|
| CNAME | admin | your Hostinger hostname  |

Use the same target as `www` / root (often shown in Hostinger → Domains → DNS).

## Hostinger

1. In hPanel, add subdomain **`admin`** (or use Websites → Subdomains).
2. Set its document root to a folder, e.g. `public_html/admin` (or a dedicated site root).
3. Build and upload the Angular app:

```powershell
cd frontend
npm run build:hostinger
```

4. Upload **all files** from `frontend/dist/siri-vruddhi/` into the admin subdomain folder.
5. Include `.htaccess` (SPA rewrite) in that folder.

## Render API

Add to **CORS_ORIGINS**:

```
https://admin.sirivruddhi.com
```

Redeploy the API after saving env vars.

## URLs

| Environment | Admin URL |
|-------------|-----------|
| Production  | https://admin.sirivruddhi.com |
| Local dev   | http://localhost:4200/admin |

Visiting `https://sirivruddhi.com/admin` redirects to `https://admin.sirivruddhi.com`.
