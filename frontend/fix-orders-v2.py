#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Reservations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Layout import
content = content.replace("import Layout from '../components/Layout';", "")

# 2. Add useNavigate and X icon
content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';"
)

content = content.replace(
    "  Mail, Phone, Tag, StickyNote\n} from 'lucide-react';",
    "  Mail, Phone, Tag, StickyNote, X\n} from 'lucide-react';"
)

# 3. Component name and add navigate
content = content.replace(
    "const Reservations: React.FC = () => {",
    "const Orders: React.FC = () => {\n  const navigate = useNavigate();"
)

# 4. Remove showForm state
content = content.replace(
    "  const [showForm, setShowForm] = useState(false);",
    ""
)

# 5. Add custom date states
content = content.replace(
    "  const [showDatePicker, setShowDatePicker] = useState(false);",
    "  const [showDatePicker, setShowDatePicker] = useState(false);\n  const [customDateFrom, setCustomDateFrom] = useState('');\n  const [customDateTo, setCustomDateTo] = useState('');"
)

# 6. Remove Layout wrapper
content = content.replace(
    "  return (\n    <Layout>\n      <div className=\"h-screen flex flex-col bg-gray-50\">",
    "  return (\n    <div className=\"h-screen flex flex-col bg-gray-50\">"
)

# 7. Change button colors to green and add navigate
content = content.replace(
    "                onClick={() => setShowForm(true)}\n                className=\"flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm\"",
    "                onClick={() => navigate('/orders/new')}\n                className=\"flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm\""
)

content = content.replace(
    "                    onClick={() => setShowForm(true)}\n                    className=\"inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium\"",
    "                    onClick={() => navigate('/orders/new')}\n                    className=\"inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium\""
)

# 8. Remove showForm conditional and NewOrderForm
lines = content.split('\n')
new_lines = []
skip_until = None

for i, line in enumerate(lines):
    if '{showForm ? (' in line:
        skip_until = 'Main Content Area'
        continue
    if skip_until and skip_until in line:
        skip_until = None
        new_lines.append('          {/* Main Content Area */')
        continue
    if skip_until:
        continue
    if 'NewOrderForm onClose' in line:
        break
    new_lines.append(line)

content = '\n'.join(new_lines)

# 9. Add calendar widget after date range options
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

content = content.replace(
    "                    ))}\n                  </div>\n                )}\n              </div>",
    "                    ))}"+calendar_widget+"\n                  </div>\n                )}\n              </div>"
)

# 10. Fix closing tags
content = content.replace(
    "    </Layout>\n  );\n};\n\nexport default Reservations;",
    "  );\n};\n\nexport default Orders;"
)

# Write
with open('src/pages/Orders.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Orders.tsx created successfully!")
