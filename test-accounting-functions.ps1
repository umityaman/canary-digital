# Test Accounting Page Functions
# Bu script muhasebe sayfasındaki fonksiyonları test eder

$baseUrl = "https://canary-backend-672344972017.europe-west1.run.app"
$token = ""  # Token buraya eklenecek

Write-Host "`n=== MUHASEBE SAYFASI FONKSİYON TESTLERİ ===" -ForegroundColor Cyan
Write-Host "Backend URL: $baseUrl`n" -ForegroundColor Gray

# Test 1: Accounting Stats
Write-Host "1. Testing /api/accounting/stats..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounting/stats" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Stats API works" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Stats API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Invoices List
Write-Host "`n2. Testing /api/invoices..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/invoices?page=1&limit=10" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Invoices API works" -ForegroundColor Green
    Write-Host "   Count: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Invoices API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Offers List
Write-Host "`n3. Testing /api/offers..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/offers?page=1&limit=10" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Offers API works" -ForegroundColor Green
    Write-Host "   Count: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Offers API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Checks API
Write-Host "`n4. Testing /api/checks..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/checks?limit=50" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Checks API works" -ForegroundColor Green
    Write-Host "   Count: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Checks API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Promissory Notes API
Write-Host "`n5. Testing /api/promissory-notes..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/promissory-notes?limit=50" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Promissory Notes API works" -ForegroundColor Green
    Write-Host "   Count: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Promissory Notes API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Aging Report
Write-Host "`n6. Testing /api/aging/combined..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/aging/combined" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✓ Aging Report API works" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Aging Report API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST TAMAMLANDI ===" -ForegroundColor Cyan
Write-Host "`nNot: Token eklemek için login olun ve token'ı script'e ekleyin.`n" -ForegroundColor Yellow
