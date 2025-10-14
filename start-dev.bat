@echo off
echo ================================================
echo    CANARY DEVELOPMENT SERVER LAUNCHER
echo ================================================
echo.

REM Kill all existing node processes
echo [1/6] Mevcut node processleri durduruluyor...
taskkill /F /IM node.exe >nul 2>&1
echo     ✓ Node processleri temizlendi

REM Wait a moment
timeout /t 2 /nobreak >nul

echo.
echo [2/6] Backend dependencies kontrol ediliyor...
cd backend
if not exist node_modules (
    echo     Installing backend dependencies...
    npm install
) else (
    echo     ✓ Backend dependencies mevcut
)

echo.
echo [3/6] Frontend dependencies kontrol ediliyor...
cd ..\frontend
if not exist node_modules (
    echo     Installing frontend dependencies...
    npm install
) else (
    echo     ✓ Frontend dependencies mevcut
)

echo.
echo [4/6] Database migrations kontrol ediliyor...
cd ..\backend
echo     Running database setup...
npx prisma generate >nul 2>&1
npx prisma db push >nul 2>&1
echo     ✓ Database hazir

echo.
echo [5/6] Backend server baslatiliyor... (Port 4000)
cd backend
start "CANARY-BACKEND" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [6/6] Frontend server baslatiliyor... (Port 5173)
cd ..\frontend
start "CANARY-FRONTEND" cmd /k "npm run dev"

echo.
echo ================================================
echo   🚀 SERVERS STARTED SUCCESSFULLY!
echo ================================================
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:5173
echo   API:      http://localhost:4000/api
echo ================================================
echo.
echo   Press any key to open browser...
pause >nul
start http://localhost:5173

echo   Development servers are running in separate windows.
echo   Close those windows to stop the servers.
pause
