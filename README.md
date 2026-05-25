# Siri Vruddhi Event Venue

Event venue website for **Siri Vruddhi**, Nelamangala.

- **Frontend:** Angular 16 (`frontend/`)
- **Backend:** Express API (`backend/`) — for contact form inquiries
- **Database:** MySQL or local JSON file

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

## Host on GitHub (Pages)

This repo can publish the **Angular frontend** to **GitHub Pages** automatically.

### 1. Create the GitHub repository

From the project root (first time only):

```bash
git init
git add .
git commit -m "Initial commit: Siri Vruddhi venue website"
gh repo create siri-vruddhi --public --source=. --remote=origin --push
```

Or create an empty repo on [github.com/new](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/siri-vruddhi.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

1. Open your repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. After the workflow runs, the site will be at:

   `https://YOUR_USERNAME.github.io/siri-vruddhi/`

   (Replace `siri-vruddhi` with your repo name if different.)

Each push to `main` redeploys the site via `.github/workflows/deploy-pages.yml`.

### 3. Large image files

Venue photos in `frontend/src/assets/images/` may be very large. GitHub rejects files over **100 MB** and warns above **50 MB**. Before pushing:

- Compress images (e.g. 1920px wide, JPEG ~80% quality), or
- Use [Git LFS](https://git-lfs.github.com/) for `*.JPG` / `*.jpg`

### 4. Contact form on GitHub Pages

GitHub Pages serves **static files only**. The inquiry form needs the **Express backend** hosted elsewhere (e.g. [Render](https://render.com), [Railway](https://railway.app), or a VPS). Then set the production API URL in `frontend/src/environments/environment.prod.ts` and rebuild.

---

## Project structure

| Path | Description |
|------|-------------|
| `frontend/` | Angular app (home, gallery, contact UI) |
| `backend/` | Express API + `schema.sql` |
| `frontend/src/app/venue-images.ts` | Image paths & gallery catalog |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deployment |

## Features

- Venue landing page with hero carousel
- Gallery with categories and lightbox
- Contact / inquiry form (requires backend when deployed)
- MySQL or local JSON persistence for inquiries
