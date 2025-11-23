Write-Host " Analyzing differences between Nov 19 and current Accounting.tsx..." -ForegroundColor Cyan

# File sizes
$nov19Size = (Get-Item './accounting-nov19-readable.js').Length
$currentSize = (Get-Item './frontend/src/pages/Accounting.tsx').Length

Write-Host ""
Write-Host " File Size Comparison:" -ForegroundColor Yellow
Write-Host "  Nov 19 (beautified JS): $($nov19Size) bytes"
Write-Host "  Current (TSX): $($currentSize) bytes"
Write-Host "  Difference: $($nov19Size - $currentSize) bytes ($([math]::Round((($nov19Size - $currentSize) / $nov19Size) * 100, 2))% larger)"

# Line counts
$nov19Lines = (Get-Content './accounting-nov19-readable.js').Count
$currentLines = (Get-Content './frontend/src/pages/Accounting.tsx').Count

Write-Host ""
Write-Host " Line Count Comparison:" -ForegroundColor Yellow
Write-Host "  Nov 19: $nov19Lines lines"
Write-Host "  Current: $currentLines lines"
Write-Host "  Lost: $($nov19Lines - $currentLines) lines"

Write-Host ""
Write-Host " KEY FINDING:" -ForegroundColor Green
Write-Host "  The Nov 19 version is SIGNIFICANTLY larger!"
Write-Host "  This suggests substantial features were lost."
Write-Host ""
Write-Host " RECOMMENDATION:" -ForegroundColor Magenta
Write-Host "  Since manual conversion would take 1-2 hours,"
Write-Host "  let me create a HYBRID solution:"
Write-Host "  1. Keep your current working components"
Write-Host "  2. Add back the missing embedded components from Nov 19"
Write-Host "  3. Preserve the working structure"
