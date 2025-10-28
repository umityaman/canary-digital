# PowerShell script for Google Cloud Run deployment
# Canary Digital - Windows deployment

Write-Host "🚀 Starting GCP Deployment for Canary Digital..." -ForegroundColor Green

# Configuration
$PROJECT_ID = "canary-digital"
$REGION = "europe-west1"
$DB_INSTANCE = "canary-postgres"
$BACKEND_SERVICE = "canary-backend"
$FRONTEND_SERVICE = "canary-frontend"

# Check if gcloud is installed
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found!" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install-sdk#windows" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ gcloud CLI found" -ForegroundColor Green

# Set project
Write-Host "📦 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Enable APIs
Write-Host "🔌 Enabling required APIs..." -ForegroundColor Yellow
$apis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "secretmanager.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Cyan
    gcloud services enable $api
}

# Create Cloud SQL instance
Write-Host "🗄️  Checking Cloud SQL instance..." -ForegroundColor Yellow
$instanceExists = $(gcloud sql instances describe $DB_INSTANCE 2>$null)
if (-not $instanceExists) {
    Write-Host "Creating new Cloud SQL instance..." -ForegroundColor Green
    gcloud sql instances create $DB_INSTANCE `
        --database-version=POSTGRES_15 `
        --tier=db-f1-micro `
        --region=$REGION `
        --storage-type=SSD `
        --storage-size=10GB `
        --backup `
        --backup-start-time=03:00 `
        --retained-backups-count=7
    Write-Host "✅ Cloud SQL instance created!" -ForegroundColor Green
    # Generate secure password
    $securePassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    # Set postgres password
    Write-Host "🔑 Setting postgres password..." -ForegroundColor Yellow
    gcloud sql users set-password postgres `
        --instance=$DB_INSTANCE `
        --password=$securePassword
    Write-Host "📝 Save this password: $securePassword" -ForegroundColor Magenta
} else {
    Write-Host "✅ Cloud SQL instance already exists" -ForegroundColor Green
}

# --- Cloud SQL işlemi tamamlandı ---

# Create database
Write-Host "📊 Creating database..." -ForegroundColor Yellow
gcloud sql databases create railway --instance=$DB_INSTANCE 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created" -ForegroundColor Green
}
else {
    Write-Host "ℹ️  Database already exists" -ForegroundColor Cyan
}

# Get Cloud SQL connection name
$CONNECTION_NAME = gcloud sql instances describe $DB_INSTANCE --format='value(connectionName)'
Write-Host "Cloud SQL Connection: $CONNECTION_NAME" -ForegroundColor Green

# Deploy Backend
Write-Host "`n🔧 Deploying Backend to Cloud Run..." -ForegroundColor Yellow
Push-Location backend

gcloud run deploy $BACKEND_SERVICE `
    --source . `
    --region=$REGION `
    --platform=managed `
    --allow-unauthenticated `
    --min-instances=0 `
    --max-instances=10 `
    --memory=512Mi `
    --cpu=1 `
    --timeout=300 `
    --set-cloudsql-instances=$CONNECTION_NAME `
    --set-env-vars="NODE_ENV=production" `
    --port=4000

$BACKEND_URL = gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)'
Write-Host "✅ Backend deployed: $BACKEND_URL" -ForegroundColor Green

Pop-Location

# Deploy Frontend
Write-Host "`n🎨 Deploying Frontend to Cloud Run..." -ForegroundColor Yellow
Push-Location frontend

# Create production env file
Write-Host "VITE_API_URL=$BACKEND_URL/api" | Out-File -FilePath .env.production -Encoding utf8

gcloud run deploy $FRONTEND_SERVICE `
    --source . `
    --region=$REGION `
    --platform=managed `
    --allow-unauthenticated `
    --min-instances=0 `
    --max-instances=10 `
    --memory=256Mi `
    --cpu=1 `
    --timeout=60 `
    --port=80

$FRONTEND_URL = gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)'
Write-Host "✅ Frontend deployed: $FRONTEND_URL" -ForegroundColor Green

Pop-Location

# Summary
Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                ║" -ForegroundColor Green
Write-Host "║  🎉 DEPLOYMENT SUCCESSFUL!                     ║" -ForegroundColor Green
Write-Host "║                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  $BACKEND_URL" -ForegroundColor Cyan
Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor Cyan

Write-Host "`n📊 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Map your domain:" -ForegroundColor White
Write-Host "      gcloud run domain-mappings create --service=$FRONTEND_SERVICE --domain=canary-digital.com --region=$REGION" -ForegroundColor Cyan
Write-Host "`n   2. Map API subdomain:" -ForegroundColor White
Write-Host "      gcloud run domain-mappings create --service=$BACKEND_SERVICE --domain=api.canary-digital.com --region=$REGION" -ForegroundColor Cyan
Write-Host "`n   3. Add DNS records in Squarespace (will be provided after domain mapping)" -ForegroundColor White
Write-Host "`n   4. Test your application:" -ForegroundColor White
Write-Host "      Start-Process '$FRONTEND_URL'" -ForegroundColor Cyan

Write-Host "`n🔐 Set secrets (important!):" -ForegroundColor Yellow
Write-Host "   # Create JWT secret" -ForegroundColor White
Write-Host "   echo -n 'your-super-secret-jwt-key' | gcloud secrets create jwt-secret --data-file=-" -ForegroundColor Cyan
Write-Host "`n   # Update backend to use secret" -ForegroundColor White
Write-Host "   gcloud run services update $BACKEND_SERVICE --update-secrets=JWT_SECRET=jwt-secret:latest --region=$REGION" -ForegroundColor Cyan

Write-Host "`n✅ Migration complete! Railway can now be shut down." -ForegroundColor Green
Write-Host "💰 You have $300 free credit for 90 days!" -ForegroundColor Magenta

# Ask to open frontend
$response = Read-Host "`nWould you like to open the frontend now? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process $FRONTEND_URL
}
