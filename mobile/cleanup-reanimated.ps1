# Remove react-native-reanimated imports from mobile app files
Write-Host "🧹 React Native Reanimated Temizleniyor..." -ForegroundColor Cyan
Write-Host ""

$files = @(
    "src/screens/equipment/EquipmentListScreen.tsx",
    "src/screens/equipment/EquipmentDetailScreen.tsx",
    "src/components/ui/Badge.tsx",
    "src/components/ui/Avatar.tsx",
    "src/components/ui/Card.tsx",
    "src/components/ui/Input.tsx",
    "src/components/ui/Chip.tsx"
)

$basePath = "C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile\"

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Write-Host "  📝 Duzenlen: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        
        # Remove reanimated import
        $content = $content -replace "import Animated.*from 'react-native-reanimated';\r?\n", ""
        
        # Replace Animated.View with View
        $content = $content -replace "Animated\.View entering=\{[^\}]+\}", "View"
        $content = $content -replace "Animated\.View", "View"
        $content = $content -replace "</Animated\.View>", "</View>"
        
        # Replace Animated.Text with Text
        $content = $content -replace "Animated\.Text", "Text"
        $content = $content -replace "</Animated\.Text>", "</Text>"
        
        $content | Set-Content $fullPath
        Write-Host "  ✅ Tamamlandi: $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Bulunamadi: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Tum dosyalar temizlendi!" -ForegroundColor Green
Write-Host "Simdi Metro Bundler'i yeniden baslatin:" -ForegroundColor Yellow
Write-Host "  npx expo start --clear" -ForegroundColor White
