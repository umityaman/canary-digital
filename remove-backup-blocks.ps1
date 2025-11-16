# Remove backup code blocks from Accounting.tsx
$filePath = "frontend\src\pages\Accounting.tsx"
$content = Get-Content $filePath -Raw

Write-Host "Original file size: $($content.Length) chars"

# Block 1: Tools Tab OLD - Lines 1224-1332
# Block 2: Advisor Tab OLD - Lines 1341-1438  
# Block 3: Support Tab OLD - Lines 1446-1538
# Block 4: Notifications Tab OLD - Lines 1568-1706

# Remove backup blocks using regex (match from comment to closing brace before next section)
$content = $content -replace '(?s)\s*{/\* Tools Tab OLD - BACKUP \*/}\s*{false && activeTab === .tools. && \([^}]*}\s*\)}\s*(?={/\* Advisor Tab \*/})', ''
$content = $content -replace '(?s)\s*{/\* Advisor Tab OLD - BACKUP \*/}\s*{false && activeTab === .advisor. && \([^}]*}\s*\)}\s*(?={/\* Support Tab \*/})', ''
$content = $content -replace '(?s)\s*{/\* Support Tab OLD - BACKUP \*/}\s*{false && activeTab === .support. && \([^}]*}\s*\)}\s*(?={/\* Reminders Tab \*/})', ''
$content = $content -replace '(?s)\s*{/\* Notifications Tab OLD - BACKUP \*/}\s*{false && activeTab === .notifications. && \([^}]*}\s*\)}\s*(?={/\* Reminders Tab OLD|</Suspense>})', ''

Write-Host "Modified file size: $($content.Length) chars"
Write-Host "Removed: $(($content.Length - (Get-Content $filePath -Raw).Length) * -1) chars"

# Save back
Set-Content $filePath $content -NoNewline
Write-Host "✓ Backup blocks removed successfully!"
