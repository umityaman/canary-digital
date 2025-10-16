# Railway Deployment Instructions for Canary Backend

## Quick Deploy to Railway

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Project (from backend directory)
```bash
cd backend
railway init
```

### 4. Add PostgreSQL Database
```bash
railway add
# Select: PostgreSQL
```

### 5. Link Database URL
Railway will automatically set `DATABASE_URL` environment variable.

### 6. Set Other Environment Variables
```bash
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set CORS_ORIGIN=https://yourdomain.com
```

### 7. Deploy
```bash
railway up
```

### 8. Run Database Migrations
```bash
railway run npx prisma migrate deploy
railway run npm run seed
```

### 9. Get Your URL
```bash
railway domain
# This will give you a URL like: canary-backend-production.up.railway.app
```

### 10. Setup Custom Domain (Optional)
- Go to Railway dashboard
- Select your project
- Settings → Domains
- Add your custom domain (api.yourdomain.com)
- Update DNS records as shown

## Environment Variables Checklist

Required variables in Railway dashboard:

- ✅ `DATABASE_URL` (auto-set by PostgreSQL addon)
- ✅ `NODE_ENV=production`
- ✅ `JWT_SECRET` (generate with: `openssl rand -base64 32`)
- ✅ `PORT=5000`
- ✅ `CORS_ORIGIN=https://yourdomain.com`

Optional variables:
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`
- `STRIPE_SECRET_KEY`
- `SENTRY_DSN`
- `EXPO_ACCESS_TOKEN`

## Verify Deployment

Test your API:
```bash
curl https://your-railway-url.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-10-15T..."
}
```

## Troubleshooting

### Build fails
- Check `railway.json` is present
- Verify `package.json` has correct scripts
- Check logs: `railway logs`

### Database connection fails
- Verify `DATABASE_URL` is set
- Check Prisma schema is correct
- Run migrations: `railway run npx prisma migrate deploy`

### API not responding
- Check if service is running: `railway logs`
- Verify PORT is set correctly
- Check firewall/network settings

## Useful Commands

```bash
# View logs
railway logs

# Open project in browser
railway open

# Run commands in Railway environment
railway run <command>

# Restart service
railway restart

# Check status
railway status
```

## Auto-Deploy on Git Push

Railway automatically deploys when you push to your connected Git repository (GitHub/GitLab).

1. Connect your repo in Railway dashboard
2. Push to main/master branch
3. Railway automatically builds and deploys

## Monitoring

- Logs: `railway logs` or Railway dashboard
- Metrics: Railway dashboard → Metrics tab
- Alerts: Set up in Railway dashboard → Settings

---

**Next Step**: Deploy frontend to Vercel! 🚀
