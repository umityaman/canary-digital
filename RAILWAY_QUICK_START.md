# Railway Deployment Guide

## 1. Railway'e Git
https://railway.app/

## 2. GitHub ile Login Ol

## 3. "New Project" → "Deploy from GitHub repo"

## 4. "canary-digital" repo'sunu seç

## 5. Root path'i "backend" olarak ayarla

## 6. Environment Variables ekle:
- DATABASE_URL (Railway PostgreSQL'den otomatik gelecek)
- NODE_ENV=production  
- JWT_SECRET=<your-secret>
- JWT_REFRESH_SECRET=<your-secret>

## 7. Deploy!

Railway otomatik olarak:
- Dockerfile'ı detect eder
- Build eder
- Deploy eder
- HTTPS URL verir

## Avantajlar:
✅ Her git push otomatik deploy
✅ Ücretsiz $5/ay credit
✅ Built-in PostgreSQL
✅ Auto SSL/HTTPS
✅ Kolay rollback
✅ Real-time logs

## URL:
https://backend-production-xxxx.up.railway.app
