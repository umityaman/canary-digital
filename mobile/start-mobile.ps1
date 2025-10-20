# Canary Mobile App Starter Script
# Bu script mobil uygulamayı LAN IP ile başlatır

Write-Host "🚀 Canary Mobile App Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# Dizin kontrolü
$mobileDir = "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile"

# Önce current directory'yi göster
Write-Host "📍 Mevcut dizin: $PWD" -ForegroundColor Yellow

if (Test-Path $mobileDir) {
    Set-Location $mobileDir
    Write-Host "✅ Mobile dizinine geçildi: $PWD" -ForegroundColor Green
} else {
    Write-Host "❌ Mobile dizini bulunamadı: $mobileDir" -ForegroundColor Red
    exit 1
}

Write-Host ""

# package.json kontrolü
if (Test-Path "package.json") {
    Write-Host "✅ package.json bulundu" -ForegroundColor Green
} else {
    Write-Host "❌ package.json bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Çalışan node process'leri temizle
Write-Host "🧹 Çalışan node process'leri temizleniyor..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Backend kontrolü
Write-Host "🔍 Backend server kontrolü (port 4000)..." -ForegroundColor Yellow
$backendRunning = Test-NetConnection -ComputerName localhost -Port 4000 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $backendRunning) {
    Write-Host "⚠️  Backend server çalışmıyor!" -ForegroundColor Red
    Write-Host "Lütfen önce backend'i başlatın:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Backend başlattıktan sonra Enter'a basın"
}

Write-Host "✅ Backend server çalışıyor!" -ForegroundColor Green
Write-Host ""

# LAN IP'yi environment variable olarak ayarla
Write-Host "🌐 LAN IP ayarlanıyor: 192.168.1.39" -ForegroundColor Cyan
$env:REACT_NATIVE_PACKAGER_HOSTNAME = '192.168.1.39'

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  EXPO BAŞLATILIYOR - QR KODU BEKLEYİN" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Telefondaki Expo Go uygulamasıyla QR kodunu tarayın" -ForegroundColor Yellow
Write-Host "🔗 Beklenen adres: exp://192.168.1.39:8081" -ForegroundColor Yellow
Write-Host ""

# Expo'yu başlat
npx expo start --lan

Write-Host ""
Write-Host "Expo kapandı." -ForegroundColor Yellow
