# Read all lines
$filePath = "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\pages\Accounting.tsx"
$lines = Get-Content $filePath

# Keep lines 1-1112 (before offer tab)
$beforeLines = $lines[0..1111]

# New offer tab content (as separate lines)
$newOfferLines = @(
    "",
    "            {/* Offer Tab */}",
    "            {activeTab === 'offer' && (",
    "              <ErrorBoundary fallbackTitle=`"Teklif Listesi Hatası`" fallbackMessage=`"Teklif listesi yüklenirken bir sorun oluştu.`">",
    "                <Suspense fallback={<div className=`"p-8 text-center`">Yükleniyor...</div>}>",
    "                  <OfferList />",
    "                </Suspense>",
    "              </ErrorBoundary>",
    "            )}"
)

# Keep lines after 1529 (line index 1528)
$afterLines = $lines[1528..($lines.Length-1)]

# Combine all
$newContent = $beforeLines + $newOfferLines + $afterLines

# Write back
$newContent | Set-Content $filePath

Write-Host "✅ Offer tab replaced successfully!" -ForegroundColor Green
Write-Host "Deleted lines 1113-1529 (417 lines)"
Write-Host "Added 9 new lines"
