# Quick Browser Test - Check Console Errors
# This script opens browser and checks for console errors

$url = "https://canary-frontend-672344972017.europe-west1.run.app"

Write-Host "=== BROWSER TEST GUIDE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Opening production URL in browser..." -ForegroundColor Yellow
Write-Host "   URL: $url" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Manual steps to follow:" -ForegroundColor Yellow
Write-Host "   a. Press F12 to open Developer Console" -ForegroundColor White
Write-Host "   b. Go to Console tab" -ForegroundColor White
Write-Host "   c. Filter by 'Errors' (click red icon)" -ForegroundColor White
Write-Host "   d. Login: admin@canary.com / admin123" -ForegroundColor White
Write-Host "   e. Navigate to: Accounting → Kasa & Banka" -ForegroundColor White
Write-Host "   f. Navigate to: Accounting → Banka Mutabakatı" -ForegroundColor White
Write-Host ""
Write-Host "3. Expected Results:" -ForegroundColor Yellow
Write-Host "   ✅ NO red errors in console" -ForegroundColor Green
Write-Host "   ✅ Warnings are OK (gray/yellow)" -ForegroundColor Green
Write-Host "   ✅ Pages load without crashing" -ForegroundColor Green
Write-Host "   ⚠️  You may see: 'Bank accounts not available, using defaults'" -ForegroundColor Gray
Write-Host "   ⚠️  You may see: 'Cash data not available, using defaults'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Should NOT see:" -ForegroundColor Yellow
Write-Host "   ❌ ReferenceError: generateMockBankData is not defined" -ForegroundColor Red
Write-Host "   ❌ Unexpected token '<'" -ForegroundColor Red
Write-Host "   ❌ Cannot resolve import 'react-icons/fa'" -ForegroundColor Red
Write-Host ""

# Open browser
Write-Host "Opening browser in 3 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process $url

Write-Host ""
Write-Host "Press any key after completing browser tests..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Test completed! Check the checklist: PRODUCTION_TEST_CHECKLIST.md" -ForegroundColor Green
