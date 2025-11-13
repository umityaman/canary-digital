# Read file
$filePath = "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\pages\Accounting.tsx"
$content = Get-Content $filePath -Raw

# Define markers
$startMarker = "            {/* Offer Tab */"

# Find start
$startPos = $content.IndexOf($startMarker)
if ($startPos -eq -1) {
    Write-Host "Could not find start marker" -ForegroundColor Red
    exit 1
}

# Look for next tab comment after offer tab (should be Dashboard or another tab)
$searchAfter = $content.Substring($startPos + 100)
$nextTabPattern = "`n`n            {/\* .+ Tab \*/}"

# Search for pattern manually - find double newline followed by tab comment
$searchPos = $startPos + 100
$endPos = -1

while ($searchPos -lt $content.Length - 100) {
    if ($content.Substring($searchPos, 2) -eq "`n`n") {
        $checkStr = $content.Substring($searchPos, 50)
        if ($checkStr -match "^\s+{/\* .+ Tab \*/}") {
            $endPos = $searchPos
            break
        }
    }
    $searchPos++
}

if ($endPos -eq -1) {
    Write-Host "Could not find end marker" -ForegroundColor Red
    exit 1
}

# Extract parts
$before = $content.Substring(0, $startPos)
$after = $content.Substring($endPos)

# New content
$newOfferTab = @"
            {/* Offer Tab */}
            {activeTab === 'offer' && (
              <ErrorBoundary fallbackTitle="Teklif Listesi Hatası" fallbackMessage="Teklif listesi yüklenirken bir sorun oluştu.">
                <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
                  <OfferList />
                </Suspense>
              </ErrorBoundary>
            )}

"@

# Combine
$newContent = $before + $newOfferTab + $after

# Write back
$newContent | Set-Content $filePath -NoNewline

Write-Host "✅ Offer tab replaced successfully!" -ForegroundColor Green
Write-Host "Removed $($endPos - $startPos) characters"
Write-Host "Added $($newOfferTab.Length) characters"
