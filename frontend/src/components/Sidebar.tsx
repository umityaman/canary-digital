import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, User, ShoppingCart, Package, Users, Calendar, 
  FileText, Truck, Calculator, Share2, Globe, 
  CheckSquare, MessageSquare, Video, Wrench, 
  Headphones, Film, HelpCircle, Settings,
  ChevronLeft, ChevronRight, ClipboardCheck, TrendingUp, FileCheck
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Auto-collapse on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const menuItems = [
    { to: '/', label: 'Anasayfa', icon: Home },
    { to: '/profile', label: 'Profil', icon: User },
    { to: '/documents?tab=analytics', label: 'Raporlar & Analiz', icon: TrendingUp },
    { to: '/orders', label: 'Siparişler', icon: ShoppingCart },
    { to: '/inventory', label: 'Envanter', icon: Package },
    { to: '/inspection', label: 'Kalite Kontrol', icon: ClipboardCheck },
    { to: '/customers', label: 'Müşteriler', icon: Users },
    { to: '/calendar', label: 'Takvim', icon: Calendar },
    { to: '/documents', label: 'Dökümanlar', icon: FileText },
    { to: '/suppliers', label: 'Tedarikçiler', icon: Truck },
    { to: '/accounting', label: 'Muhasebe', icon: Calculator },
    { to: '/delivery-notes', label: 'İrsaliyeler', icon: FileCheck },
    { to: '/social', label: 'Sosyal Medya', icon: Share2 },
    { to: '/website', label: 'Web Sitesi', icon: Globe },
    { to: '/todo', label: 'Yapılacaklar', icon: CheckSquare },
    { to: '/messaging', label: 'Mesajlaşma', icon: MessageSquare },
    { to: '/meetings', label: 'Toplantı', icon: Video },
    { to: '/tools', label: 'Araçlar', icon: Wrench },
    { to: '/customer-service', label: 'Müşteri Hizmetleri', icon: Headphones },
    { to: '/production', label: 'Yapım & Prodüksiyon', icon: Film },
    { to: '/tech-support', label: 'Teknik Destek', icon: HelpCircle },
    { to: '/technical-service', label: 'Teknik Servis', icon: Wrench },
    { to: '/settings', label: 'Ayarlar', icon: Settings },
    { to: '/ai-chatbot', label: 'İnsan Kaynakları', icon: Users },
  ]

  return (
    <aside className={`bg-white border-r border-neutral-200 transition-all duration-300 h-screen fixed left-0 top-0 overflow-y-auto z-40 hidden md:block ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header - Logo */}
      <div className="flex items-center justify-center p-4 border-b border-neutral-200">
        <img 
          src="/canary-logo.png" 
          alt="Canary Logo" 
          className={isCollapsed ? "h-8 w-auto" : "h-10 w-auto"}
        />
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-neutral-100 rounded transition-colors text-neutral-700"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-2 pb-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm transition-all duration-200 hover:bg-neutral-100 mx-2 rounded-lg ${
                  isActive ? 'bg-neutral-900 text-white font-medium' : 'text-neutral-900'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar