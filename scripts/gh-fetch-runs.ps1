$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'  # repo root

$url = 'https://api.github.com/repos/umityaman/canary-digital/actions/runs?per_page=20'
Write-Output 'Fetching workflow runs...'
$runs = Invoke-RestMethod -Uri $url
$matches = $runs.workflow_runs | Where-Object { $_.name -eq 'Full Deployment (Backend + Frontend)' } | Sort-Object created_at -Descending
if (-not $matches) {
    Write-Output 'No matching workflow runs found.'
    exit 0
}
$latest = $matches[0]
$latest | Select-Object id,name,status,conclusion,html_url,created_at | ConvertTo-Json -Depth 4 | Out-File -FilePath gh-run-latest.json -Encoding utf8
Write-Output 'Saved latest run to gh-run-latest.json'
Write-Output ("Run ID: {0} - status:{1} - conclusion:{2}" -f $latest.id, $latest.status, $latest.conclusion)

Write-Output 'Fetching jobs for the run...'
$jobsUrl = "https://api.github.com/repos/umityaman/canary-digital/actions/runs/$($latest.id)/jobs"
$jobs = Invoke-RestMethod -Uri $jobsUrl
$jobs.jobs | Select-Object id,name,conclusion,status,html_url | ConvertTo-Json -Depth 4 | Out-File -FilePath gh-run-jobs.json -Encoding utf8
Write-Output 'Saved jobs to gh-run-jobs.json'
foreach ($j in $jobs.jobs) { Write-Output ("Job: {0} (id={1}) - status={2} conclusion={3}" -f $j.name, $j.id, $j.status, $j.conclusion) }
