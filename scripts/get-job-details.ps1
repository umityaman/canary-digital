param(
    [Parameter(Mandatory=$true)]
    [string]$JobId
)
$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'

$url = "https://api.github.com/repos/umityaman/canary-digital/actions/jobs/$JobId"
Write-Output "Fetching job details for $JobId..."
$job = Invoke-RestMethod -Uri $url
$job | ConvertTo-Json -Depth 6 | Out-File -FilePath ("gh-job-$JobId.json") -Encoding utf8
Write-Output ("Saved job details to gh-job-$JobId.json")
if ($job.steps) {
    foreach ($s in $job.steps) {
        Write-Output ("Step: $($s.number) - $($s.name) - conclusion=$($s.conclusion)")
    }
} else {
    Write-Output 'No steps list available in job object.'
}
