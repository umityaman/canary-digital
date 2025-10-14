# 🚀 CI/CD Pipeline Configuration

## Overview

Automated CI/CD pipeline using GitHub Actions for:
- **Backend**: Tests, build, deploy to Railway
- **Frontend**: Tests, build, deploy to Vercel
- **Mobile**: Tests, build with EAS Build

---

## Pipeline Stages

### 1. Code Quality Checks
- ✅ TypeScript compilation
- ✅ ESLint/TSLint
- ✅ Prettier formatting
- ✅ Unit tests
- ✅ Security audit

### 2. Build
- ✅ Backend build (dist/)
- ✅ Frontend build (dist/)
- ✅ Mobile build (EAS Build)

### 3. Deploy
- ✅ Backend → Railway
- ✅ Frontend → Vercel
- ✅ Mobile → TestFlight/Google Play (manual)

---

## Required Secrets

Configure these secrets in GitHub repository settings:

### Backend (Railway)
```
RAILWAY_TOKEN=your_railway_token
```

### Frontend (Vercel)
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VITE_API_URL=https://your-backend.railway.app
```

### Mobile (Expo EAS)
```
EXPO_TOKEN=your_expo_token
```

### Optional (Sentry)
```
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

---

## Getting Tokens

### Railway Token
1. Go to https://railway.app
2. Account Settings → Tokens
3. Create new token
4. Copy and add to GitHub secrets

### Vercel Token
```bash
# Install Vercel CLI
npm install -g vercel

# Login and get token
vercel login

# Link project
cd frontend
vercel link

# Get org and project IDs from .vercel/project.json
cat .vercel/project.json
```

### Expo Token
```bash
# Login to Expo
npx expo login

# Generate token
npx expo whoami --auth-token

# Or create at https://expo.dev/settings/access-tokens
```

---

## Manual Deployment

### Backend to Railway
```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Frontend to Vercel
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Mobile with EAS
```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

## Workflow Triggers

### Automatic
- **Push to main**: Full CI/CD (test + build + deploy)
- **Push to develop**: CI only (test + build)
- **Pull Request**: CI only (test + build)

### Manual
- Go to GitHub Actions tab
- Select workflow
- Click "Run workflow"

---

## Environment-Specific Configurations

### Development
```yaml
# .github/workflows/ci-cd-dev.yml
on:
  push:
    branches: [develop]
```

### Staging
```yaml
# .github/workflows/ci-cd-staging.yml
on:
  push:
    branches: [staging]
```

### Production
```yaml
# .github/workflows/ci-cd-prod.yml
on:
  push:
    branches: [main]
```

---

## Monitoring Deployments

### Railway
- Dashboard: https://railway.app/dashboard
- Logs: View in Railway dashboard
- Rollback: Use Railway CLI or dashboard

### Vercel
- Dashboard: https://vercel.com/dashboard
- Deployments: View all deployments
- Rollback: Click on previous deployment → Promote

### Expo
- Dashboard: https://expo.dev
- Builds: View all builds
- Updates: Use OTA updates for quick fixes

---

## Troubleshooting

### Build Fails

#### Backend
```bash
# Check TypeScript errors
npm run build

# Check tests
npm test

# Check database schema
npx prisma generate
```

#### Frontend
```bash
# Check TypeScript errors
npm run build

# Check for missing env vars
cat .env.production
```

#### Mobile
```bash
# Check app.json configuration
cat app.json

# Validate EAS config
eas build:configure --platform all
```

### Deployment Fails

#### Railway
```bash
# Check logs
railway logs

# Check environment variables
railway variables

# Restart service
railway restart
```

#### Vercel
```bash
# Check deployment logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

---

## Advanced Configuration

### Pre-deployment Checks
```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Check bundle size
  run: npm run build:analyze

- name: Run security scan
  run: npm audit
```

### Post-deployment Actions
```yaml
- name: Run smoke tests
  run: curl ${{ secrets.API_URL }}/health

- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}

- name: Create GitHub Release
  uses: actions/create-release@v1
  with:
    tag_name: v${{ github.run_number }}
    release_name: Release ${{ github.run_number }}
```

### Database Migrations
```yaml
- name: Run Prisma migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Performance Optimization

### Caching
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Parallel Jobs
```yaml
jobs:
  backend:
    runs-on: ubuntu-latest
    # ...
  
  frontend:
    runs-on: ubuntu-latest
    # Runs in parallel with backend
    # ...
```

---

## Rollback Strategy

### Quick Rollback
1. Go to deployment platform (Railway/Vercel)
2. Find previous successful deployment
3. Click "Promote" or "Rollback"

### Git Rollback
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

---

## Checklist

- [ ] GitHub secrets configured
- [ ] Railway project created
- [ ] Vercel project created
- [ ] Expo account setup
- [ ] CI/CD workflow file added
- [ ] Environment variables set
- [ ] Test pipeline locally
- [ ] Monitor first deployment
- [ ] Setup alerts/notifications
- [ ] Document rollback procedure

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

---

**Status**: ✅ Ready for Production
**Last Updated**: October 13, 2025
