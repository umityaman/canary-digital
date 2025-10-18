import { useState } from 'react'
import { HelpCircle, BookOpen, Video, Phone, Mail, X } from 'lucide-react'

export default function FloatingHelpWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const helpItems = [
    { 
      icon: BookOpen, 
      label: 'Kullanım Kılavuzu', 
      action: () => window.open('https://canary.com/docs', '_blank') 
    },
    { 
      icon: Video, 
      label: 'Video Eğitimler', 
      action: () => window.open('https://canary.com/tutorials', '_blank') 
    },
    { 
      icon: Phone, 
      label: 'Telefon Desteği', 
      description: '+90 555 123 4567',
      action: () => window.location.href = 'tel:+905551234567' 
    },
    { 
      icon: Mail, 
      label: 'E-posta Desteği', 
      description: 'destek@canary.com',
      action: () => window.location.href = 'mailto:destek@canary.com' 
    },
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-48 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 group"
        aria-label="Yardım"
      >
        <HelpCircle size={24} className={isOpen ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-blue-600 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Yardım Merkezi
        </span>
      </button>

      {/* Help Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Help Menu */}
          <div className="fixed bottom-24 right-48 bg-white rounded-lg shadow-2xl z-50 w-72 animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600" />
                <h3 className="font-semibold text-neutral-900">Yardım Merkezi</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Help List */}
            <div className="p-2">
              {helpItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action()
                      setIsOpen(false)
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-neutral-900 text-sm font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-neutral-600 text-xs mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
              <p className="text-xs text-neutral-600 text-center">
                Sorularınız için 7/24 destek
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
