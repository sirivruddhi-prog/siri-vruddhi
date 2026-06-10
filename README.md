# Siri Vruddhi Event Venue

Event venue website for **Siri Vruddhi**, Nelamangala.

- **Frontend:** Angular 16 (`frontend/`)
- **Backend:** Express API (`backend/`) — for contact form inquiries
- **Database:** MySQL or local JSON file
- **Domain:** [sirivruddhi.com](https://sirivruddhi.com) (GoDaddy)
- **Hosting:** Hostinger

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Runs at `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:4200`.

---

## Production Deployment (Hostinger)

See [DEPLOY.md](DEPLOY.md) for full instructions covering:

1. Building the Angular frontend for production
2. Uploading files to Hostinger via File Manager or FTP
3. DNS setup (GoDaddy → Hostinger)
4. SSL certificate installation
5. Backend deployment for the contact form

### Quick deploy

```powershell
cd frontend
npm install
npx ng build --configuration production --base-href /
# Upload contents of frontend/dist/siri-vruddhi/ to Hostinger public_html/
```

---

## Backend + database (Render + Hostinger MySQL)

See **[DEPLOY-BACKEND.md](DEPLOY-BACKEND.md)** for:

- Hostinger MySQL setup and `schema.sql` import
- Render deployment via `render.yaml` blueprint
- DNS for `api.sirivruddhi.com`
- Rebuilding the frontend for the live contact form

---

| Path | Description |
|------|-------------|
| `frontend/` | Angular app (home, gallery, contact UI) |
| `frontend/.htaccess` | Apache rewrite rules for SPA routing on Hostinger |
| `backend/` | Express API + `schema.sql` |
| `frontend/src/app/venue-images.ts` | Image paths & gallery catalog |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deployment (alternative) |
| `DEPLOY.md` | Full deployment guide |

## Features

- Venue landing page with hero carousel
- Gallery with categories and lightbox
- Contact / inquiry form (requires backend when deployed)
- MySQL or local JSON persistence for inquiries

