# compile-monitor-report.ps1
# Reads backend-error-logs-*.json files, aggregates unique errors and frequencies and writes monitor-report.txt
$cwd = Get-Location
$files = Get-ChildItem -Path $cwd -Filter 'backend-error-logs-*.json' | Sort-Object Name
if (-not $files) {
  Write-Host "No backend-error-logs-*.json files found in $cwd"
  exit 0
}
Write-Host "Found $($files.Count) files. Processing..."
$all = @()
foreach ($f in $files) {
  try {
    $text = Get-Content -Path $f.FullName -Raw
    if ($null -eq $text -or $text.Trim() -eq '') { continue }
    $arr = ConvertFrom-Json $text
    if ($arr -is [System.Collections.IEnumerable]) {
      foreach ($e in $arr) { $all += $e }
    } else {
      $all += $arr
    }
  } catch {
    Write-Host "Warning: failed to parse $($f.Name): $($_.Exception.Message)" -ForegroundColor Yellow
  }
}
$total = $all.Count
$counts = @{}
foreach ($e in $all) {
  $k = $null
  if ($e.httpRequest -ne $null) {
    $method = $e.httpRequest.requestMethod
    $url = $e.httpRequest.requestUrl
    $status = $e.httpRequest.status
    $k = "REQUEST: $method $url => $status"
  } elseif ($e.textPayload -ne $null) {
    $k = $e.textPayload.Trim()
  } else {
    $k = ($e | ConvertTo-Json -Compress)
  }
  if ($k -eq '') { $k = '<empty>' }
  if ($counts.ContainsKey($k)) { $counts[$k]++ } else { $counts[$k] = 1 }
}
$reportPath = Join-Path -Path $cwd -ChildPath 'monitor-report.txt'
$sb = New-Object System.Text.StringBuilder
$sb.AppendLine("Monitor report generated: $(Get-Date -Format s)Z") | Out-Null
$sb.AppendLine("Files processed: $($files.Count)") | Out-Null
$sb.AppendLine("Total log entries: $total") | Out-Null
$sb.AppendLine('') | Out-Null
$sb.AppendLine('Top error groups:') | Out-Null
$sorted = $counts.GetEnumerator() | Sort-Object -Property Value -Descending
$rank = 0
foreach ($entry in $sorted) {
  $rank++
  $sb.AppendLine("$rank) [$($entry.Value)] $($entry.Key)") | Out-Null
  if ($rank -ge 50) { break }
}
# Save report
$sb.ToString() | Out-File -FilePath $reportPath -Encoding utf8
Write-Host "Report written to $reportPath"
# Also print summary to stdout
Get-Content $reportPath | Select-Object -First 200 | ForEach-Object { Write-Host $_ }
