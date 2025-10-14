@echo off
echo ================================================
echo    CANARY SERVER STOPPER
echo ================================================
echo.
echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo ✓ All servers stopped
echo.
echo Press any key to exit...
pause >nul