# 🚀 Canary Rental Software - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### Backend
- [x] Production build script configured
- [x] Prisma schema finalized
- [x] Environment variables documented
- [x] Database migrations ready
- [x] API routes tested
- [ ] SSL certificate ready
- [ ] Domain name configured

### Frontend
- [x] Production build optimized
- [x] Environment variables set
- [x] API endpoints configured
- [x] i18n system complete
- [ ] CDN configured (optional)

### Mobile
- [x] Expo build configured
- [x] App icons and splash screens
- [x] Push notification certificates
- [ ] App store accounts ready

---

## 🔧 Backend Deployment (Railway / Heroku / VPS)

### Option 1: Railway (Recommended - Easy)

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 2. Create Project
```bash
cd backend
railway init
```

#### 3. Add PostgreSQL Database
```bash
railway add postgresql
```

#### 4. Set Environment Variables
```bash
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this
railway variables set DATABASE_URL=postgresql://user:password@host:port/database
```

#### 5. Deploy
```bash
railway up
```

#### 6. Run Migrations
```bash
railway run npx prisma migrate deploy
railway run npm run seed
```

### Option 2: Heroku

#### 1. Create Heroku App
```bash
heroku login
cd backend
heroku create canary-rental-backend
```

#### 2. Add PostgreSQL
```bash
heroku addons:create heroku-postgresql:mini
```

#### 3. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key
```

#### 4. Deploy
```bash
git push heroku main
```

#### 5. Run Migrations
```bash
heroku run npx prisma migrate deploy
heroku run npm run seed
```

### Option 3: VPS (DigitalOcean / AWS / Azure)

#### 1. Setup Server (Ubuntu 22.04)
```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

#### 2. Setup PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE canary_rental;
CREATE USER canary_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE canary_rental TO canary_user;
\q
```

#### 3. Clone and Setup Backend
```bash
cd /var/www
git clone YOUR_REPO_URL canary-backend
cd canary-backend

# Install dependencies
npm install

# Setup environment
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://canary_user:secure_password@localhost:5432/canary_rental
JWT_SECRET=your-super-secret-jwt-key-change-this
EOF

# Build
npm run build

# Run migrations
npx prisma migrate deploy
npm run seed
```

#### 4. Setup PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start dist/index.js --name canary-backend
pm2 startup
pm2 save
```

#### 5. Setup Nginx Reverse Proxy
```bash
nano /etc/nginx/sites-available/canary-backend
```

```nginx
server {
    listen 80;
    server_name api.yourdomai.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/canary-backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 6. Setup SSL
```bash
certbot --nginx -d api.yourdomain.com
```

---

## 🌐 Frontend Deployment (Vercel / Netlify / VPS)

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel login
```

#### 2. Configure Environment Variables
Create `.env.production`:
```bash
VITE_API_URL=https://api.yourdomain.com
```

#### 3. Deploy
```bash
vercel --prod
```

#### 4. Add Environment Variables in Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Select project → Settings → Environment Variables
- Add: `VITE_API_URL=https://api.yourdomain.com`

### Option 2: Netlify

#### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
cd frontend
netlify login
```

#### 2. Build
```bash
npm run build
```

#### 3. Deploy
```bash
netlify deploy --prod
```

#### 4. Configure
- Add environment variables in Netlify dashboard
- Set build command: `npm run build`
- Set publish directory: `dist`

### Option 3: VPS (Same server as backend)

#### 1. Build Frontend
```bash
cd /var/www
git clone YOUR_REPO_URL canary-frontend
cd canary-frontend

# Create production env
cat > .env.production << EOF
VITE_API_URL=https://api.yourdomain.com
EOF

# Install and build
npm install
npm run build
```

#### 2. Setup Nginx
```bash
nano /etc/nginx/sites-available/canary-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/canary-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
ln -s /etc/nginx/sites-available/canary-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 3. Setup SSL
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📱 Mobile Deployment (Expo)

### Build for Production

#### 1. Configure app.json
```json
{
  "expo": {
    "name": "Canary Rental",
    "slug": "canary-rental",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.canary.rental",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.canary.rental",
      "versionCode": 1
    },
    "extra": {
      "apiUrl": "https://api.yourdomain.com"
    }
  }
}
```

#### 2. Build for Android
```bash
cd mobile
eas build --platform android --profile production
```

#### 3. Build for iOS
```bash
eas build --platform ios --profile production
```

#### 4. Submit to Stores
```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

---

## 🔐 Security Configuration

### Backend Security

#### 1. Update CORS Settings
```typescript
// backend/src/app.ts
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true
}));
```

#### 2. Enable Helmet
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

#### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### 4. Environment Variables Security
```bash
# Never commit .env files!
# Use Railway/Heroku/Vercel environment variables
# Rotate JWT_SECRET regularly
```

### Frontend Security

#### 1. Update API URL
```typescript
// frontend/src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com';
```

#### 2. Enable HTTPS Only
```typescript
// Check for HTTPS in production
if (import.meta.env.PROD && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

---

## 📊 Monitoring & Logging

### Backend Monitoring

#### 1. Install Winston Logger
```bash
npm install winston
```

#### 2. Setup Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### 3. Add Sentry (Error Tracking)
```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV
});
```

### Frontend Monitoring

#### 1. Add Sentry
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE
});
```

#### 2. Add Google Analytics
```typescript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## 🔄 CI/CD Setup (GitHub Actions)

### Create .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Deploy to Railway
        run: |
          cd backend
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Deploy to Vercel
        run: |
          cd frontend
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📝 Post-Deployment Checklist

### Backend
- [ ] API responding at https://api.yourdomain.com
- [ ] Database connected and migrations run
- [ ] Seed data loaded
- [ ] Authentication working
- [ ] All endpoints tested
- [ ] SSL certificate active
- [ ] Monitoring tools active
- [ ] Backup strategy in place

### Frontend
- [ ] Site loading at https://yourdomain.com
- [ ] API calls working
- [ ] i18n working (EN/TR)
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Google Analytics tracking
- [ ] SEO tags configured

### Mobile
- [ ] App builds successfully
- [ ] API connection working
- [ ] Push notifications working
- [ ] Offline mode working
- [ ] Submitted to stores (if applicable)

---

## 🆘 Troubleshooting

### Common Issues

#### 1. CORS Errors
```typescript
// Add to backend
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

#### 2. Database Connection Errors
```bash
# Check DATABASE_URL format
postgresql://user:password@host:port/database?schema=public
```

#### 3. Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
certbot renew
systemctl restart nginx
```

---

## 📞 Support & Resources

- **Railway**: https://railway.app/docs
- **Vercel**: https://vercel.com/docs
- **Heroku**: https://devcenter.heroku.com/
- **Expo**: https://docs.expo.dev/
- **DigitalOcean**: https://docs.digitalocean.com/

---

## 🎉 Deployment Complete!

Your Canary Rental Software is now live! 🚀

**Next Steps:**
1. Monitor application performance
2. Set up automated backups
3. Create user documentation
4. Plan feature updates
5. Gather user feedback

---

*Last Updated: October 2024*
*Canary Rental Software v1.0.0*
