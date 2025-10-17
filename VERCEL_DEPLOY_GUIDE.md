# 🚀 Vercel Frontend Deploy Guide

## ✅ TAMAMLANACAK İŞLEM

**Terminal'de bu sorulara cevap ver:**

```bash
? What's the value of VITE_API_URL?
> https://canary-production-5a09.up.railway.app/api

? Add VITE_API_URL to Preview? 
> y (yes)

? Add VITE_API_URL to Development?
> y (yes)
```

## 🔄 Deploy Komutları

Environment variable eklendikten sonra:

### Yöntem 1: Vercel CLI ile Deploy (Önerilen)
```bash
cd frontend
vercel --prod
```

### Yöntem 2: Git Push ile Deploy
```bash
cd frontend
git add .
git commit -m "Update API URL to Railway backend"
git push origin main
```

### Yöntem 3: Vercel Dashboard'dan Redeploy
1. https://vercel.com/umityamans-projects
2. Frontend projesini seç
3. Deployments tab
4. Latest deployment → ... menü → Redeploy

## 📋 Deployment Süreci

1. ✅ Environment variable eklendi (şimdi yapıyoruz)
2. ⏳ Redeploy (şimdi yapacağız)
3. ⏳ Build (2-3 dakika)
4. ✅ Frontend hazır!

## 🎯 Test URL'leri

**Frontend:** https://frontend-7e0zqa1zc-umityamans-projects.vercel.app
**Backend:** https://canary-production-5a09.up.railway.app/api

## 🧪 Test Adımları

Deploy tamamlandıktan sonra:

1. Frontend URL'ini aç
2. F12 > Network tab
3. Login dene:
   - Email: test@canary.com
   - Password: Test123!
4. API call'ları gözlemle
5. 200 OK mu?

## ⚠️ Olası Sorunlar

### CORS Hatası:
Backend'de CORS ayarları:
```typescript
// backend/src/app.ts
app.use(cors({
  origin: ['https://frontend-7e0zqa1zc-umityamans-projects.vercel.app'],
  credentials: true
}));
```

### 401/403 Hatası:
Token problemi - localStorage'ı temizle

### 502 Bad Gateway:
Backend down - Railway logs kontrol et

## 🎉 Başarılı Deploy Kontrolü

```bash
# Frontend'in environment variable'ını kontrol et:
vercel env ls

# Deployment status:
vercel ls

# Logs:
vercel logs [deployment-url]
```

## 📞 Yardım

Sorun olursa:
- Railway logs: `railway logs --tail 50`
- Vercel logs: https://vercel.com → Deployments → View Function Logs
- Network tab'da API call'ları kontrol et
