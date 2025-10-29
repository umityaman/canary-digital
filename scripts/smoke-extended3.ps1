# Extended smoke test: list invoices -> create if none -> download invoice PDF -> health checks
# Requires scripts/smoke-test.ps1 to have created login-token.txt

$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'  # repo root

$baseUrl = 'https://canary-backend-672344972017.europe-west1.run.app'
Write-Output "==> Extended smoke tests (list -> create if needed -> pdf -> health)"

try {
    if (-Not (Test-Path .\login-token.txt)) {
        throw "login-token.txt not found. Run the login step first or run scripts/smoke-test.ps1"
    }

    $token = (Get-Content .\login-token.txt -Raw).Trim()
    $headers = @{ Authorization = "Bearer $token" }

    Write-Output "==> Listing invoices..."
    $invoicesResp = $null
    $invoicesList = @()
    try {
        $invoicesResp = Invoke-RestMethod -Uri "$baseUrl/api/invoices" -Headers $headers -Method Get -ErrorAction Stop
        if ($invoicesResp -is [System.Collections.IDictionary] -and $invoicesResp.ContainsKey('data')) { $invoicesList = $invoicesResp.data } else { $invoicesList = $invoicesResp }
        $invoicesList | ConvertTo-Json -Depth 6 | Out-File -FilePath invoices.json -Encoding utf8
        Write-Output "Saved invoices.json"
    } catch {
        Write-Output "List invoices failed: $($_.Exception.Message)"
        try {
            $invoicesResp = Invoke-RestMethod -Uri "$baseUrl/api/invoice" -Headers $headers -Method Get -ErrorAction Stop
            if ($invoicesResp -is [System.Collections.IDictionary] -and $invoicesResp.ContainsKey('data')) { $invoicesList = $invoicesResp.data } else { $invoicesList = $invoicesResp }
            $invoicesList | ConvertTo-Json -Depth 6 | Out-File -FilePath invoices.json -Encoding utf8
            Write-Output "Saved invoices.json (fallback /api/invoice)"
        } catch {
            Write-Output "Both invoice list attempts failed: $($_.Exception.Message)"
        }
    }

    # If invoices.json exists on disk, prefer it (more deterministic) to derive id
    if (Test-Path .\invoices.json) {
        try {
            $raw = Get-Content .\invoices.json -Raw
            $local = $raw | ConvertFrom-Json
            if ($local -and $local.data -and $local.data.Count -gt 0) {
                $invoicesList = $local.data
                Write-Output "Loaded invoices.json from disk with $($invoicesList.Count) entries"
            }
        } catch {
            Write-Output "Failed to parse local invoices.json: $($_.Exception.Message)"
        }
    }

    # choose invoice id if available
    $selectedId = $null
    if ($invoicesList -and $invoicesList.Count -gt 0) {
        $first = $invoicesList[0]
        if ($first.id) { $selectedId = $first.id }
        elseif ($first.invoiceId) { $selectedId = $first.invoiceId }
        elseif ($first.ID) { $selectedId = $first.ID }
        Write-Output "Found existing invoice id: $selectedId"
    }

    # if no invoice, try to create using several possible endpoints (best-effort)
    if (-Not $selectedId) {
        Write-Output "No invoice found - attempting to create a test invoice (best-effort)"
        $body = @{
            customerId = 1
            date = (Get-Date).ToString('yyyy-MM-dd')
            items = @(@{ description = 'Smoke test item'; quantity = 1; price = 1.0 })
        } | ConvertTo-Json -Depth 6

        $createEndpoints = @('/api/invoices','/api/invoice','/api/invoices/create')
        foreach ($ep in $createEndpoints) {
            try {
                Write-Output "Trying create endpoint: $ep"
                $createResp = Invoke-RestMethod -Uri ($baseUrl + $ep) -Method Post -ContentType 'application/json' -Body $body -Headers $headers -ErrorAction Stop
                $createResp | ConvertTo-Json -Depth 6 | Out-File -FilePath invoice-create.json -Encoding utf8
                Write-Output "Create response saved to invoice-create.json"
                if ($createResp.id) { $selectedId = $createResp.id }
                elseif ($createResp.invoiceId) { $selectedId = $createResp.invoiceId }
                elseif ($createResp.data -and $createResp.data.id) { $selectedId = $createResp.data.id }
                if ($selectedId) { Write-Output "Created invoice id: $selectedId"; break }
            } catch {
                Write-Output "Create attempt $ep failed: $($_.Exception.Message)"
            }
        }
    }

    if (-Not $selectedId) { throw "Could not determine an invoice id to request PDF for." }

    Write-Output "==> Attempting to download invoice PDF (id=$selectedId) using POST"
    $pdfUrl = "$baseUrl/api/pdf/invoice/$selectedId"
    try {
        Invoke-WebRequest -Uri $pdfUrl -Method Post -Headers $headers -OutFile "invoice-$selectedId.pdf" -UseBasicParsing -ErrorAction Stop
        Write-Output "Invoice PDF saved to invoice-$selectedId.pdf"
    } catch {
        Write-Output "Failed to download PDF: $($_.Exception.Message)"
        try {
            if ($_.Exception.Response) {
                $resp = $_.Exception.Response.GetResponseStream()
                $sr = New-Object System.IO.StreamReader($resp)
                $body = $sr.ReadToEnd()
                $body | Out-File -FilePath smoke-extended-pdf-error-body.txt -Encoding utf8
                Write-Output "Response body saved to smoke-extended-pdf-error-body.txt"
            }
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
