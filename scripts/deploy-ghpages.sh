#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

# derive repo name from remote
REMOTE_URL=$(git config --get remote.origin.url || true)
if [ -z "$REMOTE_URL" ]; then
  echo "No remote origin configured. Set remote.origin.url and retry." >&2
  exit 1
fi
REPO_NAME=$(basename -s .git "$REMOTE_URL")

echo "Repo: $REPO_NAME"

echo "Installing frontend dependencies..."
npm ci --prefix frontend

echo "Building frontend..."
npm run build:github-pages --prefix frontend -- --base-href=/$REPO_NAME/

BUILD_DIR="$ROOT/frontend/dist/$REPO_NAME"
if [ ! -d "$BUILD_DIR" ]; then
  echo "Build output not found at $BUILD_DIR" >&2
  exit 1
fi

echo "Preparing deploy in $BUILD_DIR"
cd "$BUILD_DIR"

# Initialize a temporary git repo in the build directory and force-push to gh-pages
rm -rf .git
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy site: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git remote add origin "$REMOTE_URL"
echo "Pushing to gh-pages branch on origin (force)..."
git push --force origin gh-pages

echo "Deployment complete. Site should be available shortly via GitHub Pages."
