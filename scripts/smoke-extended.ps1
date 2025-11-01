$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'  # repo root

$baseUrl = 'https://canary-backend-672344972017.europe-west1.run.app'
Write-Output "==> Extended smoke tests (list -> create if needed -> pdf -> health)"

try {
    if (-Not (Test-Path .\login-token.txt)) {
        throw "login-token.txt not found. Run the login step first or run scripts/smoke-test.ps1"
    }
    $token = Get-Content .\login-token.txt -Raw
    $headers = @{ Authorization = "Bearer $token" }

    Write-Output "==> Listing invoices..."
    $invoices = $null
    try {
        $invoices = Invoke-RestMethod -Uri "$baseUrl/api/invoices" -Headers $headers -Method Get -ErrorAction Stop
        $invoices | ConvertTo-Json -Depth 6 | Out-File -FilePath invoices.json -Encoding utf8
        Write-Output "Saved invoices.json"
    } catch {
        Write-Output "List invoices failed: $($_.Exception.Message)"
        # try alternate path
        try {
            $invoices = Invoke-RestMethod -Uri "$baseUrl/api/invoice" -Headers $headers -Method Get -ErrorAction Stop
            $invoices | ConvertTo-Json -Depth 6 | Out-File -FilePath invoices.json -Encoding utf8
            Write-Output "Saved invoices.json (fallback /api/invoice)"
        } catch {
            Write-Output "Both invoice list attempts failed: $($_.Exception.Message)"
        }
    }

    $selectedId = $null
    if ($invoices -and $invoices.Count -gt 0) {
        # pick first invoice id (try common shapes)
        if ($invoices[0].id) { $selectedId = $invoices[0].id }
        elseif ($invoices[0].invoiceId) { $selectedId = $invoices[0].invoiceId }
        elseif ($invoices[0].ID) { $selectedId = $invoices[0].ID }
        Write-Output "Found existing invoice id: $selectedId"
    }

    if (-Not $selectedId) {
        Write-Output "No invoice found — creating a test invoice..."
        $body = @{
            customerId = 1
            date = (Get-Date).ToString('yyyy-MM-dd')
            items = @(@{ description = 'Smoke test item'; quantity = 1; price = 1.0 })
        } | ConvertTo-Json -Depth 6

        $createResp = Invoke-RestMethod -Uri "$baseUrl/api/invoices" -Method Post -ContentType 'application/json' -Body $body -Headers $headers -ErrorAction Stop
        $createResp | ConvertTo-Json -Depth 6 | Out-File -FilePath invoice-create.json -Encoding utf8
        Write-Output "Created invoice, response saved to invoice-create.json"
        # try to extract id
        if ($createResp.id) { $selectedId = $createResp.id }
        elseif ($createResp.invoiceId) { $selectedId = $createResp.invoiceId }
        elseif ($createResp.data -and $createResp.data.id) { $selectedId = $createResp.data.id }
        Write-Output "Created invoice id: $selectedId"
    }

    if (-Not $selectedId) { throw "Could not determine an invoice id to request PDF for." }

    Write-Output "==> Attempting to download invoice PDF (id=$selectedId)"
    $pdfUrl = "$baseUrl/api/pdf/invoice/$selectedId"
    try {
        Invoke-WebRequest -Uri $pdfUrl -Method Get -Headers $headers -OutFile "invoice-$selectedId.pdf" -UseBasicParsing -ErrorAction Stop
        Write-Output "Invoice PDF saved to invoice-$selectedId.pdf"
    } catch {
        Write-Output "Failed to download PDF: $($_.Exception.Message)"
        try {
            $resp = $_.Exception.Response.GetResponseStream()
            $sr = New-Object System.IO.StreamReader($resp)
            $body = $sr.ReadToEnd()
            $body | Out-File -FilePath smoke-extended-pdf-error-body.txt -Encoding utf8
            Write-Output "Response body saved to smoke-extended-pdf-error-body.txt"
        } catch { }
    }

    Write-Output "==> Running health checks"
    # try common health endpoints
    $healthPaths = @('/api/health', '/health', '/api/ping', '/')
    foreach ($p in $healthPaths) {
        try {
            $u = "$baseUrl$p"
            $r = Invoke-RestMethod -Uri $u -Method Get -ErrorAction Stop
            $r | ConvertTo-Json -Depth 6 | Out-File -FilePath ("health-result-" + ($p -replace '/','_') + ".json") -Encoding utf8
            Write-Output "Health path $p returned OK; saved health-result-$($p -replace '/','_').json"
            break
        } catch {
            Write-Output "Health path $p failed: $($_.Exception.Message)"
        }
    }

    Write-Output "==> Extended smoke finished"
    exit 0
}
catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    $_ | Out-File -FilePath smoke-extended-error.txt -Encoding utf8
    exit 1
}
