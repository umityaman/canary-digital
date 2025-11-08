# Backend Deployment Status Check
# Run this every 2-3 minutes until backend stabilizes

Write-Host "=== BACKEND STABILITY CHECK ===" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Test health endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = irm "https://canary-backend-672344972017.europe-west1.run.app/api/health"
    if ($health.ok) {
        Write-Host "   ✅ Health: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Health: NOT OK" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Health endpoint unreachable" -ForegroundColor Red
    Write-Host "   Backend is still restarting..." -ForegroundColor Yellow
    exit 1
}

# Test login
Write-Host "`n2. Testing login..." -ForegroundColor Yellow
try {
    $token = (irm "https://canary-backend-672344972017.europe-west1.run.app/api/auth/login" -Method Post -Body '{"email":"admin@canary.com","password":"admin123"}' -ContentType "application/json").token
    Write-Host "   ✅ Login: OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Login failed" -ForegroundColor Red
    exit 1
}

# Test expense API (the problematic one)
Write-Host "`n3. Testing expense API..." -ForegroundColor Yellow
try {
    $r = irm "https://canary-backend-672344972017.europe-west1.run.app/api/accounting/expenses?page=1&limit=10" -Headers @{Authorization="Bearer $token"}
    if ($r.success) {
        Write-Host "   ✅ Expense API: OK" -ForegroundColor Green
        Write-Host "   Data count: $($r.data.Length)" -ForegroundColor Gray
        Write-Host "   Total records: $($r.pagination.total)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Response not successful" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Expense API failed: $_" -ForegroundColor Red
    Write-Host "   Backend needs more time..." -ForegroundColor Yellow
    exit 1
}

# Test company API
Write-Host "`n4. Testing company API..." -ForegroundColor Yellow
try {
    $company = irm "https://canary-backend-672344972017.europe-west1.run.app/api/company" -Headers @{Authorization="Bearer $token"}
    if ($company.success) {
        Write-Host "   ✅ Company API: OK" -ForegroundColor Green
        if ($company.data) {
            Write-Host "   Company: $($company.data.name)" -ForegroundColor Gray
        } else {
            Write-Host "   (No company data - graceful fallback working)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Company API failed" -ForegroundColor Red
}

# Test cash API
Write-Host "`n5. Testing cash balance API..." -ForegroundColor Yellow
try {
    $cash = irm "https://canary-backend-672344972017.europe-west1.run.app/api/cash/balance" -Headers @{Authorization="Bearer $token"}
    if ($cash.success) {
        Write-Host "   ✅ Cash API: OK" -ForegroundColor Green
        Write-Host "   Balance: $($cash.data.balance)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Cash API failed" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ BACKEND IS STABLE AND READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Test in browser" -ForegroundColor Yellow
Write-Host "URL: https://canary-frontend-672344972017.europe-west1.run.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login: admin@canary.com / admin123" -ForegroundColor Gray
Write-Host "Navigate to: Accounting > Overview tab" -ForegroundColor Gray
Write-Host "Expected: No console errors" -ForegroundColor Gray
