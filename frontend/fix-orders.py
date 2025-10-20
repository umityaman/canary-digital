#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Read the Reservations.tsx file
with open('src/pages/Reservations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Layout import
content = content.replace(
    "import Layout from '../components/Layout';",
    ""
)

# 2. Add X icon to imports
content = content.replace(
    "  Mail, Phone, Tag, StickyNote\n} from 'lucide-react';",
    "  Mail, Phone, Tag, StickyNote, X\n} from 'lucide-react';"
)

# 3. Change component name
content = content.replace(
    "const Reservations: React.FC = () => {",
    "const Orders: React.FC = () => {"
)

# 4. Add custom date states
content = content.replace(
    "  const [showDatePicker, setShowDatePicker] = useState(false);",
    "  const [showDatePicker, setShowDatePicker] = useState(false);\n  const [customDateFrom, setCustomDateFrom] = useState('');\n  const [customDateTo, setCustomDateTo] = useState('');"
)

# 5. Remove Layout wrapper opening
content = content.replace(
    "  return (\n    <Layout>\n      <div className=\"h-screen flex flex-col bg-gray-50\">",
    "  return (\n    <div className=\"h-screen flex flex-col bg-gray-50\">"
)

# 6. Remove Layout wrapper closing  
content = content.replace(
    "    </Layout>\n  );\n};\n\nexport default Reservations;",
    "  );\n};\n\nexport default Orders;"
)

# 7. Add calendar widget before closing of dateRange div
calendar_widget = '''                    
                    {/* Custom Date Range Button */}
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                        showDatePicker ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Özel aralık seç
                    </button>

                    {/* Calendar Widget */}
                    {showDatePicker && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Tarih Seç</span>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
                            <input
                              type="date"
                              value={customDateFrom}
                              onChange={(e) => setCustomDateFrom(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
                            <input
                              type="date"
                              value={customDateTo}
                              onChange={(e) => setCustomDateTo(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <button
                            onClick={() => {
                              if (customDateFrom && customDateTo) {
                                setShowDatePicker(false);
                              }
                            }}
                            className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Uygula
                          </button>
                        </div>
                      </div>
                    )}'''

# Find the location to insert calendar widget (after the date range map closing)
content = content.replace(
    "                    ))}\n                  </div>\n                )}\n              </div>",
    "                    ))}"+calendar_widget+"\n                  </div>\n                )}\n              </div>"
)

# Write to Orders.tsx
with open('src/pages/Orders.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Orders.tsx successfully created!")
print("Changes made:")
print("  - Removed Layout import and wrapper")
print("  - Added X icon import")
print("  - Changed component name to Orders")
print("  - Added customDateFrom and customDateTo states")
print("  - Added calendar widget with date picker")
