# Deployment Status Checker
# Automatically checks if new version is deployed

$FRONTEND_URL = "https://canary-frontend-672344972017.europe-west1.run.app"
$BACKEND_URL = "https://canary-backend-672344972017.europe-west1.run.app"
$EXPECTED_BUNDLE = "ExpenseTab-Dnb6U7uZ.js"

Write-Host "=== DEPLOYMENT STATUS CHECKER ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "Expected bundle: $EXPECTED_BUNDLE" -ForegroundColor Gray
Write-Host ""

$attempts = 0
$maxAttempts = 15
$deployed = $false

while ($attempts -lt $maxAttempts -and -not $deployed) {
    $attempts++
    
    Write-Host "[$attempts/$maxAttempts] Checking... " -NoNewline -ForegroundColor Cyan
    
    try {
        # Check frontend
        $html = (Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing -TimeoutSec 10).Content
        
        if ($html -match $EXPECTED_BUNDLE) {
            Write-Host "✅ DEPLOYED!" -ForegroundColor Green
            $deployed = $true
            
            # Test backend too
            Write-Host ""
            Write-Host "Testing backend..." -ForegroundColor Yellow
            
            try {
                $token = (Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" `
                    -Method Post `
                    -Body (@{email="admin@canary.com";password="admin123"} | ConvertTo-Json) `
                    -ContentType "application/json" `
                    -TimeoutSec 10).token
                
                $headers = @{"Authorization"="Bearer $token"}
                $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/accounting/expenses?page=1&limit=10" `
                    -Headers $headers `
                    -TimeoutSec 10
                
                Write-Host "✅ Backend also deployed!" -ForegroundColor Green
                Write-Host "   Expenses returned: $($response.data.Length) items" -ForegroundColor Gray
            } catch {
                Write-Host "⚠️  Backend might still be deploying" -ForegroundColor Yellow
            }
            
            break
        } else {
            Write-Host "⏳ Still old version" -ForegroundColor Yellow
            
            if ($attempts -lt $maxAttempts) {
                Write-Host "   Waiting 60 seconds..." -ForegroundColor Gray
                Start-Sleep -Seconds 60
            }
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($attempts -lt $maxAttempts) {
            Write-Host "   Retrying in 60 seconds..." -ForegroundColor Gray
            Start-Sleep -Seconds 60
        }
    }
}

Write-Host ""

if ($deployed) {
    Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Clear browser cache (Ctrl+Shift+R)" -ForegroundColor Cyan
    Write-Host "2. Reload application" -ForegroundColor Cyan
    Write-Host "3. Run tests:" -ForegroundColor Cyan
    Write-Host "   .\browser-test.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Production URLs:" -ForegroundColor White
    Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor Cyan
    Write-Host "  Backend:  $BACKEND_URL" -ForegroundColor Cyan
} else {
    Write-Host "=== DEPLOYMENT TIMEOUT ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Deployment did not complete in $($maxAttempts) minutes." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check GitHub Actions:" -ForegroundColor White
    Write-Host "  https://github.com/umityaman/canary-digital/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or try manual deployment:" -ForegroundColor White
    Write-Host "  cd frontend && gcloud builds submit" -ForegroundColor Yellow
}
