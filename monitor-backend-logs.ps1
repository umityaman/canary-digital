for ($i = 0; $i -lt 30; $i++) {
  $outfile = Join-Path -Path (Get-Location) -ChildPath "backend-error-logs-$i.json"
  Write-Host "[monitor] polling (#$i) -> $outfile"
  gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="canary-backend" AND severity>=ERROR' --project=canary-digital-475319 --limit=50 --format='json' --order=desc --freshness=5m | Out-File -FilePath $outfile -Encoding utf8
  Start-Sleep -Seconds 60
}
Write-Host "[monitor] finished 30 iterations"