# Production E-Fatura Test Script
$BASE_URL = "https://canary-backend-672344972017.europe-west1.run.app"

Write-Host "🔐 Logging in..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post -Body (@{
    email = "admin@canary.com"
    password = "admin123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.accessToken
Write-Host "✅ Login successful" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Fetching invoices..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
}

$invoices = Invoke-RestMethod -Uri "$BASE_URL/api/invoices" -Method Get -Headers $headers
$firstInvoice = $invoices[0]

if ($firstInvoice) {
    Write-Host "✅ Found invoice: $($firstInvoice.id)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📄 Generating E-Invoice..." -ForegroundColor Cyan
    try {
        $generateResponse = Invoke-RestMethod -Uri "$BASE_URL/api/einvoice/generate" -Method Post -Headers $headers -Body (@{
            invoiceId = $firstInvoice.id
        } | ConvertTo-Json) -ContentType "application/json"
        
        Write-Host "✅ E-Invoice generated: $($generateResponse.id)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📤 Sending E-Invoice..." -ForegroundColor Cyan
        $sendResponse = Invoke-RestMethod -Uri "$BASE_URL/api/einvoice/send" -Method Post -Headers $headers -Body (@{
            eInvoiceId = $generateResponse.id
        } | ConvertTo-Json) -ContentType "application/json"
        
        Write-Host "✅ E-Invoice sent" -ForegroundColor Green
        Write-Host "   Status: $($sendResponse.status)" -ForegroundColor Yellow
        Write-Host "   UUID: $($sendResponse.uuid)" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "📊 Checking status..." -ForegroundColor Cyan
        $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/api/einvoice/status/$($generateResponse.id)" -Method Get -Headers $headers
        Write-Host "✅ Current status: $($statusResponse.status)" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No invoices found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Production E-Fatura test completed!" -ForegroundColor Green
