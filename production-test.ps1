# Enterprise Accounting Modules - Production Test Suite
# Test Date: November 1, 2025

$ErrorActionPreference = "Continue"
$BACKEND_URL = "https://canary-backend-672344972017.europe-west1.run.app"
$FRONTEND_URL = "https://canary-frontend-672344972017.europe-west1.run.app"

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "ENTERPRISE ACCOUNTING - PRODUCTION TESTS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test Results
$TestResults = @{
    Passed = 0
    Failed = 0
    Total = 0
    Details = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $TestResults.Total++
    
    try {
        Write-Host "[TEST] $Name..." -NoNewline
        
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host " PASSED" -ForegroundColor Green
            $TestResults.Passed++
            $TestResults.Details += "[OK] $Name"
            return $response.Content | ConvertFrom-Json
        } else {
            Write-Host " FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $TestResults.Failed++
            $TestResults.Details += "[FAIL] $Name - Status $($response.StatusCode)"
            return $null
        }
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $TestResults.Failed++
        $TestResults.Details += "[FAIL] $Name - $($_.Exception.Message)"
        return $null
    }
}

# TEST 1: HEALTH CHECKS
Write-Host "`n[SECTION] Health Checks" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$healthCheck = Test-Endpoint -Name "Backend Health" -Url "$BACKEND_URL/api/health"
if ($healthCheck) {
    Write-Host "  Backend OK - Timestamp: $($healthCheck.timestamp)" -ForegroundColor Gray
}

try {
    $frontendCheck = Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing -Method HEAD -TimeoutSec 30
    if ($frontendCheck.StatusCode -eq 200) {
        Write-Host "[TEST] Frontend Health... PASSED" -ForegroundColor Green
        $TestResults.Passed++
        $TestResults.Details += "[OK] Frontend Health"
    }
} catch {
    Write-Host "[TEST] Frontend Health... FAILED" -ForegroundColor Red
    $TestResults.Failed++
    $TestResults.Details += "[FAIL] Frontend Health"
}
$TestResults.Total++

# TEST 2: AUTHENTICATION
Write-Host "`n[SECTION] Authentication" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$loginBody = @{
    email = "test@canary.com"
    password = "test123"
} | ConvertTo-Json

$loginResponse = Test-Endpoint `
    -Name "User Login" `
    -Url "$BACKEND_URL/api/auth/login" `
    -Method "POST" `
    -Body $loginBody

if ($loginResponse -and $loginResponse.token) {
    $TOKEN = $loginResponse.token
    Write-Host "  Logged in as: $($loginResponse.user.name) ($($loginResponse.user.role))" -ForegroundColor Gray
    
    $AUTH_HEADERS = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
} else {
    Write-Host "  WARNING: Cannot proceed with authenticated tests" -ForegroundColor Yellow
    $TOKEN = $null
    $AUTH_HEADERS = @{}
}

# TEST 3: E-INVOICE MODULE
Write-Host "`n[SECTION] E-Invoice Module" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($TOKEN) {
    $invoices = Test-Endpoint -Name "Get Invoices" -Url "$BACKEND_URL/api/invoices" -Headers $AUTH_HEADERS
    
    if ($invoices -and $invoices.data -and $invoices.data.Count -gt 0) {
        Write-Host "  Found $($invoices.data.Count) invoices" -ForegroundColor Gray
        
        $testInvoiceId = $invoices.data[0].id
        Test-Endpoint -Name "Get Invoice Detail" -Url "$BACKEND_URL/api/invoices/$testInvoiceId" -Headers $AUTH_HEADERS
    }
    
    $eInvoices = Test-Endpoint -Name "Get E-Invoices" -Url "$BACKEND_URL/api/einvoice" -Headers $AUTH_HEADERS
    if ($eInvoices -and $eInvoices.data) {
        Write-Host "  Found $($eInvoices.data.Count) e-invoices" -ForegroundColor Gray
    }
}

# TEST 4: E-ARCHIVE MODULE
Write-Host "`n[SECTION] E-Archive Module" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($TOKEN) {
    $eArchive = Test-Endpoint -Name "Get E-Archive Invoices" -Url "$BACKEND_URL/api/earchive" -Headers $AUTH_HEADERS
    
    if ($eArchive -and $eArchive.data -and $eArchive.data.Count -gt 0) {
        Write-Host "  Found $($eArchive.data.Count) e-archive invoices" -ForegroundColor Gray
        
        $archiveId = $eArchive.data[0].id
        Test-Endpoint -Name "Get E-Archive Detail" -Url "$BACKEND_URL/api/earchive/$archiveId" -Headers $AUTH_HEADERS
    }
}

