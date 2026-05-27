# Deploy to GitHub Pages (no GitHub Actions required)

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
- The scripts derive the repository name from `git remote get-url origin` to place the correct `base-href` during build. If your remote URL is non-standard, pass a `RepoRemoteUrl` parameter to the PowerShell script or update the script accordingly.
- This approach avoids running CI on GitHub and so is not subject to Actions usage limits (you run it from your machine or a server you control).

If you want me to instead add a self-contained serverless or external CI deployment (Netlify, Vercel, or GitHub Pages via `gh` CLI), tell me which provider and I will add configuration.
