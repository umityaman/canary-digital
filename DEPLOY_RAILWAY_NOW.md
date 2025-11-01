# Railway Deployment - 5 Dakikada Çalışır!

## Adım 1: Railway.app'e Git
https://railway.app/

## Adım 2: GitHub ile Login

## Adım 3: "New Project" → "Deploy from GitHub repo"

## Adım 4: "canary-digital" seç

## Adım 5: Settings
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`

## Adım 6: Environment Variables
Railway otomatik PostgreSQL ekleyecek, sadece bunları ekle:
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

## Adım 7: Deploy!
Her git push otomatik deploy edilir.

## NEDEN RAILWAY?
✅ Dockerfile otomatik detect
✅ PostgreSQL built-in
✅ 0 config
✅ Her push auto-deploy
✅ Gerçek build logs görünür
✅ 5 dakikada çalışır
✅ Ücretsiz $5/month

## Ya da Render.com
Aynı şekilde kolay, `render.yaml` hazır.

Cloud Run çok karmaşık - Railway çok daha basit ve güvenilir!
