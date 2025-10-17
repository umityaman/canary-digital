# Google Cloud Platform - Deployment Guide
# Canary Digital - Migration from Railway

## 🎯 Quick Start (15 minutes)

### 1. Install Google Cloud CLI
**Windows:**
```powershell
# Download from: https://cloud.google.com/sdk/docs/install-sdk#windows
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

**After installation:**
```powershell
gcloud init
gcloud auth login
```

### 2. Create GCP Project
1. Go to: https://console.cloud.google.com
2. Click "New Project"
3. Name: `canary-digital`
4. Enable billing (gets $300 free credit)

### 3. Deploy to Cloud Run
```powershell
# Make sure you're in project root
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156

# Run deployment script (if on Git Bash/WSL)
bash gcp-deploy.sh

# OR manually (PowerShell):
.\gcp-deploy.ps1
```

---

## 📋 Manual Deployment Steps

### Step 1: Enable APIs
```powershell
gcloud config set project canary-digital

gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 2: Create Cloud SQL (PostgreSQL)
```powershell
gcloud sql instances create canary-postgres `
  --database-version=POSTGRES_15 `
  --tier=db-f1-micro `
  --region=europe-west1 `
  --storage-type=SSD `
  --storage-size=10GB `
  --backup `
  --backup-start-time=03:00

# Create database
gcloud sql databases create railway --instance=canary-postgres

# Set password
gcloud sql users set-password postgres `
  --instance=canary-postgres `
  --password=YOUR_SECURE_PASSWORD
```

### Step 3: Migrate Database
```powershell
# Export from Railway (if accessible)
railway run pg_dump -Fc $DATABASE_URL > railway_backup.dump

# Import to Cloud SQL
gcloud sql import sql canary-postgres gs://YOUR_BUCKET/railway_backup.dump `
  --database=railway
```

### Step 4: Deploy Backend
```powershell
cd backend

gcloud run deploy canary-backend `
  --source . `
  --region=europe-west1 `
  --allow-unauthenticated `
  --min-instances=0 `
  --max-instances=10 `
  --memory=512Mi `
  --cpu=1 `
  --port=4000 `
  --set-cloudsql-instances=canary-digital:europe-west1:canary-postgres `
  --set-env-vars="NODE_ENV=production,JWT_SECRET=your-jwt-secret"
```

### Step 5: Deploy Frontend
```powershell
cd ../frontend

# Update .env with backend URL
$BACKEND_URL = gcloud run services describe canary-backend --region=europe-west1 --format='value(status.url)'
echo "VITE_API_URL=$BACKEND_URL/api" > .env.production

gcloud run deploy canary-frontend `
  --source . `
  --region=europe-west1 `
  --allow-unauthenticated `
  --min-instances=0 `
  --max-instances=10 `
  --memory=256Mi `
  --cpu=1 `
  --port=80
```

### Step 6: Map Custom Domain
```powershell
# Map domain to frontend
gcloud run domain-mappings create `
  --service=canary-frontend `
  --domain=canary-digital.com `
  --region=europe-west1

# Map API subdomain to backend
gcloud run domain-mappings create `
  --service=canary-backend `
  --domain=api.canary-digital.com `
  --region=europe-west1

# Get DNS records to add in Squarespace
gcloud run domain-mappings describe `
  --domain=canary-digital.com `
  --region=europe-west1
```

### Step 7: Add DNS Records in Squarespace
After running domain-mappings, you'll get records like:
```
A Record:
  Name: @
  Value: 216.239.32.21, 216.239.34.21, 216.239.36.21, 216.239.38.21

AAAA Records:
  Name: @
  Value: 2001:4860:4802:32::15, ...

CNAME:
  Name: www
  Value: ghs.googlehosted.com
