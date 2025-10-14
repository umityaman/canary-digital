@echo off
echo ================================================
echo    CANARY RESTART (QUICK)
echo ================================================
echo.
echo [1/3] Stopping servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Starting backend...
cd backend
start "CANARY-BACKEND" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting frontend...
cd ..\frontend
start "CANARY-FRONTEND" cmd /k "npm run dev"

echo.
echo ✓ Servers restarted!
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:5173
timeout /t 2 /nobreak >nul
start http://localhost:5173