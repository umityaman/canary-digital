# Simple Orders.tsx fixer
$content = Get-Content "src\pages\Reservations.tsx" -Raw

# 1. Remove Layout import
$content = $content -replace "import Layout from '../components/Layout';", ""

# 2. Add useNavigate and X
$content = $content -replace "import React, \{ useState, useEffect \} from 'react';", "import React, { useState, useEffect } from 'react';`nimport { useNavigate } from 'react-router-dom';"

$content = $content -replace "Mail, Phone, Tag, StickyNote\n\} from 'lucide-react';", "Mail, Phone, Tag, StickyNote, X`n} from 'lucide-react';"

# 3. Change component name and add navigate
$content = $content -replace "const Reservations: React.FC = \(\) => \{", "const Orders: React.FC = () => {`n  const navigate = useNavigate();"

# 4. Remove showForm state
$content = $content -replace "\s+const \[showForm, setShowForm\] = useState\(false\);", ""

# 5. Add custom date states
$content = $content -replace "const \[showDatePicker, setShowDatePicker\] = useState\(false\);", "const [showDatePicker, setShowDatePicker] = useState(false);`n  const [customDateFrom, setCustomDateFrom] = useState('');`n  const [customDateTo, setCustomDateTo] = useState('');"

# 6. Remove Layout wrapper opening
$content = $content -replace "return \(\s+<Layout>\s+<div className=`"h-screen", "return (`n    <div className=`"h-screen"

# 7. Change buttons to green and navigate
$content = $content -replace "setShowForm\(true\)", "navigate('/orders/new')"
$content = $content -replace "bg-blue-600 text-white rounded-lg hover:bg-blue-700", "bg-green-600 text-white rounded-lg hover:bg-green-700"

# 8. Remove Layout closing and fix export
$content = $content -replace "</Layout>\s+\);\s+\};\s+export default Reservations;", ");\n};\n\nexport default Orders;"

# Save
$content | Set-Content "src\pages\Orders.tsx" -NoNewline

Write-Host "✅ Orders.tsx updated!" -ForegroundColor Green