```

Add these in Squarespace DNS settings.

---

## 💰 Cost Estimation

### Cloud SQL (db-f1-micro)
- Instance: $10/month
- Storage (10GB): $1.70/month
- Backups (7 days): $0.80/month
- **Subtotal: ~$12.50/month**

### Cloud Run - Backend
- 1M requests/month: $0.40
- 360k GB-seconds: $2.16
- CPU: $2.40
- **Subtotal: ~$5/month**

### Cloud Run - Frontend
- 1M requests/month: $0.40
- 180k GB-seconds: $1.08
- CPU: $1.20
- **Subtotal: ~$3/month**

### Load Balancer (for custom domain)
- Forwarding rules: $18/month
- SSL certificate: FREE
- **Subtotal: $18/month**

### Networking
- Egress (10GB): $1.20/month

**TOTAL: ~$40-45/month**

**With $300 free credit: First 6-7 months FREE! 🎉**

---

## 🔐 Security Best Practices

### 1. Use Secret Manager
```powershell
# Store JWT secret
echo -n "your-super-secret-jwt-key" | gcloud secrets create jwt-secret --data-file=-

# Use in Cloud Run
gcloud run services update canary-backend `
  --update-secrets=JWT_SECRET=jwt-secret:latest
```

### 2. Enable Cloud Armor (DDoS Protection)
```powershell
gcloud compute security-policies create canary-security `
  --description="Canary Digital Security Policy"

gcloud compute security-policies rules create 1000 `
  --security-policy=canary-security `
  --expression="origin.region_code == 'CN'" `
  --action=deny-403
```

### 3. Set up IAM
```powershell
# Least privilege principle
gcloud projects add-iam-policy-binding canary-digital `
  --member=serviceAccount:SERVICE_ACCOUNT `
  --role=roles/cloudsql.client
```

---

## 📊 Monitoring & Alerting

### 1. Enable Cloud Monitoring
- Automatic CPU, Memory, Request metrics
- Dashboard: https://console.cloud.google.com/monitoring

### 2. Create Uptime Checks
```powershell
gcloud monitoring uptime create canary-frontend-uptime `
  --resource-type=uptime-url `
  --display-name="Frontend Uptime" `
  --period=60 `
  --timeout=10s `
  --check-interval=1m `
  --monitored-resource=canary-frontend
```

### 3. Set Alerts
- CPU > 80% → Email
- Error rate > 1% → SMS
- Database connection failures → Slack

---

## 🔄 CI/CD with Cloud Build

Create `cloudbuild.yaml`:
```yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend', './backend']
  
  # Push backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/backend']
  
  # Deploy backend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'canary-backend'
      - '--image=gcr.io/$PROJECT_ID/backend'
      - '--region=europe-west1'
      - '--platform=managed'

# Trigger on Git push
timeout: '1800s'
```

Connect to GitHub:
```powershell
gcloud builds triggers create github `
  --repo-name=canary `
  --repo-owner=umityaman `
  --branch-pattern="^main$" `
  --build-config=cloudbuild.yaml
```

---

## 🆘 Troubleshooting

### Error: "Cloud SQL connection failed"
```powershell
# Check instance status
gcloud sql instances describe canary-postgres

# Test connection
gcloud sql connect canary-postgres --user=postgres
```

### Error: "Build failed"
```powershell
# Check Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### Error: "Domain mapping failed"
```powershell
# Verify ownership
gcloud domains verify canary-digital.com

# Check DNS propagation
nslookup canary-digital.com
```

---

## 📞 Support

- GCP Console: https://console.cloud.google.com
- Support: https://cloud.google.com/support
- Status: https://status.cloud.google.com

---

## ✅ Migration Checklist

- [ ] Install gcloud CLI
- [ ] Create GCP project
- [ ] Enable billing ($300 free credit)
- [ ] Enable required APIs
- [ ] Create Cloud SQL instance
- [ ] Migrate database data
- [ ] Deploy backend to Cloud Run
- [ ] Deploy frontend to Cloud Run
- [ ] Map custom domain
- [ ] Add DNS records in Squarespace
- [ ] Test application
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Shut down Railway services

---

**Need help?** Contact GCP Support or check the docs:
https://cloud.google.com/run/docs
