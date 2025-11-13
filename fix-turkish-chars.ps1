$files = @(
  "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\components\accounting\InvoiceList.tsx",
  "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\components\accounting\AccountCardDetail.tsx",
  "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\components\accounting\IncomeTab.tsx",
  "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\components\accounting\ExpenseTab.tsx",
  "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\frontend\src\components\accounting\DeliveryNoteList.tsx"
)

$replacements = @{
  'yÃklenirken' = 'yüklenirken'
  'yÃklenemedi' = 'yüklenemedi'
  'YÃkleniyor' = 'Yükleniyor'
  'Ãdendi' = 'Ödendi'
  'Ãdenen' = 'Ödenen'
  'ÃdenmemiÅŸ' = 'Ödenmemiş'
  'TÃm' = 'Tüm'
  'MÃÅŸteri' = 'Müşteri'
  'GÃrÃntÃle' = 'Görüntüle'
  'GÃnder' = 'Gönder'
  'gÃnderme' = 'gönderme'
  'ÃzelliÄŸi' = 'özelliği'
  'yakÄnda' = 'yakında'
  'GÃn' = 'Gün'
  'DÃn' = 'Dön'
  'BorÃ' = 'Borç'
  'borÃ' = 'borç'
  'GeÃ' = 'Geç'
  'geÃ' = 'geç'
  'AdÄ' = 'Adı'
  'AÃÄklama' = 'Açıklama'
  'YaÅŸlandÄrma' = 'Yaşlandırma'
  'daÄŸÄlÄmÄ' = 'dağılımı'
  'bulunamadÄ' = 'bulunamadı'
}

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    foreach ($key in $replacements.Keys) {
      $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($file, $content, $Utf8NoBom)
    Write-Host "Fixed: $([System.IO.Path]::GetFileName($file))"
  }
}
Write-Host "All files processed!"
