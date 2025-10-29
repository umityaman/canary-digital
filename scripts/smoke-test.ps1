$ErrorActionPreference = 'Stop'
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location -Path '..'  # repo root

Write-Output "==> Starting smoke tests (login -> invoice PDF)"

try {
    Write-Output "==> Attempting login..."
    $body = @{ email = 'admin@canary.com'; password = 'admin123' } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri 'https://canary-backend-672344972017.europe-west1.run.app/api/auth/login' -Method Post -ContentType 'application/json' -Body $body -ErrorAction Stop
    $login | ConvertTo-Json -Depth 6 | Out-File -FilePath login-response.json -Encoding utf8
    Write-Output "Login response saved to login-response.json"

    # try to extract token
    $token = $null
    if ($null -ne $login.token) { $token = $login.token }
    elseif ($null -ne $login.accessToken) { $token = $login.accessToken }
    elseif ($null -ne $login.data -and $null -ne $login.data.accessToken) { $token = $login.data.accessToken }
    elseif ($null -ne $login.data -and $null -ne $login.data.token) { $token = $login.data.token }

    if ($token) {
        $token | Out-File -FilePath login-token.txt -Encoding utf8
        Write-Output "Token saved to login-token.txt"
    } else {
        Write-Output "No token field detected in login response"
    }

    Write-Output "==> Attempting to download invoice PDF (id=1)"
    $pdfUrl = 'https://canary-backend-672344972017.europe-west1.run.app/api/pdf/invoice/1'
    if ($token) {
        Invoke-WebRequest -Uri $pdfUrl -Method Get -Headers @{ Authorization = "Bearer $token" } -OutFile invoice-1.pdf -UseBasicParsing -ErrorAction Stop
    } else {
        Invoke-WebRequest -Uri $pdfUrl -Method Get -OutFile invoice-1.pdf -UseBasicParsing -ErrorAction Stop
    }
    Write-Output "Invoice PDF saved to invoice-1.pdf"
    exit 0
}
catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    try {
        if ($_.InvocationInfo -and $_.Exception.Response) {
            $resp = $_.Exception.Response.GetResponseStream()
            $sr = New-Object System.IO.StreamReader($resp)
            $body = $sr.ReadToEnd()
            Write-Output "Response body:\n$body"
            $body | Out-File -FilePath smoke-error-response-body.txt -Encoding utf8
        }
    } catch {
        # ignore
    }
    $_ | Out-File -FilePath smoke-error.txt -Encoding utf8
    exit 1
}