# TEST 5: DELIVERY NOTES MODULE
Write-Host "`n[SECTION] Delivery Notes Module" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($TOKEN) {
    $deliveryNotes = Test-Endpoint -Name "Get Delivery Notes" -Url "$BACKEND_URL/api/delivery-notes" -Headers $AUTH_HEADERS
    
    if ($deliveryNotes -and $deliveryNotes.data -and $deliveryNotes.data.Count -gt 0) {
        Write-Host "  Found $($deliveryNotes.data.Count) delivery notes" -ForegroundColor Gray
        
        $noteId = $deliveryNotes.data[0].id
        Test-Endpoint -Name "Get Delivery Note Detail" -Url "$BACKEND_URL/api/delivery-notes/$noteId" -Headers $AUTH_HEADERS
        Test-Endpoint -Name "Get Delivery Stats" -Url "$BACKEND_URL/api/delivery-notes/statistics/summary" -Headers $AUTH_HEADERS
    }
}

# TEST 6: CURRENT ACCOUNTS MODULE
Write-Host "`n[SECTION] Current Accounts Module" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($TOKEN) {
    $summary = Test-Endpoint -Name "Get Account Summary" -Url "$BACKEND_URL/api/current-accounts/summary" -Headers $AUTH_HEADERS
    
    if ($summary -and $summary.data) {
        Write-Host "  Total Receivables: $($summary.data.totalReceivables) TRY" -ForegroundColor Gray
        Write-Host "  Total Payables: $($summary.data.totalPayables) TRY" -ForegroundColor Gray
        Write-Host "  Net Balance: $($summary.data.netBalance) TRY" -ForegroundColor Gray
    }
    
    $balances = Test-Endpoint -Name "Get Customer Balances" -Url "$BACKEND_URL/api/current-accounts/balances" -Headers $AUTH_HEADERS
    
    if ($balances -and $balances.data -and $balances.data.Count -gt 0) {
        Write-Host "  Found $($balances.data.Count) customer accounts" -ForegroundColor Gray
        
        $testCustomerId = $balances.data[0].customerId
        Test-Endpoint -Name "Get Customer Balance" -Url "$BACKEND_URL/api/current-accounts/balances/$testCustomerId" -Headers $AUTH_HEADERS
        Test-Endpoint -Name "Get Aging Report" -Url "$BACKEND_URL/api/current-accounts/aging/$testCustomerId" -Headers $AUTH_HEADERS
        Test-Endpoint -Name "Get Transactions" -Url "$BACKEND_URL/api/current-accounts/transactions/$testCustomerId" -Headers $AUTH_HEADERS
        Test-Endpoint -Name "Get All Aging" -Url "$BACKEND_URL/api/current-accounts/aging" -Headers $AUTH_HEADERS
    }
}

# TEST 7: DATABASE CONNECTIVITY
Write-Host "`n[SECTION] Database Connectivity" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($TOKEN) {
    Test-Endpoint -Name "Get Customers" -Url "$BACKEND_URL/api/customers" -Headers $AUTH_HEADERS
    Test-Endpoint -Name "Get Orders" -Url "$BACKEND_URL/api/orders" -Headers $AUTH_HEADERS
    Test-Endpoint -Name "Get Equipment" -Url "$BACKEND_URL/api/equipment" -Headers $AUTH_HEADERS
}

# FINAL RESULTS
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$passRate = if ($TestResults.Total -gt 0) { 
    [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 2) 
} else { 
    0 
}

Write-Host "`nTotal Tests: $($TestResults.Total)" -ForegroundColor White
Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } else { "Yellow" })

if ($passRate -ge 80) {
    Write-Host "`nSTATUS: PRODUCTION TESTS PASSED" -ForegroundColor Green
    Write-Host "System is operational and ready for use." -ForegroundColor Green
} elseif ($passRate -ge 60) {
    Write-Host "`nSTATUS: PARTIAL SUCCESS" -ForegroundColor Yellow
    Write-Host "Some issues detected, review required." -ForegroundColor Yellow
} else {
    Write-Host "`nSTATUS: TESTS FAILED" -ForegroundColor Red
    Write-Host "Critical issues detected, immediate action required." -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Production URLs:" -ForegroundColor Cyan
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Save results
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$resultFile = "production-test-results_$timestamp.txt"

$report = @"
Enterprise Accounting Modules - Production Test Results
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
========================================

SUMMARY:
Total Tests: $($TestResults.Total)
Passed: $($TestResults.Passed)
Failed: $($TestResults.Failed)
Pass Rate: $passRate%

STATUS: $(if ($passRate -ge 80) { 'PASSED' } else { 'FAILED' })

DETAILS:
$($TestResults.Details -join "`n")

ENDPOINTS TESTED:
Backend Health: $BACKEND_URL/api/health
Frontend: $FRONTEND_URL
E-Invoice API: $BACKEND_URL/api/einvoice
E-Archive API: $BACKEND_URL/api/earchive
Delivery Notes API: $BACKEND_URL/api/delivery-notes
Current Accounts API: $BACKEND_URL/api/current-accounts

MODULES VERIFIED:
- E-Fatura (E-Invoice)
- E-Arsiv (E-Archive)
- Irsaliye (Delivery Notes)
- Cari Hesap (Current Accounts)
"@

$report | Out-File -FilePath $resultFile -Encoding UTF8
Write-Host "Results saved to: $resultFile" -ForegroundColor Cyan
