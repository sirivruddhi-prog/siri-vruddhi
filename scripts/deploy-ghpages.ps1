param(
    [string]$RepoRemoteUrl
)

Set-StrictMode -Version Latest

if (-not $RepoRemoteUrl) {
    $RepoRemoteUrl = git config --get remote.origin.url
}
if (-not $RepoRemoteUrl) {
    Write-Error "No remote.origin.url found. Set git remote or pass -RepoRemoteUrl.";
    exit 1
}

$repoName = [System.IO.Path]::GetFileNameWithoutExtension($RepoRemoteUrl)
Write-Host "Repo: $repoName"

Write-Host "Installing frontend dependencies..."
npm ci --prefix frontend

Write-Host "Building frontend..."
npm run build:github-pages --prefix frontend -- --base-href=/$repoName/

$buildDir = Join-Path -Path (Get-Location).Path -ChildPath "frontend\dist\$repoName"
if (-not (Test-Path $buildDir)) {
    Write-Error "Build output not found at $buildDir"
    exit 1
}

Push-Location $buildDir

# Remove any existing git data and create a new repo to push
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy site: $(Get-Date -Format o)"
git remote add origin $RepoRemoteUrl
Write-Host "Pushing to gh-pages branch on origin (force)..."
git push --force origin gh-pages

Pop-Location
Write-Host "Deployment complete. Site should be available shortly via GitHub Pages."
