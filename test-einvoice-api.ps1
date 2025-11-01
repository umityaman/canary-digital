# E-Fatura API Test Script
$ErrorActionPreference = "Continue"
$BASE_URL = "http://localhost:4000"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   E-FATURA API TEST" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login to get token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = '{"email":"admin@canary.com","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

$TOKEN = $loginResponse.token
Write-Host "Success - Login OK" -ForegroundColor Green
Write-Host ""

# Headers with token
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# 2. Get first invoice
Write-Host "Step 2: Fetching invoices..." -ForegroundColor Yellow
try {
    $invoicesResponse = Invoke-RestMethod -Uri "$BASE_URL/api/invoices" -Method GET -Headers $headers
    
    if ($invoicesResponse.data.Count -gt 0) {
        $INVOICE_ID = $invoicesResponse.data[0].id
        Write-Host "Success - Found invoice ID: $INVOICE_ID" -ForegroundColor Green
    } else {
        Write-Host "Error - No invoices found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error fetching invoices" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Generate E-Invoice
Write-Host "Step 3: Generating e-Invoice..." -ForegroundColor Yellow
try {
    $generateBody = "{`"invoiceId`":`"$INVOICE_ID`"}"
    $generateResponse = Invoke-RestMethod -Uri "$BASE_URL/api/einvoice/generate" -Method POST -Headers $headers -Body $generateBody
    
    $EINVOICE_ID = $generateResponse.id
    Write-Host "Success - E-Invoice ID: $EINVOICE_ID" -ForegroundColor Green
} catch {
    Write-Host "Error generating e-invoice: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Send E-Invoice
Write-Host "Step 4: Sending e-Invoice..." -ForegroundColor Yellow
try {
    $sendResponse = Invoke-RestMethod -Uri "$BASE_URL/api/einvoice/send/$EINVOICE_ID" -Method POST -Headers $headers
    Write-Host "Success - E-Invoice sent" -ForegroundColor Green
} catch {
    Write-Host "Error sending e-invoice" -ForegroundColor Red
}
Write-Host ""

# 5. Check Status
Write-Host "Step 5: Checking status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/api/einvoice/status/$EINVOICE_ID" -Method GET -Headers $headers
    Write-Host "Success - Status: $($statusResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "Error checking status" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   TEST COMPLETED" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
