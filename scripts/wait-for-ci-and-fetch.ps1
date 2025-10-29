$WorkflowName = if ($args.Count -ge 1 -and $args[0]) { $args[0] } else { 'Full Deployment (Backend + Frontend)' }
$PollIntervalSeconds = if ($args.Count -ge 2 -and $args[1]) { [int]$args[1] } else { 15 }
$TimeoutMinutes = if ($args.Count -ge 3 -and $args[2]) { [int]$args[2] } else { 15 }

$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'

Write-Output "Waiting for workflow '$WorkflowName' to complete (timeout ${TimeoutMinutes}m)..."
$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
$latest = $null

while ((Get-Date) -lt $deadline) {
    try {
        $url = "https://api.github.com/repos/umityaman/canary-digital/actions/runs?per_page=20"
        $runs = Invoke-RestMethod -Uri $url -ErrorAction Stop
        $matches = $runs.workflow_runs | Where-Object { $_.name -eq $WorkflowName } | Sort-Object created_at -Descending
        if (-not $matches) {
            Write-Output "No runs found for workflow yet. Sleeping $PollIntervalSeconds s..."
            Start-Sleep -Seconds $PollIntervalSeconds
            continue
        }
        $latest = $matches[0]
        Write-Output "Found run id=$($latest.id) created_at=$($latest.created_at) status=$($latest.status) conclusion=$($latest.conclusion)"
        if ($latest.status -eq 'completed') { break }
        Write-Output "Run not completed yet (status=$($latest.status)). Sleeping $PollIntervalSeconds s..."
    } catch {
        Write-Output "API fetch error: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds $PollIntervalSeconds
}

if (-not $latest) { Write-Output "No workflow run found before timeout."; exit 2 }

# Save run info
$latest | Select-Object id,name,status,conclusion,html_url,created_at | ConvertTo-Json -Depth 6 | Out-File -FilePath gh-run-latest.json -Encoding utf8
Write-Output "Saved latest run to gh-run-latest.json"

# Fetch jobs
$jobsUrl = "https://api.github.com/repos/umityaman/canary-digital/actions/runs/$($latest.id)/jobs"
try {
    $jobs = Invoke-RestMethod -Uri $jobsUrl -ErrorAction Stop
    $jobs.jobs | Select-Object id,name,conclusion,status,html_url | ConvertTo-Json -Depth 6 | Out-File -FilePath gh-run-jobs.json -Encoding utf8
    Write-Output "Saved jobs to gh-run-jobs.json"
    foreach ($j in $jobs.jobs) { Write-Output ("Job: {0} (id={1}) - status={2} conclusion={3}" -f $j.name, $j.id, $j.status, $j.conclusion) }
} catch {
    Write-Output "Failed to fetch jobs: $($_.Exception.Message)"
}

# Try to download logs for failing jobs
$failedJobs = @()
if ($jobs -and $jobs.jobs) { $failedJobs = $jobs.jobs | Where-Object { $_.conclusion -eq 'failure' } }
if (-not $failedJobs -or $failedJobs.Count -eq 0) { Write-Output "No failing jobs to download logs for."; exit 0 }

foreach ($fj in $failedJobs) {
    $jobId = $fj.id
    Write-Output "Attempting to download logs for failing job id=$jobId name=$($fj.name)"
    try {
        & "scripts/download-job-logs.ps1" -JobId $jobId
        Write-Output "Downloaded and extracted logs for job $jobId (check gh-job-$jobId-logs folder)"
    } catch {
        Write-Output ("Could not download logs for job {0}: {1}" -f $jobId, $_.Exception.Message)
        Write-Output "Likely reason: GitHub API requires admin repo permission to download job logs (403)."
    }
}
