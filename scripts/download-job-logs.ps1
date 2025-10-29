param(
    [Parameter(Mandatory=$true)]
    [string]$JobId
)
$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'

$url = "https://api.github.com/repos/umityaman/canary-digital/actions/jobs/$JobId/logs"
$zipPath = "gh-job-$JobId-logs.zip"
Write-Output "Downloading job logs from $url ..."
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing -ErrorAction Stop
Write-Output "Downloaded to $zipPath"
$extractDir = "gh-job-$JobId-logs"
if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }
Expand-Archive -Path $zipPath -DestinationPath $extractDir
Write-Output "Extracted logs to $extractDir"
Get-ChildItem -Path $extractDir -Recurse | Select-Object FullName | Out-File ("gh-job-$JobId-logfiles.txt") -Encoding utf8
Write-Output ("Saved file list to gh-job-$JobId-logfiles.txt")
