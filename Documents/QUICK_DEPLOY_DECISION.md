# Quick Deploy Scripts - Decision Log

## Purpose
Emergency deployment scripts created during 2025-11-05 debugging session to bypass Vite cache issues.

## Files Created

### 1. `quick-deploy-simple.ps1`
**Purpose:** Deploy pre-built dist folder to Cloud Run quickly
**Use Case:** Emergency fixes, cache issues, manual deployments
**Keep:** YES - Useful for quick iterations during development

### 2. `quick-frontend-deploy.ps1`
**Purpose:** Initial version with verbose output and verification
**Keep:** NO - Superseded by quick-deploy-simple.ps1

### 3. `frontend/Dockerfile.production`
**Purpose:** Simple Nginx-based Dockerfile using pre-built dist
**Keep:** YES - Used by quick-deploy-simple.ps1

## Recommendation: Keep Useful Scripts

### Scripts to KEEP
- ✅ `quick-deploy-simple.ps1` - Clean, fast, useful for dev workflow
- ✅ `frontend/Dockerfile.production` - Simple production Dockerfile

### Scripts to REMOVE
- ❌ `quick-frontend-deploy.ps1` - Redundant, has PowerShell encoding issues

### Add to .gitignore (temporary artifacts)
```gitignore
# Temporary deployment artifacts
frontend/Dockerfile.backup
frontend/prod-index.html
```

## Usage Documentation

See `Documents/FRONTEND_DEPLOYMENT_GUIDE.md` section "Quick Manual Deployment"

## Decision
**Date:** 2025-11-05
**Outcome:** Keep quick-deploy-simple.ps1 and Dockerfile.production as permanent dev tools
**Reasoning:**
- Provides 30-second emergency deployment capability
- Bypasses Docker/CI cache issues
- Useful during active development iterations
- Well-documented and tested

## Cleanup Actions
1. Remove quick-frontend-deploy.ps1
2. Add deployment artifacts to .gitignore
3. Keep README reference to quick-deploy option
