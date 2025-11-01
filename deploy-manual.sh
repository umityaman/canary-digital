# Manual Cloud Run Deployment Script
# Run this from project root

# 1. Build Docker image locally
cd backend
docker build -t canary-backend:latest .

# 2. Tag for Google Artifact Registry
docker tag canary-backend:latest europe-west1-docker.pkg.dev/canary-digital-475319/canary/backend:latest

# 3. Configure Docker authentication
gcloud auth configure-docker europe-west1-docker.pkg.dev

# 4. Push image
docker push europe-west1-docker.pkg.dev/canary-digital-475319/canary/backend:latest

# 5. Deploy to Cloud Run
gcloud run deploy canary-backend \
  --image=europe-west1-docker.pkg.dev/canary-digital-475319/canary/backend:latest \
  --region=europe-west1 \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --memory=1Gi \
  --cpu=1 \
  --port=4000 \
  --timeout=300 \
  --set-cloudsql-instances=canary-digital-475319:europe-west1:canary-postgres \
  --update-secrets=JWT_SECRET=jwt-secret:latest \
  --update-secrets=JWT_REFRESH_SECRET=jwt-secret:latest \
  --update-secrets=DATABASE_URL=database-url:latest \
  --set-env-vars="NODE_ENV=production"

echo "✅ Deployment complete!"
gcloud run services describe canary-backend --region=europe-west1 --format="value(status.url)"
