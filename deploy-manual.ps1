# Manual Cloud Run Deployment Script (PowerShell)
# Run this from project root

Write-Host "🚀 Starting manual Cloud Run deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Build Docker image locally
Write-Host "`n📦 Building Docker image..." -ForegroundColor Cyan
cd backend
docker build -t canary-backend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Tag for Google Artifact Registry
Write-Host "`n🏷️  Tagging image..." -ForegroundColor Cyan
docker tag canary-backend:latest europe-west1-docker.pkg.dev/canary-digital-475319/canary/backend:latest

# Configure Docker authentication
Write-Host "`n🔐 Configuring Docker authentication..." -ForegroundColor Cyan
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet

# Push image
Write-Host "`n☁️  Pushing image to Artifact Registry..." -ForegroundColor Cyan
docker push europe-west1-docker.pkg.dev/canary-digital-475319/canary/backend:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Run
Write-Host "`n🚀 Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy canary-backend `
  --image=europe-west1-docker.pkg.dev/canary-digital-475319/canary/backend:latest `
  --region=europe-west1 `
  --platform=managed `
  --allow-unauthenticated `
  --min-instances=0 `
  --max-instances=10 `
  --memory=1Gi `
  --cpu=1 `
  --port=4000 `
  --timeout=300 `
  --set-cloudsql-instances=canary-digital-475319:europe-west1:canary-postgres `
  --update-secrets=JWT_SECRET=jwt-secret:latest `
  --update-secrets=JWT_REFRESH_SECRET=jwt-secret:latest `
  --update-secrets=DATABASE_URL=database-url:latest `
  --set-env-vars="NODE_ENV=production"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host "`n🌐 Service URL:" -ForegroundColor Yellow
    $url = gcloud run services describe canary-backend --region=europe-west1 --format="value(status.url)"
    Write-Host $url -ForegroundColor Cyan
    
    Write-Host "`n🧪 Testing health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$url/api/health" -Method Get
        Write-Host "✅ Health check passed: $($response | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Health check failed. Service may still be starting..." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

cd ..
