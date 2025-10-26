# Cloud SQL'de Income tablosunu oluştur
# Bu scripti çalıştırmadan önce gcloud auth login yapın

$SQL_FILE = "create-income-table.sql"
$INSTANCE_NAME = "canary-postgres"
$DATABASE_NAME = "canary_db"

Write-Host "=== INCOME TABLE CREATION ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "SQL File: $SQL_FILE" -ForegroundColor Yellow
Write-Host "Instance: $INSTANCE_NAME" -ForegroundColor Yellow
Write-Host "Database: $DATABASE_NAME" -ForegroundColor Yellow
Write-Host ""

# SQL dosyasını Cloud SQL'de çalıştır
Write-Host "Running SQL script..." -ForegroundColor Green
gcloud sql connect $INSTANCE_NAME --user=postgres --database=$DATABASE_NAME < $SQL_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Income table created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Deploy backend to production" -ForegroundColor White
    Write-Host "2. Test endpoints: POST/GET /api/accounting/income" -ForegroundColor White
    Write-Host "3. Build frontend UI for Income/Expense management" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to create Income table" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
}
