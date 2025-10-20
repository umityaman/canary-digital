# Backend Server Starter
Write-Host "🚀 Canary Backend Server Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

$backendDir = "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend"
Set-Location $backendDir

Write-Host "📁 Dizin: $backendDir" -ForegroundColor Green
Write-Host ""

# Port 4000 kontrolü
Write-Host "🔍 Port 4000 kontrolü..." -ForegroundColor Yellow
$portInUse = Test-NetConnection -ComputerName localhost -Port 4000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  Port 4000 zaten kullanımda!" -ForegroundColor Red
    Write-Host "Çalışan node process'leri durduruluyor..." -ForegroundColor Yellow
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  BACKEND SERVER BAŞLATILIYOR" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Backend API: http://192.168.1.39:4000" -ForegroundColor Yellow
Write-Host "📚 Swagger Docs: http://192.168.1.39:4000/api-docs" -ForegroundColor Yellow
Write-Host ""

npm run dev
