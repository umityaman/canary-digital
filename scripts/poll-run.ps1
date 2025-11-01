$uri='https://api.github.com/repos/umityaman/canary-digital/actions/runs/18916335989'
for($i=0;$i -lt 30;$i++){
  $j=Invoke-RestMethod -Uri $uri -Headers @{ 'User-Agent'='CI-monitor' } -ErrorAction SilentlyContinue
  $s = $j.status
  Write-Host "[$i] status=$s updated_at=$($j.updated_at)"
  if($s -ne 'in_progress'){ Write-Host 'Finished:'; $j | ConvertTo-Json -Depth 5; exit 0 }
  Start-Sleep -Seconds 10
}
Write-Host 'Timed out waiting for run to finish'
exit 2
