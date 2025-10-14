# CANARY ERP - Hızlı Restart Scripti
# Sunucuları hızlıca yeniden başlatır

Write-Host "🔄 Sunucular yeniden başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# Stop
& "$PSScriptRoot\stop-servers.ps1"

Write-Host ""
Start-Sleep -Seconds 2

# Start
& "$PSScriptRoot\start-servers.ps1"
