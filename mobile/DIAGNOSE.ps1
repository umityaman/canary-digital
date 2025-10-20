# Canary Mobile App Diagnostics Script
Write-Host "🔍 Canary Mobile App - Sistem Tanılama" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 1. Dizin kontrolü
Write-Host "1️⃣  Dizin Kontrolü" -ForegroundColor Yellow
Write-Host "   Mevcut dizin: $PWD" -ForegroundColor White
$mobileDir = "c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile"
if (Test-Path $mobileDir) {
    Write-Host "   ✅ Mobile dizini mevcut" -ForegroundColor Green
    Set-Location $mobileDir
} else {
    Write-Host "   ❌ Mobile dizini bulunamadı" -ForegroundColor Red
}
Write-Host ""

# 2. Dosya kontrolü
Write-Host "2️⃣  Dosya Kontrolü" -ForegroundColor Yellow
$requiredFiles = @("package.json", "app.json", ".env", "babel.config.js")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file eksik" -ForegroundColor Red
    }
}
Write-Host ""

# 3. Node.js kontrolü
Write-Host "3️⃣  Node.js Kontrolü" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js bulunamadı" -ForegroundColor Red
}
Write-Host ""

# 4. NPM kontrolü
Write-Host "4️⃣  NPM Kontrolü" -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ NPM bulunamadı" -ForegroundColor Red
}
Write-Host ""

# 5. Port kontrolü
Write-Host "5️⃣  Port Kontrolü" -ForegroundColor Yellow
$ports = @(4000, 8081, 19000, 19001, 19002)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
        Write-Host "   ⚠️  Port $port kullanımda" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Port $port boş" -ForegroundColor Green
    }
}
Write-Host ""

# 6. Node process'leri
Write-Host "6️⃣  Çalışan Node Process'leri" -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ⚠️  $($nodeProcesses.Count) adet node process çalışıyor:" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "      PID: $($_.Id) - StartTime: $($_.StartTime)" -ForegroundColor White
    }
} else {
    Write-Host "   ✅ Çalışan node process yok" -ForegroundColor Green
}
Write-Host ""

# 7. network_modules kontrolü
Write-Host "7️⃣  Dependencies Kontrolü" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $nodeModulesCount = (Get-ChildItem "node_modules" -Directory | Measure-Object).Count
    Write-Host "   ✅ node_modules mevcut ($nodeModulesCount paket)" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules bulunamadı - npm install gerekli" -ForegroundColor Red
}
Write-Host ""

# 8. .env dosyası içeriği
Write-Host "8️⃣  Environment Variables" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   .env dosyası içeriği:" -ForegroundColor White
    Get-Content ".env" | ForEach-Object {
        Write-Host "      $_" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ .env dosyası bulunamadı" -ForegroundColor Red
}
Write-Host ""

# 9. package.json SDK version
Write-Host "9️⃣  Expo SDK Version" -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $expoVersion = $packageJson.dependencies.expo
    Write-Host "   Expo SDK: $expoVersion" -ForegroundColor White
}
Write-Host ""

# 10. Backend kontrolü
Write-Host "🔟 Backend Server Kontrolü" -ForegroundColor Yellow
$backendUrl = "http://192.168.1.39:4000"
try {
    $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Backend server çalışıyor ($backendUrl)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend server yanıt vermiyor" -ForegroundColor Red
    Write-Host "      URL: $backendUrl" -ForegroundColor Gray
}
Write-Host ""

# 11. IP Adresi
Write-Host "1️⃣1️⃣  Network IP Adresi" -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -match "^192\.168\."} | Select-Object -First 1).IPAddress
if ($ipAddress) {
    Write-Host "   LAN IP: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  LAN IP bulunamadı" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Tanılama tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "Sorunlar varsa sunlari deneyin:" -ForegroundColor Yellow
Write-Host "  1. Portlari temizle: Get-Process node | Stop-Process -Force" -ForegroundColor White
Write-Host "  2. Dependencies kur: npm install --legacy-peer-deps" -ForegroundColor White
Write-Host "  3. Cache temizle: npx expo start --clear" -ForegroundColor White
Write-Host ""
