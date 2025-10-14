# CANARY ERP - Quick Start Script
Write-Host "Starting CANARY ERP Servers..." -ForegroundColor Cyan
Write-Host ""

# Kill all node processes
Write-Host "Cleaning up..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "READY!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Login: admin@test.com / password123" -ForegroundColor Yellow
Write-Host ""

# Open browser
$open = Read-Host "Open browser? (Y/N)"
if ($open -eq "Y") {
    Start-Process "http://localhost:5173"
}
