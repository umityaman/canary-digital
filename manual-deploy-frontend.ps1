# Manual Frontend Deployment Script
# Use this if GitHub Actions fails

Write-Host "🚀 Manual Frontend Deployment Started" -ForegroundColor Green
Write-Host ""

# Navigate to frontend
Set-Location frontend

# Clean build
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .env.production -Force -ErrorAction SilentlyContinue

# Create production env
Write-Host "📝 Creating .env.production..." -ForegroundColor Yellow
Set-Content -Path .env.production -Value "VITE_API_URL=https://canary-backend-672344972017.europe-west1.run.app"
Write-Host "Content:" -ForegroundColor Cyan
Get-Content .env.production

# Build
Write-Host ""
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Verify dist
Write-Host "📦 Verifying build output..." -ForegroundColor Yellow
Get-ChildItem dist -Recurse | Select-Object -First 10

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Google Cloud Console" -ForegroundColor White
Write-Host "2. Navigate to Cloud Run > canary-frontend" -ForegroundColor White
Write-Host "3. Click 'Edit & Deploy New Revision'" -ForegroundColor White
Write-Host "4. Deploy from this dist folder" -ForegroundColor White
Write-Host ""
Write-Host "Or use gcloud CLI:" -ForegroundColor Cyan
Write-Host '  cd frontend' -ForegroundColor White
Write-Host '  gcloud run deploy canary-frontend --source . --region=europe-west1' -ForegroundColor White

Set-Location ..
