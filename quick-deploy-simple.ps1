# Quick Production Deployment - Using Pre-Built Dist Folder
$ErrorActionPreference = "Stop"

Write-Host "Quick Frontend Deployment Starting..." -ForegroundColor Cyan

# Check if dist folder exists
if (-not (Test-Path "frontend/dist")) {
    Write-Host "ERROR: frontend/dist folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found pre-built dist folder" -ForegroundColor Green

# Configuration
$PROJECT_ID = "canary-digital-475319"
$SERVICE_NAME = "canary-frontend"
$REGION = "europe-west1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$IMAGE_TAG = "$IMAGE_NAME`:$TIMESTAMP"

Write-Host "Building Docker image..." -ForegroundColor Yellow
cd frontend

# Rename Dockerfile.production to Dockerfile temporarily
Copy-Item Dockerfile Dockerfile.backup -Force
Copy-Item Dockerfile.production Dockerfile -Force

gcloud builds submit --tag $IMAGE_TAG --project $PROJECT_ID

# Restore original Dockerfile
Copy-Item Dockerfile.backup Dockerfile -Force
Remove-Item Dockerfile.backup

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully" -ForegroundColor Green
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow

gcloud run deploy $SERVICE_NAME --image $IMAGE_TAG --platform managed --region $REGION --allow-unauthenticated --project $PROJECT_ID --port 8080

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "URL: https://canary-frontend-672344972017.europe-west1.run.app" -ForegroundColor Cyan
