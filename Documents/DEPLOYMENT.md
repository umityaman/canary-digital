# 🚀 CANARY - Deployment Guide

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Production environment variables configured
- [ ] Database migrated to PostgreSQL
- [ ] SSL certificates obtained
- [ ] Domain names configured
- [ ] CDN setup (optional)
- [ ] Monitoring tools configured
- [ ] Backup strategy in place

### Code Preparation
- [ ] All tests passed
- [ ] No console.log statements in production
- [ ] Error handling reviewed
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Documentation updated

### Third-Party Services
- [ ] Email service configured (SendGrid, AWS SES)
- [ ] SMS service configured (Twilio, etc.)
- [ ] Push notification service (Expo, FCM)
- [ ] Payment gateway (Stripe, PayPal)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Error tracking (Sentry)

---

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

#### Step 1: Prepare Project
```bash
cd backend

# Create production env file
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/canary
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=https://canary-frontend.vercel.app
EOF
```

#### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Choose `backend` directory
5. Add environment variables from `.env.production`
6. Click "Deploy"

#### Step 3: Setup Database
```bash
# Railway will provide PostgreSQL database
# Copy DATABASE_URL from Railway dashboard
# Update .env.production

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

#### Step 4: Verify Deployment
```bash
# Test health endpoint
curl https://your-backend.railway.app/health

# Test API docs
open https://your-backend.railway.app/api-docs
```

---

### Option 2: Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Configure vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Deploy
```bash
cd backend
vercel --prod
```

---

### Option 3: AWS EC2

#### Step 1: Launch EC2 Instance
- Ubuntu 22.04 LTS
- t3.medium (2 vCPU, 4GB RAM)
- 20GB SSD storage
- Security Group: Allow ports 22, 80, 443, 3000

#### Step 2: Connect and Setup
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo/canary.git
cd canary/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name canary-backend
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx
```nginx
# /etc/nginx/sites-available/canary-backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/canary-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Prepare Project
```bash
cd frontend

# Update API URL
cat > .env.production << EOF
VITE_API_URL=https://your-backend.railway.app
EOF
```

#### Step 2: Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select `frontend` directory as root
5. Framework Preset: Vite
6. Add environment variable: `VITE_API_URL`
7. Click "Deploy"

#### Step 3: Configure Domain
- Add custom domain in Vercel settings
- Update DNS records with your domain provider
- SSL certificate auto-configured

---

### Option 2: Netlify

#### Step 1: Build Settings
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://your-backend.railway.app"
```

#### Step 2: Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

---

### Option 3: AWS S3 + CloudFront

#### Step 1: Build Project
```bash
cd frontend
npm run build
```

#### Step 2: Create S3 Bucket
```bash
aws s3 mb s3://canary-frontend
aws s3 website s3://canary-frontend --index-document index.html
```

#### Step 3: Upload Files
```bash
aws s3 sync dist/ s3://canary-frontend --delete
```

#### Step 4: Setup CloudFront
1. Create CloudFront distribution
2. Origin: S3 bucket
3. Viewer Protocol Policy: Redirect HTTP to HTTPS
4. Custom SSL certificate (from ACM)
5. Default Root Object: index.html

---

## 📱 Mobile App Deployment

### iOS Deployment

#### Step 1: Configure App
```bash
cd mobile

# Update app.json
{
  "expo": {
    "name": "CANARY",
    "slug": "canary",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.canary",
      "buildNumber": "1"
    }
  }
}
```

#### Step 2: Build with EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

#### Step 3: Submit to App Store
```bash
# Submit to App Store
eas submit --platform ios

# Or download IPA and upload manually via Transporter
```

---

### Android Deployment

#### Step 1: Configure App
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.canary",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

#### Step 2: Build APK/AAB
```bash
# Build for Android
eas build --platform android

# Choose AAB for Play Store
# Choose APK for direct distribution
```

#### Step 3: Submit to Play Store
```bash
# Submit to Play Store
eas submit --platform android
```

---

## 🐳 Docker Deployment

### Production Docker Compose

Create `docker-compose.production.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: canary
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: canary
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - canary-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://canary:${DB_PASSWORD}@postgres:5432/canary
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - canary-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: ${API_URL}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - canary-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    networks:
      - canary-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  canary-network:
    driver: bridge
```

### Deploy with Docker
```bash
# Set environment variables
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
export API_URL=https://api.yourdomain.com

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose logs -f

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

---

## 🔒 Security Hardening

### Backend Security
```bash
# Install security packages
npm install helmet express-rate-limit hpp express-mongo-sanitize xss-clean

# Update environment variables
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Database Security
```sql
-- Create read-only user for analytics
CREATE USER canary_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE canary TO canary_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO canary_readonly;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
```

### SSL/TLS Configuration
```bash
# Generate SSL certificate with Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring Setup

### 1. Sentry for Error Tracking

```bash
# Backend
npm install @sentry/node

# Frontend
npm install @sentry/react

# Mobile
npx expo install sentry-expo
```

**Backend Configuration:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. PM2 Monitoring

```bash
# Install PM2
npm install -g pm2

# Start app with monitoring
pm2 start ecosystem.config.js

# Enable monitoring
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### 3. Uptime Monitoring

Services:
- UptimeRobot (free)
- Pingdom
- StatusCake

### 4. Application Monitoring

Tools:
- New Relic
- DataDog
- AWS CloudWatch

---

## 💾 Backup Strategy

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# PostgreSQL backup
pg_dump -U canary -h localhost canary > $BACKUP_DIR/backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://canary-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Cron Job
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/ubuntu/scripts/backup.sh
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm install -g vercel
          vercel --prod --token $VERCEL_TOKEN
```

---

## ✅ Post-Deployment Checklist

### Verification
- [ ] Backend health check responds
- [ ] Frontend loads correctly
- [ ] API endpoints work
- [ ] Database connected
- [ ] Authentication works
- [ ] Mobile app connects to API
- [ ] Notifications working
- [ ] File uploads work
- [ ] SSL certificate valid

### Monitoring
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Performance metrics tracked
- [ ] Logs accessible
- [ ] Alerts configured

### Documentation
- [ ] Deployment notes documented
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Team notified
- [ ] Changelog updated

---

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### 2. CORS Errors
```typescript
// backend/src/app.ts
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

#### 3. Build Failures
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check expiration
sudo certbot certificates
```

---

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs` or `docker-compose logs`
- Review documentation: `/docs`
- Contact DevOps team
- Open GitHub issue

---

## 🎉 Success!

Your CANARY application is now deployed and running in production! 🚀

**Live URLs:**
- Frontend: https://yourdomain.com
- Backend API: https://api.yourdomain.com
- API Docs: https://api.yourdomain.com/api-docs
- Mobile App: Available on App Store & Play Store

**Next Steps:**
1. Monitor application performance
2. Gather user feedback
3. Plan feature enhancements
4. Regular security audits
5. Performance optimization

---

**Last Updated**: October 13, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
