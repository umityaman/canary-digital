# 🛠️ Alternatif Çözümler - Stabil Geliştirme Ortamı

## 2️⃣ Docker Compose ile İzolasyon ⭐⭐

### Avantajları
- ✅ Tamamen izole ortam
- ✅ Port conflict'leri olmaz
- ✅ Restart politikaları
- ✅ Tüm ekip aynı ortamda çalışır
- ✅ Production'a yakın ortam

### docker-compose.yml (Mevcut)
Projenizde zaten var! Sadece kullanmaya başlayabilirsiniz:

```powershell
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Durdur
docker-compose down

# Yeniden başlat
docker-compose restart
```

### Dezavantajları
- ❌ Docker Desktop gerekli (kaynak tüketimi)
- ❌ Hot reload biraz daha yavaş
- ❌ Windows'ta performans sorunu olabilir

---

## 3️⃣ Concurrently ile Tek Terminal ⭐

### Kurulum
```powershell
npm install -g concurrently
```

### Root package.json Ekle
Proje root'unda `package.json` oluştur:

```json
{
  "name": "canary-erp",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "kill": "taskkill /F /IM node.exe"
  }
}
```

### Kullanım
```powershell
# Tek komutla her ikisini başlat
npm run dev

# Process'leri temizle
npm run kill
```

### Avantajları
- ✅ Basit kurulum
- ✅ Tek terminal
- ✅ Renkli log output

### Dezavantajları
- ❌ Crash'te otomatik restart yok
- ❌ Process management yok

---

## 4️⃣ Nodemon ile Auto-Restart

### Backend için Nodemon
```powershell
cd backend
npm install --save-dev nodemon
```

### backend/nodemon.json
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts", "node_modules"],
  "exec": "ts-node src/index.ts",
  "restartable": "rs",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": "2000"
}
```

### package.json script güncelle
```json
{
  "scripts": {
    "dev": "nodemon"
  }
}
```

---

## 5️⃣ Windows Task Scheduler ile Otomatik Başlatma

### PowerShell Script Oluştur
`start-canary.ps1`:

```powershell
# Backend başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend; npm run dev"

# 5 saniye bekle
Start-Sleep -Seconds 5

# Frontend başlat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend; npm run dev"
```

### Kullanım
```powershell
.\start-canary.ps1
```

---

## 6️⃣ VSCode Tasks ile Entegrasyon

### .vscode/tasks.json Oluştur
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "isBackground": true,
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "focus": false
      }
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "isBackground": true,
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "focus": false
      }
    },
    {
      "label": "Start All Servers",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "problemMatcher": []
    }
  ]
}
```

### Kullanım
- `Ctrl + Shift + P` → "Tasks: Run Task" → "Start All Servers"

---

## 📊 KARŞILAŞTIRMA

| Çözüm | Kararlılık | Kolay Kurulum | Otomatik Restart | Log Yönetimi | Önerilen |
|-------|-----------|---------------|------------------|--------------|----------|
| **PM2** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ✅ | **🏆 EN İYİ** |
| Docker Compose | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ | Production |
| Concurrently | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐ | Hızlı test |
| Nodemon | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐ | Sadece backend |
| Task Scheduler | ⭐⭐ | ⭐⭐⭐ | ❌ | ❌ | Otomatik başlatma |
| VSCode Tasks | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ | IDE entegrasyonu |

---

## 🎯 TAVSİYEM

### Kısa Vadeli (Hemen Uygula) 
**👉 PM2 kullan!**

Kurulum:
```powershell
# 1. PM2 kur
npm install -g pm2

# 2. Servisleri başlat
pm2 start ecosystem.config.js

# 3. Durumu kontrol et
pm2 status

# 4. Logları izle
pm2 logs
```

### Orta Vadeli (1-2 Hafta İçinde)
**👉 Docker Compose'a geç**
- Production ortamına hazırlık
- Ekip çalışması için ideal
- Database, Redis gibi servisleri de ekleyebilirsin

### Uzun Vadeli (Production)
**👉 Kubernetes veya Cloud Services**
- AWS ECS
- Azure Container Apps
- Google Cloud Run

---

## 🚨 MEVCUT SORUNLARIN ÇÖZÜMLERİ

### Problem: Backend sürekli düşüyor
**Çözüm:** PM2 otomatik restart yapar
```powershell
pm2 start ecosystem.config.js --only canary-backend
```

### Problem: Port conflict
**Çözüm:** PM2 eski process'i temizler
```powershell
pm2 delete all
pm2 start ecosystem.config.js
```

### Problem: Log kaybolması
**Çözüm:** PM2 tüm logları dosyaya yazar
```powershell
pm2 logs --lines 100
# Logs: ./logs/backend-error.log, ./logs/backend-out.log
```

### Problem: Manuel restart gerekiyor
**Çözüm:** PM2 otomatik restart + watch mode
```javascript
// ecosystem.config.js
watch: ['src'], // Dosya değişince otomatik restart
```

---

## 🎓 HEMEN DENE

```powershell
# 1. PM2 kur (global)
npm install -g pm2

# 2. Mevcut servisleri durdur
taskkill /F /IM node.exe

# 3. PM2 ile başlat
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156
pm2 start ecosystem.config.js

# 4. Kontrol et
pm2 status
pm2 logs

# 5. İzle
pm2 monit
```

**Artık backend crash olsa bile 3 saniye içinde otomatik restart olacak!** 🚀
