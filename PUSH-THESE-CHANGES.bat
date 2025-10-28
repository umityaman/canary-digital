@echo off
echo ========================================
echo GIT PUSH SCRIPT - Production Bug Fixes
echo ========================================
echo.

cd /d "C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156"

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Adding modified files...
git add backend/src/app.ts
git add backend/src/routes/invoice.ts
git add frontend/src/pages/Accounting.tsx
git add frontend/src/services/api.ts
echo Files staged!
echo.

echo [3/4] Committing changes...
git commit -m "fix: Production fixes - Account Cards hidden + Invoice create/update + UTF-8 charset + companyId filter"
echo.

echo [4/4] Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Done! Check the output above.
echo If you see "Writing objects: 100%" = SUCCESS
echo ========================================
pause
