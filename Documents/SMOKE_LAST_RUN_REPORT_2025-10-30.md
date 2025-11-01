Smoke artifact verification - 2025-10-30

Summary
-------
This short report records the local verification of the most recent smoke artifacts produced by the CI post-deploy smoke job. The team decision was to keep the smoke job non-blocking (do not fail the deploy on smoke failures).

Location of inspected artifacts (local copy):
- smoke tests/Yeni klasör (5)

Files inspected
---------------
- invoices.json
- invoice-1.pdf, invoice-2.pdf, invoice-3.pdf
- pdf-hashes.txt
- pdf-results.json
- smoke-extended-log.txt
- health-result-_api_health.json
- login-response.json (sanitized — token removed)

What I checked
---------------
- Verified each invoice-*.pdf SHA256 against entries in `pdf-hashes.txt` (all MATCH).
- Read `pdf-results.json` to confirm each invoice entry has `success: true` and contained sha256 that matches `pdf-hashes.txt`.
- Confirmed `health-result-_api_health.json` reported `{ "ok": true }`.
- Confirmed `smoke-extended-log.txt` shows downloads and final write of `pdf-results.json`.

Local verification commands used (PowerShell)
--------------------------------------------
# Run from the artifact directory
Set-Location 'C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\smoke tests\Yeni klasör (5)'

# Compare SHA256 values
foreach ($line in Get-Content pdf-hashes.txt) {
  if ($line.Trim() -eq '') { continue }
  $parts = $line -split '\s+'
  $expected = $parts[0].ToUpper()
  $file = $parts[1]
  if (-not (Test-Path $file)) { Write-Output "$file - MISSING"; continue }
  $calc = (Get-FileHash $file -Algorithm SHA256).Hash.ToUpper()
  if ($calc -eq $expected) { Write-Output "$file - MATCH" } else { Write-Output "$file - MISMATCH (expected $expected, got $calc)" }
}

# Quick pdf-results.json summary
Get-Content pdf-results.json | ConvertFrom-Json | % { "$($_.id) - success: $($_.success) - file: $($_.savedFile) - sha256: $($_.sha256)" }

Findings
--------
- All downloaded PDFs matched their expected SHA256 hashes.
- `pdf-results.json` reports success for all invoices present.
- Health endpoint OK.
- No sensitive token artifacts found in the inspected artifact set (login-response.json sanitized). If there are older runs to audit, consider checking past artifacts.

Decision & next steps
---------------------
- Decision: Keep CI `post-deploy-smoke` job non-blocking for now (deploys will not be blocked by smoke failures).

Recommended next steps (optional)
---------------------------------
1. Add alerting (Slack/Teams/email) when smoke verification fails so the team is notified even though the deploy is non-blocking.
2. Consider scheduled (cron) smoke runs to detect regressions between deploys.
3. If smoke becomes reliable, flip to blocking or implement a threshold-based blocker.
4. Audit previous CI artifacts for leaked tokens if you are concerned about past uploads.

File created by: automation assistant
Date: 2025-10-30
