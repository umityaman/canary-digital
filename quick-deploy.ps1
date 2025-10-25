# Simple Manual Deploy Script
Write-Host "Building frontend..." -ForegroundColor Green
cd frontend
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Now run:" -ForegroundColor Cyan
    Write-Host "gcloud run deploy canary-frontend --source . --region=europe-west1 --allow-unauthenticated"
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
cd ..
