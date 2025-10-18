# 🧪 POST-DEPLOYMENT TEST SCRIPT
# Date: October 17, 2025
# Purpose: Verify all 3 bug fixes are working in production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 POST-DEPLOYMENT BUG FIX TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$backendUrl = "https://canary-backend-672344972017.europe-west1.run.app"
$frontendUrl = "https://canary-frontend-672344972017.europe-west1.run.app"
$email = "admin@canary.com"
$password = "admin123"

# Test Results
$passedTests = 0
$failedTests = 0

# ===================================
# TEST #1: Dashboard Stats API (Bug #1)
# ===================================
Write-Host "📊 Test #1: Dashboard Stats API (Bug #1 Fix)" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Yellow

try {
    # Step 1: Login
    Write-Host "  → Logging in..." -NoNewline
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $token = $loginResponse.token
    Write-Host " ✓" -ForegroundColor Green
    
    # Step 2: Call Dashboard Stats
    Write-Host "  → Fetching dashboard stats..." -NoNewline
    $statsResponse = Invoke-RestMethod -Uri "$backendUrl/api/dashboard/stats" `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -ErrorAction Stop
    
    Write-Host " ✓" -ForegroundColor Green
    
    # Verify response structure
    if ($statsResponse.totalRevenue -ne $null -and 
        $statsResponse.totalOrders -ne $null -and 
        $statsResponse.totalEquipment -ne $null -and 
        $statsResponse.totalCustomers -ne $null) {
        
        Write-Host ""
        Write-Host "  ✅ Bug #1 FIXED!" -ForegroundColor Green
        Write-Host "  📈 Dashboard Stats:" -ForegroundColor Cyan
        Write-Host "     - Total Revenue: $($statsResponse.totalRevenue)" -ForegroundColor White
        Write-Host "     - Total Orders: $($statsResponse.totalOrders)" -ForegroundColor White
        Write-Host "     - Total Equipment: $($statsResponse.totalEquipment)" -ForegroundColor White
        Write-Host "     - Total Customers: $($statsResponse.totalCustomers)" -ForegroundColor White
        $passedTests++
    } else {
        Write-Host ""
        Write-Host "  ❌ Bug #1 NOT FIXED - Invalid response structure" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "  ❌ Bug #1 NOT FIXED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

Write-Host ""

# ===================================
# TEST #2: Error Toast Duration (Bug #2)
# ===================================
Write-Host "⏱️  Test #2: Error Toast Duration (Bug #2 Fix)" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Yellow
Write-Host "  ℹ️  This test requires MANUAL verification:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  STEPS:" -ForegroundColor White
Write-Host "  1. Open: $frontendUrl" -ForegroundColor Gray
Write-Host "  2. Enter email: $email" -ForegroundColor Gray
Write-Host "  3. Enter WRONG password: wrong123" -ForegroundColor Gray
Write-Host "  4. Click Login" -ForegroundColor Gray
Write-Host "  5. Observe error toast message" -ForegroundColor Gray
Write-Host ""
Write-Host "  EXPECTED RESULT:" -ForegroundColor White
Write-Host "  ✓ Error message stays visible for ~5 seconds" -ForegroundColor Green
Write-Host "  ✓ Previous behavior: disappeared in ~3 seconds" -ForegroundColor Gray
Write-Host ""
Write-Host "  Opening frontend in browser..." -ForegroundColor Cyan

# Open browser for manual test
Start-Process $frontendUrl

Write-Host ""
$manualTest2 = Read-Host "  Did error toast stay for 5 seconds? (y/n)"
if ($manualTest2 -eq 'y') {
    Write-Host "  ✅ Bug #2 FIXED!" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "  ❌ Bug #2 NOT FIXED" -ForegroundColor Red
    $failedTests++
}

Write-Host ""

# ===================================
# TEST #3: Equipment Price Input (Bug #4)
# ===================================
Write-Host "💰 Test #3: Equipment Price Input (Bug #4 Fix)" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Yellow
Write-Host "  ℹ️  This test requires MANUAL verification:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  STEPS:" -ForegroundColor White
Write-Host "  1. Already opened: $frontendUrl" -ForegroundColor Gray
Write-Host "  2. Login with: $email / $password" -ForegroundColor Gray
Write-Host "  3. Navigate to Equipment page" -ForegroundColor Gray
Write-Host "  4. Click 'Add Equipment' button" -ForegroundColor Gray
Write-Host "  5. Fill all required fields:" -ForegroundColor Gray
Write-Host "     - Name: Test Camera" -ForegroundColor Gray
Write-Host "     - Brand: Sony" -ForegroundColor Gray
Write-Host "     - Model: A7" -ForegroundColor Gray
Write-Host "     - Category: Camera" -ForegroundColor Gray
Write-Host "     - Daily Price: Type '0500'" -ForegroundColor Gray
Write-Host "  6. Observe the price field" -ForegroundColor Gray
Write-Host "  7. Click Save" -ForegroundColor Gray
Write-Host ""
Write-Host "  EXPECTED RESULTS:" -ForegroundColor White
Write-Host "  ✓ Leading zero removed automatically (shows '500')" -ForegroundColor Green
Write-Host "  ✓ No validation error" -ForegroundColor Green
Write-Host "  ✓ Equipment created successfully" -ForegroundColor Green
Write-Host "  ✓ Previous behavior: validation error on save" -ForegroundColor Gray
Write-Host ""

$manualTest3 = Read-Host "  Did equipment save successfully with price 500? (y/n)"
if ($manualTest3 -eq 'y') {
    Write-Host "  ✅ Bug #4 FIXED!" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "  ❌ Bug #4 NOT FIXED" -ForegroundColor Red
    $failedTests++
}

Write-Host ""

# ===================================
# SUMMARY
# ===================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total Tests: 3" -ForegroundColor White
Write-Host "  ✅ Passed: $passedTests" -ForegroundColor Green
Write-Host "  ❌ Failed: $failedTests" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($passedTests / 3) * 100, 2)

if ($failedTests -eq 0) {
    Write-Host "  🎉 ALL BUGS FIXED! Success Rate: 100%" -ForegroundColor Green
    Write-Host ""
    Write-Host "  ✅ Bug #1: Dashboard Stats API - WORKING" -ForegroundColor Green
    Write-Host "  ✅ Bug #2: Error Toast Duration - WORKING" -ForegroundColor Green
    Write-Host "  ✅ Bug #4: Equipment Price Input - WORKING" -ForegroundColor Green
} elseif ($passedTests -ge 2) {
    Write-Host "  ⚠️  MOSTLY FIXED! Success Rate: $successRate%" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ DEPLOYMENT ISSUES! Success Rate: $successRate%" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Possible causes:" -ForegroundColor Yellow
    Write-Host "  - CI/CD deployment still in progress" -ForegroundColor Gray
    Write-Host "  - Cache needs to be cleared" -ForegroundColor Gray
    Write-Host "  - GCP Cloud Run instances not restarted" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Recommended actions:" -ForegroundColor Yellow
    Write-Host "  1. Check GitHub Actions: https://github.com/umityaman/canary-digital/actions" -ForegroundColor Gray
    Write-Host "  2. Wait 5-10 minutes for deployment to complete" -ForegroundColor Gray
    Write-Host "  3. Re-run this test script" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🏁 TESTING COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update Documents/BUG_REPORT_DAY1.md with test results" -ForegroundColor Gray
Write-Host "2. Commit test script and summary" -ForegroundColor Gray
Write-Host "3. Begin Day 2 tasks (Notification System)" -ForegroundColor Gray
Write-Host ""
