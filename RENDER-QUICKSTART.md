# Render setup — fill this screen exactly

You are on **New Blueprint**. Render **did** find the service — look under **Review Blueprint configurations** for **Create web service siri-vruddhi-api**. That is correct.

## Why it looks “stuck”

Two fields on that page are **required** and easy to miss:

| Field | What to enter |
|-------|----------------|
| **Blueprint Name** (top of page, red if empty) | `siri-vruddhi` |
| **DB_USER** (under Specified configurations) | `u914954551_siri_admin` |

Without **Blueprint Name**, the **Apply** button will not work.

---

## Complete form (copy/paste)

### Top section

| Field | Value |
|-------|--------|
| Blueprint Name | `siri-vruddhi` |
| Branch | `main` |
| Blueprint Path | `./render.yaml` |

### Specified configurations (secrets)

| Variable | Value |
|----------|--------|
| `DB_HOST` | `auth-db1553.hstgr.io` |
| `DB_USER` | `u914954551_siri_admin` |
| `DB_PASSWORD` | *(your Hostinger MySQL password)* |
| `DB_DATABASE` | `u914954551_sirivruddhi_db` |

Click **Apply** (or **Deploy Blueprint**). Wait until **siri-vruddhi-api** shows **Live** (~2–5 min).

---

## After deploy — Step 3: Test API

Open in browser (replace with your Render URL if different):

```text
https://siri-vruddhi-api.onrender.com/api/health
```

Success:

```json
{"status":"ok","service":"Siri Vruddhi Backend","db":"mysql"}
```

If `"Database connection failed"`:

1. Hostinger → **Remote MySQL** → host **`%`** must exist  
2. Render → **Environment** → verify all four `DB_*` values  
3. Try `DB_SSL` = `false`, **Save** → **Manual Deploy**

---

## Step 4: Custom domain `api.sirivruddhi.com`

**Render:** Service → **Settings → Custom Domains** → add `api.sirivruddhi.com`

**GoDaddy DNS:**

| Type | Name | Value |
|------|------|--------|
| CNAME | `api` | `siri-vruddhi-api.onrender.com` *(use exact target Render shows)* |

Test: `https://api.sirivruddhi.com/api/health`

---

## Step 5: Update live website

```powershell
cd frontend
npx ng build --configuration production --base-href /
```

Upload `frontend/dist/siri-vruddhi/*` to Hostinger `public_html/`.

---

## Step 6: Test contact form

Submit inquiry on sirivruddhi.com → check **phpMyAdmin → inquiries** table.

---

## Plan B — Manual Web Service (skip Blueprint)

If Blueprint keeps failing:

1. **New → Web Service** (not Blueprint)  
2. Repo: `sirivruddhi-prog/siri-vruddhi`  
3. **Root Directory:** `backend`  
4. **Build:** `npm install` · **Start:** `npm start` · **Health check:** `/api/health`  
5. Add all env vars from `backend/.env.example`  
6. Deploy
