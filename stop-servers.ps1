# CANARY ERP - Sunucu Durdurma Scripti
# Tüm backend ve frontend process'lerini güvenli şekilde durdurur

Write-Host "========================================" -ForegroundColor Red
Write-Host "   CANARY ERP - Sunucular Durduruluyor   " -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Tüm node process'lerini durdur
Write-Host "Node process'leri durduruluyor..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "  Durduruluyor: PID $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ $($nodeProcesses.Count) Node process durduruldu" -ForegroundColor Green
} else {
    Write-Host "✓ Çalışan Node process bulunamadı" -ForegroundColor Green
}

Write-Host ""

# Port kontrolü
Write-Host "Port'lar kontrol ediliyor..." -ForegroundColor Yellow
$port4000 = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port4000) {
    Write-Host "Port 4000 temizleniyor..." -ForegroundColor Yellow
    Stop-Process -Id $port4000.OwningProcess -Force -ErrorAction SilentlyContinue
}
if ($port5173) {
    Write-Host "Port 5173 temizleniyor..." -ForegroundColor Yellow
    Stop-Process -Id $port5173.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "✓ Port'lar temizlendi (4000, 5173)" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✓ SUNUCULAR DURDURULDU   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Yeniden başlatmak için: .\start-servers.ps1" -ForegroundColor Gray
Write-Host ""
