# 🐧 Ubuntu Server Deployment Rehberi - Canary Rental

## 📋 İçindekiler
1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Ubuntu Server Kurulumu](#ubuntu-server-kurulumu)
3. [Gerekli Yazılımlar](#gerekli-yazılımlar)
4. [Projeyi Server'a Transfer](#projeyi-servera-transfer)
5. [Database Setup](#database-setup)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Nginx Configuration](#nginx-configuration)
9. [SSL Sertifikası](#ssl-sertifikası)
10. [PM2 Process Manager](#pm2-process-manager)
11. [Güvenlik Ayarları](#güvenlik-ayarları)
12. [Otomatik Backup](#otomatik-backup)
13. [Monitoring & Logs](#monitoring--logs)

---

## 🖥️ Sistem Gereksinimleri

### Minimum Gereksinimler
```
CPU: 2 Core
RAM: 4 GB
Disk: 40 GB SSD
Network: 100 Mbps
OS: Ubuntu Server 22.04 LTS veya 24.04 LTS
```

### Önerilen Gereksinimler (Production)
```
CPU: 4 Core
RAM: 8 GB
Disk: 80 GB SSD
Network: 1 Gbps
OS: Ubuntu Server 24.04 LTS
```

### Test Ortamı İçin (Development)
```
CPU: 1 Core
RAM: 2 GB
Disk: 20 GB
```

---

## 🚀 Ubuntu Server Kurulumu

### 1. Ubuntu Server İndirme
```bash
# Ubuntu Server 24.04 LTS (önerilen)
# https://ubuntu.com/download/server

# ISO dosyasını USB'ye yazdırma (Windows)
# Rufus kullan: https://rufus.ie/
```

### 2. Kurulum Adımları
```
1. USB'den boot et
2. "Install Ubuntu Server" seç
3. Dil: English (Türkçe keyboard seçilebilir)
4. Network: DHCP (otomatik IP)
5. Disk: Use entire disk
6. Hostname: canary-server
7. Username: canary
8. OpenSSH Server: INSTALL (önemli!)
9. Featured Server Snaps: Skip
```

### 3. İlk Giriş
```bash
# Server açıldıktan sonra
ssh canary@server-ip-adresi

# Örnek:
ssh canary@192.168.1.100
```

---

## 📦 Gerekli Yazılımlar

### 1. Sistem Güncellemesi
```bash
# Root yetkisi al
sudo su

# Sistem güncelle
apt update && apt upgrade -y

# Gerekli araçlar
apt install -y curl wget git build-essential software-properties-common
```

### 2. Node.js 20 LTS Kurulumu
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js kur
sudo apt install -y nodejs

# Kontrol et
node --version  # v20.x.x
npm --version   # v10.x.x
```

### 3. PostgreSQL 15 Kurulumu
```bash
# PostgreSQL repository ekle
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

# Kur
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Kontrol et
sudo systemctl status postgresql
```

### 4. Nginx Kurulumu (Web Server)
```bash
sudo apt install -y nginx

# Başlat
sudo systemctl start nginx
sudo systemctl enable nginx

# Kontrol et
sudo systemctl status nginx
```

### 5. PM2 Process Manager
```bash
# Global olarak kur
sudo npm install -g pm2

# Startup script oluştur
pm2 startup systemd
```

### 6. Git (Zaten kurulu olmalı)
```bash
git --version
# git version 2.x.x
```

---

## 📁 Projeyi Server'a Transfer

### Yöntem 1: Git Clone (Önerilen - Eğer GitHub'da varsa)
```bash
# Home dizinine git
cd ~

# Projeyi clone et
git clone https://github.com/username/canary-rental.git
cd canary-rental
```

### Yöntem 2: SCP ile Transfer (Local'den)
```bash
# Windows PowerShell'den (local bilgisayarda)
# Projeyi zip'le
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156
Compress-Archive -Path * -DestinationPath canary.zip

# Server'a gönder
scp canary.zip canary@server-ip:/home/canary/

# Server'da zip'i aç
ssh canary@server-ip
cd ~
unzip canary.zip
mv CANARY-BACKUP-20251008-1156 canary-rental
```

### Yöntem 3: SFTP (FileZilla)
```
1. FileZilla indir (https://filezilla-project.org/)
2. Host: sftp://server-ip
3. Username: canary
4. Password: şifreniz
5. Port: 22
6. Drag & drop ile dosyaları transfer et
```

---

## 🗄️ Database Setup

### 1. PostgreSQL Kullanıcı Oluşturma
```bash
# PostgreSQL'e giriş
sudo -u postgres psql

# Yeni kullanıcı ve database oluştur
CREATE USER canary WITH PASSWORD 'güçlü_şifre_buraya';
CREATE DATABASE canary_db OWNER canary;
GRANT ALL PRIVILEGES ON DATABASE canary_db TO canary;

# Çıkış
\q
```

### 2. Remote Bağlantı İzni (Opsiyonel)
```bash
# PostgreSQL config düzenle
sudo nano /etc/postgresql/15/main/postgresql.conf

# Bu satırı bul ve düzenle:
listen_addresses = '*'

# pg_hba.conf düzenle
sudo nano /etc/postgresql/15/main/pg_hba.conf

# En alta ekle (sadece local network için)
host    all             all             192.168.1.0/24          md5

# Restart
sudo systemctl restart postgresql
```

### 3. Database URL Oluşturma
```bash
# .env dosyasında kullanılacak
DATABASE_URL="postgresql://canary:güçlü_şifre_buraya@localhost:5432/canary_db?schema=public"
```

---

## 🔧 Backend Deployment

### 1. Backend Dependencies Kurulumu
```bash
cd ~/canary-rental/backend

# Dependencies kur
npm install

# TypeScript global kur (gerekirse)
sudo npm install -g typescript ts-node
```

### 2. Environment Variables
```bash
# .env dosyası oluştur
nano .env

# Aşağıdaki içeriği yapıştır:
```

```bash
# Database
DATABASE_URL="postgresql://canary:güçlü_şifre_buraya@localhost:5432/canary_db?schema=public"

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET="çok-güçlü-rastgele-secret-buraya-32-karakter"

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# WhatsApp (Twilio) - Opsiyonel
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Payment (iyzico) - Opsiyonel
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Sentry (Monitoring) - Opsiyonel
SENTRY_DSN=your-sentry-dsn

# CORS
CORS_ORIGIN=http://server-ip:3000,http://your-domain.com
```

### 3. Prisma Migration
```bash
# Migration çalıştır
npx prisma migrate deploy

# Prisma Client generate
npx prisma generate

# Seed data (opsiyonel)
npx prisma db seed
```

### 4. Build Backend
```bash
# TypeScript compile
npm run build

# Eğer build script yoksa:
tsc
```

### 5. PM2 ile Başlatma
```bash
# Production modda başlat
pm2 start dist/index.js --name canary-backend

# Veya ts-node ile (development)
pm2 start src/index.ts --name canary-backend --interpreter ts-node

# Durumu kontrol et
pm2 status

# Logları izle
pm2 logs canary-backend

# Otomatik başlatma
pm2 save
pm2 startup
```

---

## 🎨 Frontend Deployment

### 1. Frontend Dependencies
```bash
cd ~/canary-rental/frontend

# Dependencies kur
npm install
```

### 2. Environment Variables
```bash
# .env dosyası oluştur
nano .env

# API URL'i belirt
VITE_API_URL=http://server-ip:3001
# Veya domain varsa:
VITE_API_URL=https://api.your-domain.com
```

### 3. Build Frontend
```bash
# Production build
npm run build

# dist/ klasörü oluşacak
ls -la dist/
```

### 4. Frontend'i Serve Etme

**Seçenek 1: Nginx ile Serve (Önerilen)**
```bash
# dist/ klasörünü Nginx dizinine kopyala
sudo cp -r dist/* /var/www/canary-frontend/

# Veya symbolic link oluştur
sudo ln -s ~/canary-rental/frontend/dist /var/www/canary-frontend
```

**Seçenek 2: PM2 ile Serve**
```bash
# serve package kur
sudo npm install -g serve

# PM2 ile başlat
pm2 serve dist/ 3000 --name canary-frontend --spa
```

---

## 🌐 Nginx Configuration

### 1. Nginx Config Dosyası Oluşturma
```bash
sudo nano /etc/nginx/sites-available/canary
```

### 2. Config İçeriği
```nginx
# Backend API (Port 3001)
server {
    listen 80;
    server_name api.your-domain.com;  # Veya server-ip
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend (Port 80)
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Veya server-ip
    
    root /var/www/canary-frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (eğer subdomain kullanmıyorsan)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Config Aktif Etme
```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/canary /etc/nginx/sites-enabled/

# Default site'ı kaldır
sudo rm /etc/nginx/sites-enabled/default

# Config test et
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

---

## 🔒 SSL Sertifikası (HTTPS)

### Let's Encrypt ile Ücretsiz SSL

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (domain gerekli)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Otomatik yenileme test
sudo certbot renew --dry-run

# Cron job (otomatik yenileme)
sudo crontab -e
# Ekle: 0 0 * * * certbot renew --quiet
```

### Self-Signed SSL (Test için - Domain yoksa)
```bash
# SSL klasörü oluştur
sudo mkdir -p /etc/nginx/ssl

# Self-signed sertifika oluştur
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/canary.key \
  -out /etc/nginx/ssl/canary.crt

# Nginx config'e ekle:
# listen 443 ssl;
# ssl_certificate /etc/nginx/ssl/canary.crt;
# ssl_certificate_key /etc/nginx/ssl/canary.key;
```

---

## 🔄 PM2 Process Manager

### Temel Komutlar
```bash
# Tüm process'leri listele
pm2 list

# Belirli bir process'i restart
pm2 restart canary-backend

# Logları izle
pm2 logs canary-backend

# CPU/Memory kullanımı
pm2 monit

# Process'i durdur
pm2 stop canary-backend

# Process'i tamamen kaldır
pm2 delete canary-backend

# Tüm process'leri kaydet
pm2 save

# Sistem restart sonrası otomatik başlatma
pm2 startup systemd
```

### PM2 Ecosystem File (Önerilen)
```bash
# ecosystem.config.js oluştur
nano ~/canary-rental/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'canary-backend',
      script: './backend/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '~/logs/backend-error.log',
      out_file: '~/logs/backend-out.log',
      time: true
    }
  ]
};
```

```bash
# Ecosystem ile başlat
pm2 start ecosystem.config.js

# Güncelleme sonrası reload (zero-downtime)
pm2 reload ecosystem.config.js
```

---

## 🔐 Güvenlik Ayarları

### 1. Firewall (UFW)
```bash
# UFW aktif et
sudo ufw enable

# SSH izin ver (ÖNEMLİ!)
sudo ufw allow 22/tcp

# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# PostgreSQL (sadece local)
sudo ufw deny 5432/tcp

# Durumu kontrol et
sudo ufw status
```

### 2. Fail2Ban (SSH Brute-Force Koruması)
```bash
# Fail2ban kur
sudo apt install -y fail2ban

# Config oluştur
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# SSH için ayarlar:
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

# Başlat
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. SSH Key Authentication (Şifresiz Giriş)
```bash
# Local bilgisayarda (Windows PowerShell)
ssh-keygen -t rsa -b 4096

# Public key'i server'a kopyala
scp ~/.ssh/id_rsa.pub canary@server-ip:~/.ssh/authorized_keys

# Server'da şifre ile giriş devre dışı bırak
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
sudo systemctl restart sshd
```

### 4. Otomatik Güvenlik Güncellemeleri
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 💾 Otomatik Backup

### 1. Database Backup Script
```bash
# Backup klasörü oluştur
mkdir -p ~/backups/database

# Backup script
nano ~/backups/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/canary/backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="canary_db"
DB_USER="canary"

# Backup al
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# 7 günden eski backup'ları sil
find $BACKUP_DIR -name "backup_*.sql" -type f -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql"
```

```bash
# Çalıştırılabilir yap
chmod +x ~/backups/backup-db.sh

# Test et
~/backups/backup-db.sh
```

### 2. Cron Job (Otomatik Backup)
```bash
# Crontab aç
crontab -e

# Her gece 2:00'de backup al
0 2 * * * /home/canary/backups/backup-db.sh >> /home/canary/logs/backup.log 2>&1

# Her Pazar 3:00'de dosya backup'ı
0 3 * * 0 tar -czf /home/canary/backups/files/backup_$(date +\%Y\%m\%d).tar.gz /home/canary/canary-rental
```

### 3. Remote Backup (Opsiyonel)
```bash
# rsync ile başka bir server'a
rsync -avz ~/backups/ backup-server:/backups/canary/

# Veya cloud storage (AWS S3, Google Drive vb.)
```

---

## 📊 Monitoring & Logs

### 1. Log Klasörü Oluşturma
```bash
mkdir -p ~/logs
```

### 2. PM2 Logs
```bash
# Real-time logs
pm2 logs

# Son 100 satır
pm2 logs --lines 100

# Sadece error logs
pm2 logs --err

# Log dosyalarını temizle
pm2 flush
```

### 3. Nginx Logs
```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log

# Grep ile filtreleme
sudo grep "404" /var/log/nginx/access.log
```

### 4. PostgreSQL Logs
```bash
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### 5. System Monitoring
```bash
# CPU ve Memory
htop

# Disk kullanımı
df -h

# Network
sudo iftop

# Process'ler
ps aux | grep node
```

---

## 🚀 Deployment Workflow

### Güncellemeler için
```bash
# 1. Yeni kodu çek (Git kullanıyorsan)
cd ~/canary-rental
git pull origin main

# 2. Backend güncelle
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart canary-backend

# 3. Frontend güncelle
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/canary-frontend/

# 4. Nginx reload
sudo systemctl reload nginx

# 5. Test et
curl http://localhost:3001/health
curl http://localhost
```

---

## 📋 Hızlı Başlatma Checklist

### İlk Kurulum
- [ ] Ubuntu Server 24.04 LTS kurulumu
- [ ] SSH erişimi aktif
- [ ] Node.js 20 LTS kurulumu
- [ ] PostgreSQL 15 kurulumu
- [ ] Nginx kurulumu
- [ ] PM2 kurulumu
- [ ] Proje dosyalarını transfer
- [ ] Database oluşturma ve migration
- [ ] Backend .env yapılandırması
- [ ] Backend build ve PM2 başlatma
- [ ] Frontend build
- [ ] Nginx configuration
- [ ] Firewall ayarları
- [ ] SSL sertifikası (domain varsa)
- [ ] Otomatik backup kurulumu

### Test
- [ ] Backend health check: `curl http://server-ip:3001/health`
- [ ] Frontend erişimi: `http://server-ip`
- [ ] Database bağlantısı test
- [ ] API endpoints test
- [ ] PM2 process monitoring
- [ ] Log dosyaları kontrol

---

## 💰 Maliyet Karşılaştırması

### Railway + Vercel (Şu Anki)
```
Railway Hobby: $5/month (500 saat)
Vercel Hobby: $0/month (100 GB bandwidth)
Total: ~$5-10/month
```

### Ubuntu Server (Kendi Sunucu)
```
VPS (DigitalOcean/Hetzner): $6-12/month (4 GB RAM)
Veya
Fiziksel Server: $0/month (elektrik hariç)
Domain: $10-15/year
SSL: $0 (Let's Encrypt)
Total: $6-12/month veya one-time maliyet
```

### Avantajlar
✅ Tam kontrol  
✅ Sınırsız database  
✅ Sınırsız bandwidth  
✅ Özelleştirilebilir  
✅ Öğrenme deneyimi  

### Dezavantajlar
⚠️ Manual maintenance  
⚠️ Security responsibility  
⚠️ Backup responsibility  
⚠️ Uptime monitoring  

---

## 🎓 Önerilen VPS Sağlayıcıları

1. **DigitalOcean** - $6/month (1 GB), $12/month (2 GB)
2. **Hetzner** - €4.51/month (4 GB) - En ucuz
3. **Linode** - $5/month (1 GB)
4. **Vultr** - $6/month (1 GB)
5. **AWS Lightsail** - $5/month (1 GB)

**Önerim:** Hetzner (fiyat/performans dengesi en iyi)

---

## 📞 Destek & Troubleshooting

### Sık Karşılaşılan Sorunlar

**1. Backend başlamıyor:**
```bash
pm2 logs canary-backend --err
# Database bağlantısını kontrol et
```

**2. Frontend beyaz sayfa:**
```bash
# API URL'i kontrol et
cat frontend/.env
# Nginx config kontrol et
sudo nginx -t
```

**3. Database bağlantı hatası:**
```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql
# Kullanıcı izinleri kontrol et
sudo -u postgres psql -c "\du"
```

**4. Port zaten kullanımda:**
```bash
# Portları kontrol et
sudo lsof -i :3001
sudo lsof -i :80
# Process'i öldür
sudo kill -9 <PID>
```

---

## ✅ SONUÇ

Ubuntu Server'a taşımak **TAM OLARAK MÜMKÜN** ve aslında birçok avantajı var:

### ✅ Avantajlar
1. **Tam kontrol** - Sınırsız özelleştirme
2. **Maliyet** - Uzun vadede daha ucuz
3. **Performans** - Dedicated resources
4. **Öğrenme** - Linux, DevOps, Nginx öğrenme
5. **Sınırsız** - Database, storage, bandwidth limiti yok

### ⚠️ Dikkat Edilecekler
1. Server güvenliği sizin sorumluluğunuzda
2. Backup'ları düzenli almanız gerekiyor
3. Uptime monitoring sizin sorumluluğunuzda
4. DNS ve domain yapılandırması gerekebilir

### 🚀 Önerim
Railway/Vercel'de kalın **VE** kendi server'ınıza da kurun:
- Production: Railway/Vercel (güvenli, stabil)
- Staging/Test: Kendi server (denemeler için)
- Backup: Kendi server (yedek sistem)

İsterseniz adım adım kuruluma başlayabiliriz! 🎯
