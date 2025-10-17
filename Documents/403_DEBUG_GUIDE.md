# 🔍 403 FORBIDDEN HATASI ÇÖZÜMÜ

## 📊 Durum:
- ✅ Login başarılı
- ✅ Dashboard açıldı
- ❌ Analytics API'leri 403 veriyor

## 🎯 Muhtemel Sebepler:

### 1. Token Kaydedilmemiş veya Expire Olmuş
**Çözüm:** Logout/Login tekrar yap

**Test:**
```javascript
// Browser Console (F12)
localStorage.getItem('auth_token')
// Token görmeli

// Token decode et:
JSON.parse(atob(localStorage.getItem('auth_token').split('.')[1]))
// userId, companyId, role görmeli
```

### 2. Authorization Header Gönderilmiyor
**Test:** Network tab'da bir analytics request'e tıkla
- Headers > Request Headers
- `Authorization: Bearer <token>` var mı?

### 3. Middleware Hatası
Backend middleware token'ı kabul etmiyor

### 4. companyId Eksik
Token'da companyId yok, analytics sorguları fail ediyor

## 🔧 HEMEN YAP:

### Adım 1: Token Kontrol
```javascript
// Console'da:
const token = localStorage.getItem('auth_token');
if (!token) {
  console.log('TOKEN YOK - Login tekrar yap!');
} else {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  console.log('Token içeriği:', decoded);
  // Beklenen: { userId: 1, email: "...", role: "...", companyId: 1, ... }
}
```

### Adım 2: Logout/Login
1. Sağ üst köşe > Logout
2. Tekrar Login yap
3. Dashboard'ı tekrar aç
4. Network tab kontrol et

### Adım 3: Manuel Token Test
Backend'de gerçek bir token oluştur ve test et:

```bash
# PowerShell'de:
cd backend
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({ userId: 1, email: 'admin@canary.com', role: 'ADMIN', companyId: 1 }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', { expiresIn: '24h' }))"
```

Bu token'ı Postman'de veya curl ile test et.

## 🐛 Backend Debug:

Auth middleware'e log ekle:

```typescript
// backend/src/middleware/auth.ts
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  console.log('🔑 Auth Header:', authHeader); // LOG EKLE
  console.log('🎫 Token:', token); // LOG EKLE

  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ Decoded Token:', decoded); // LOG EKLE
    req.userId = decoded.userId
    req.companyId = decoded.companyId
    next()
  } catch (error) {
    console.error('❌ Token Error:', error); // LOG EKLE
    return res.status(403).json({ message: 'Geçersiz token' })
  }
}
```

Sonra Railway logs kontrol et:
```bash
railway logs --tail 50
```

## 🎯 Hızlı Çözüm:

**SEN ŞİMDİ BU:**

1. Browser Console aç (F12 > Console)
2. Şunu yaz: `localStorage.clear()`
3. Sayfayı yenile (F5)
4. Login yap
5. Dashboard'ı tekrar test et

## 📞 Sonuç:

Bana şunu söyle:
- ✅ Token var mı localStorage'da?
- ✅ Logout/Login çalıştı mı?
- ✅ 403 hala var mı?
- ✅ Network tab'da Authorization header var mı?

