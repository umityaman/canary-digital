# Vercel Deployment Instructions for Canary Frontend

## Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Frontend Directory
```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? **canary-rental-frontend**
- Directory? **./frontend**
- Override settings? **No**

### 4. Set Environment Variables

#### Option A: Via CLI
```bash
vercel env add VITE_API_URL production
# Enter: https://your-railway-backend-url.up.railway.app
```

#### Option B: Via Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `VITE_API_URL` = `https://your-railway-backend-url.up.railway.app`

### 5. Deploy to Production
```bash
vercel --prod
```

### 6. Setup Custom Domain (Optional)
```bash
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

Or via dashboard:
1. Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Environment Variables

Required for production:

```bash
VITE_API_URL=https://your-backend-api-url.com
```

Optional:
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Vercel Configuration

Create `vercel.json` (already in project):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Build Configuration

Vercel auto-detects Vite projects. Default settings:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Verify Deployment

1. Open your Vercel URL (e.g., `canary-rental-frontend.vercel.app`)
2. Test login functionality
3. Check API connection
4. Test language switching (EN/TR)
5. Verify all pages load correctly

## Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build

# View build logs in Vercel dashboard
# Or use: vercel logs
```

### API Connection Issues
1. Check `VITE_API_URL` is set correctly
2. Verify CORS is configured in backend
3. Check Network tab in browser DevTools

### 404 Errors on Refresh
- Ensure `vercel.json` has correct rewrites
- Check `outputDirectory` is set to `dist`

### Environment Variables Not Working
- Prefix must be `VITE_` (e.g., `VITE_API_URL`)
- Redeploy after adding variables: `vercel --prod`
- Variables are baked into build, not runtime

## Auto-Deploy on Git Push

### Connect GitHub Repository
1. Go to Vercel dashboard
2. Import Project → Select your GitHub repo
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

Now every push to `main` branch auto-deploys! 🎉

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]

# Open project in browser
vercel open

# Check project info
vercel inspect
```

## Performance Optimization

Vercel automatically optimizes:
- ✅ Edge caching
- ✅ Compression (gzip/brotli)
- ✅ Image optimization
- ✅ Global CDN
- ✅ SSL/HTTPS

## Monitoring

View analytics in Vercel dashboard:
- Page views
- Load times
- Error rates
- Bandwidth usage

## Domain Configuration

### Add Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Add www: `www.yourdomain.com`

### DNS Configuration
Update your DNS provider with Vercel's nameservers or add A/CNAME records as shown in dashboard.

**A Record**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Complete Deployment Checklist

- [ ] Vercel CLI installed
- [ ] Logged in to Vercel
- [ ] Project deployed
- [ ] Environment variables set (`VITE_API_URL`)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (auto by Vercel)
- [ ] API connection tested
- [ ] All features working
- [ ] Analytics enabled (optional)

---

**Next Step**: Test the full application end-to-end! 🚀

**Your URLs**:
- Frontend: https://canary-rental-frontend.vercel.app (or yourdomain.com)
- Backend: https://your-railway-url.up.railway.app (or api.yourdomain.com)
