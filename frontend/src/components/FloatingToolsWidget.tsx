import { useState } from 'react'
import { Wrench, Calculator, Calendar, FileText, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FloatingToolsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const tools = [
    { icon: Calculator, label: 'Hesap Makinesi', action: () => navigate('/tools/calculator') },
    { icon: Calendar, label: 'Takvim', action: () => navigate('/calendar') },
    { icon: FileText, label: 'Dökümanlar', action: () => navigate('/documents') },
    { icon: Wrench, label: 'Tüm Araçlar', action: () => navigate('/tools') },
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 bg-neutral-900 text-white p-4 rounded-full shadow-lg hover:bg-neutral-800 transition-all duration-300 z-50 group"
        aria-label="Araçlar"
      >
        <Wrench size={24} className={isOpen ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-neutral-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Araçlar
        </span>
      </button>

      {/* Tools Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tools Menu */}
          <div className="fixed bottom-24 right-24 bg-white rounded-lg shadow-2xl z-50 w-64 animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Wrench size={20} className="text-neutral-900" />
                <h3 className="font-semibold text-neutral-900">Hızlı Araçlar</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tools List */}
            <div className="p-2">
              {tools.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <button
                    key={index}
                    onClick={() => {
                      tool.action()
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition-colors text-left"
                  >
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <Icon size={18} className="text-neutral-900" />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">{tool.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
