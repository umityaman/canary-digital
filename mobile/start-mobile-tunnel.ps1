# Canary Mobile App Starter Script (Tunnel Mode)
# Bu script mobil uygulamayı public URL (tunnel) ile başlatır
# LAN bağlantısı çalışmazsa bu script'i kullanın

Write-Host "🚀 Canary Mobile App Başlatılıyor (Tunnel Mode)..." -ForegroundColor Cyan
Write-Host ""

# Dizin kontrolü
$mobileDir = "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile"
Set-Location $mobileDir

Write-Host "📁 Dizin: $mobileDir" -ForegroundColor Green
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

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  EXPO BAŞLATILIYOR (TUNNEL MODE)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Tunnel modu ngrok kullanır - ilk bağlantı yavaş olabilir" -ForegroundColor Yellow
Write-Host "📱 Telefondaki Expo Go uygulamasıyla QR kodunu tarayın" -ForegroundColor Yellow
Write-Host "🔗 Public URL oluşturulacak (örn: exp://abc-xyz.ngrok.io:80)" -ForegroundColor Yellow
Write-Host ""

# Expo'yu tunnel mode ile başlat
npx expo start --tunnel

Write-Host ""
Write-Host "Expo kapandı." -ForegroundColor Yellow
