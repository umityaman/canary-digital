# Frontend Deployment Guide

## Overview
This document covers the frontend deployment process, troubleshooting common issues, and best practices to ensure successful deployments.

## Deployment Methods

### 1. Automatic Deployment (Recommended)
**Trigger:** Push to `main` branch with changes in `frontend/**`

**Process:**
1. GitHub Actions workflow automatically triggers
2. Clean build cache (removes `node_modules/.vite` and `dist`)
3. Installs dependencies with npm ci
4. Builds Docker image with Cloud Run source deploy
5. Deploys to Cloud Run service: `canary-frontend`
6. Runs health checks and smoke tests
7. Verifies bundle hash changed

**Monitor:** https://github.com/umityaman/canary-digital/actions

### 2. Quick Manual Deployment (Emergency Fixes)
**Use case:** When you need to deploy a pre-built dist folder quickly (bypasses full rebuild)

**Prerequisites:**
- Clean local build exists in `frontend/dist/`
- Docker Desktop NOT required (uses Cloud Build)

**Steps:**
```powershell
# 1. Ensure you have a fresh local build
cd frontend
npm run build

# 2. Run quick deploy script from project root
cd ..
.\quick-deploy-simple.ps1
```

**What it does:**
- Uses `Dockerfile.production` (simple Nginx + dist)
- Builds image with Cloud Build (no local Docker needed)
- Deploys to Cloud Run in ~30 seconds
- Automatically verifies new bundle

**Time:** ~30 seconds vs 5-8 minutes for full build

## Common Issues & Solutions

### Issue 1: Bundle Hash Not Changing
**Symptom:** New code committed but production still serves old JavaScript bundle (e.g., `index-C-jDH8TF.js` unchanged)

**Root Cause:** Vite build cache persisting across Docker builds

**Solutions:**
1. **Automatic (CI):** Workflow now cleans cache before build
2. **Manual fix:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force node_modules\.vite
   Remove-Item -Recurse -Force dist
   npm run build
   ```
3. **Verify in production:**
   ```powershell
   curl https://canary-frontend-672344972017.europe-west1.run.app | grep -oP 'index-[a-zA-Z0-9_-]+\.js'
   ```

### Issue 2: 403 Errors on Report Pages
**Symptom:** Console shows 403 errors for `/api/accounting/reports/*`

**Root Cause:** Backend middleware sets `req.companyId` but routes access `req.user?.companyId`

**Status:** ✅ FIXED in backend commit `43bf8bf`

**Verification:**
```bash
# Check backend revision
gcloud run revisions list --service=canary-backend --region=europe-west1 --limit=3

# Latest should be: canary-backend-00549-cb7 or newer
```

### Issue 3: Changes Not Visible After Deployment
**Checklist:**
1. ✅ Clear browser cache (Ctrl+Shift+R or use Incognito)
2. ✅ Verify correct Cloud Run revision serving 100% traffic
   ```bash
   gcloud run services describe canary-frontend --region=europe-west1 --format="value(status.traffic.revisionName,status.traffic.percent)"
   ```
3. ✅ Check bundle hash changed:
   ```bash
   curl -s https://canary-frontend-672344972017.europe-west1.run.app | grep -oP 'index-.*?\.js' | head -1
   ```
4. ✅ Inspect Network tab in DevTools for 304 (cached) responses
5. ✅ Clear Application Storage (DevTools → Application → Clear site data)

## Dockerfile Cache Strategy

### Main Dockerfile (`frontend/Dockerfile`)
Used by GitHub Actions for automatic deployments.

**Cache Prevention:**
```dockerfile
# Force clean build - no cache
ENV VITE_FORCE_OPTIMIZE=true
RUN rm -rf node_modules/.vite dist

# Cache buster - force rebuild on 2025-11-05 11:50
RUN echo "Build timestamp: 2025-11-05-11:50:00"

# Build the app with fresh cache
RUN npm run build
```

**Update cache buster:**
When making important changes, update the timestamp:
```dockerfile
RUN echo "Build timestamp: $(date +%Y-%m-%d-%H:%M:%S)"
```

### Production Dockerfile (`Dockerfile.production`)
Simple Nginx-based deployment using pre-built dist.

**Use case:** Emergency deployments with pre-built artifacts

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

## Smoke Tests (Automated)

The CI pipeline now includes automated smoke tests:

1. **Bundle Hash Verification**
   - Extracts main JS bundle name from HTML
   - Verifies bundle file is accessible
   - Fails deployment if bundle not found

2. **Critical Assets Check**
   - Verifies CSS bundle loads
   - Checks for lazy-loaded component chunks
   - Ensures main page returns 200 OK

3. **Report Pages** (future enhancement)
   - Can add authenticated smoke tests
   - Verify no 403 errors on report endpoints
   - Check chart components render

## Best Practices

### Before Deployment
1. Test locally with `npm run dev`
2. Run production build locally: `npm run build`
3. Check bundle size: `ls -lh frontend/dist/assets/*.js`
4. Verify no console errors in local build

### After Deployment
1. Open production in Incognito mode (Ctrl+Shift+N)
2. Check DevTools Console for errors
3. Verify Network tab shows new bundle hash
4. Test critical user flows (login, reports, etc.)
5. Monitor Cloud Run logs for errors

### Rollback Strategy
If deployment fails or causes issues:

```bash
# List recent revisions
gcloud run revisions list --service=canary-frontend --region=europe-west1 --limit=5

# Rollback to previous revision
gcloud run services update-traffic canary-frontend \
  --to-revisions=canary-frontend-00681-mbv=100 \
  --region=europe-west1
```

## Monitoring & Logs

### View Deployment Logs
```bash
# GitHub Actions logs
# https://github.com/umityaman/canary-digital/actions

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=canary-frontend" \
  --limit=50 \
  --format=json
```

### Check Current Deployment
```bash
# Service details
gcloud run services describe canary-frontend --region=europe-west1

# Current revision
gcloud run services describe canary-frontend --region=europe-west1 --format="value(status.latestReadyRevisionName)"

# Traffic split
gcloud run services describe canary-frontend --region=europe-west1 --format="value(status.traffic.revisionName,status.traffic.percent)"
```

## URLs

- **Production:** https://canary-frontend-672344972017.europe-west1.run.app
- **Backend API:** https://canary-backend-672344972017.europe-west1.run.app
- **GitHub Repo:** https://github.com/umityaman/canary-digital
- **Cloud Console:** https://console.cloud.google.com/run?project=canary-digital-475319

## Emergency Contact

- **Project:** canary-digital-475319
- **Region:** europe-west1
- **Service:** canary-frontend
- **Latest Working Revision:** canary-frontend-00682-pjm (2025-11-05)

## Changelog

### 2025-11-05
- ✅ Fixed backend 403 errors (companyId access pattern)
- ✅ Added Vite cache cleaning to CI workflow
- ✅ Updated Dockerfile with cache-buster and VITE_FORCE_OPTIMIZE
- ✅ Added bundle verification and smoke tests to CI
- ✅ Created quick-deploy script for emergency fixes
- ✅ Deployed working UI with 2-column chart layout in AdvancedReporting

### Previous Issues
- Bundle hash not changing despite new deployments
- Vite cache persisting in Docker layers
- 403 errors on accounting report endpoints
