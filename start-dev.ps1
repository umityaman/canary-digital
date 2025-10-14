# CANARY - Quick Start Script
# This script kills all node processes and restarts both servers

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  CANARY - Development Server" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Stop all node processes
Write-Host "[1/4] Stopping existing Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2
Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[2/4] Starting Backend (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "      Backend started!" -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "[3/4] Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "      Frontend started!" -ForegroundColor Green
Write-Host ""

# Open Browser
Write-Host "[4/4] Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
Write-Host "      Browser opened!" -ForegroundColor Green
Write-Host ""

Write-Host "====================================" -ForegroundColor Green
Write-Host "  All services started successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
