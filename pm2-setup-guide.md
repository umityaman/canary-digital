# 🚀 PM2 ile Stabil Backend/Frontend Çalıştırma Rehberi

## PM2 Nedir?
- Production-grade process manager
- Otomatik restart (crash olursa)
- Log yönetimi
- Cluster mode (multi-core)
- Memory/CPU monitoring
- Startup scripts (Windows başlangıcında otomatik başlatma)

## Kurulum

### 1. PM2'yi Global Kur
```powershell
npm install -g pm2
```

### 2. PM2 Windows Startup Kurulumu (Opsiyonel)
```powershell
npm install -g pm2-windows-startup
pm2-startup install
```

## Backend için PM2 Kullanımı

### ecosystem.config.js Oluştur
Backend klasöründe `ecosystem.config.js` dosyası:

```javascript
module.exports = {
  apps: [
    {
      name: 'canary-backend',
      script: 'ts-node-dev',
      args: '--respawn --transpile-only src/index.ts',
      cwd: './backend',
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'canary-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
    }
  ]
};
```

### Kullanım Komutları

```powershell
# Tüm servisleri başlat
pm2 start ecosystem.config.js

# Sadece backend başlat
pm2 start ecosystem.config.js --only canary-backend

# Sadece frontend başlat
pm2 start ecosystem.config.js --only canary-frontend

# Durumu kontrol et
pm2 status

# Logları izle
pm2 logs

# Sadece backend logları
pm2 logs canary-backend

# Servisi durdur
pm2 stop canary-backend

# Servisi restart et
pm2 restart canary-backend

# Tüm servisleri durdur
pm2 stop all

# Servisi sil
pm2 delete canary-backend

# Tüm servisleri sil
pm2 delete all

# Monitoring dashboard
pm2 monit

# Web dashboard (http://localhost:9615)
pm2 web
```

## Avantajları

✅ **Otomatik Restart**: Crash olursa otomatik başlar
✅ **Log Yönetimi**: Tüm loglar dosyalara yazılır
✅ **Process Monitoring**: CPU, Memory kullanımı gösterir
✅ **Zero Downtime**: Hot reload desteği
✅ **Cluster Mode**: Multi-core desteği
✅ **Startup Scripts**: Windows başlangıcında otomatik
✅ **Port Conflict**: Eski process'i otomatik temizler

## Örnek Workflow

```powershell
# Sabah bilgisayarı açınca
pm2 start ecosystem.config.js

# Gün boyunca kod değişiklikleri yapılırken
# PM2 otomatik restart eder (watch mode)

# Logları izlemek için
pm2 logs --lines 100

# Akşam bilgisayarı kapatırken
pm2 stop all
# veya hiç durdurma, Windows kapatınca otomatik kapanır
```

## Troubleshooting

### Port zaten kullanılıyor hatası
```powershell
pm2 delete all
pm2 start ecosystem.config.js
```

### Backend crash oluyor
```powershell
pm2 logs canary-backend --lines 50
```

### Memory leak kontrolü
```powershell
pm2 monit
```
