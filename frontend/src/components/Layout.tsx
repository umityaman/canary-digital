import React, { useState, useEffect } from 'react'
import { Search, Calendar, Clock, Moon, Sun, Maximize2, Minimize2, User, LogOut, Settings } from 'lucide-react'
import Sidebar from './Sidebar'
import { usePageInfo } from '../hooks/usePageInfo'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { NotificationPanel, NotificationBanner } from './NotificationSystem'

const Layout: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const pageInfo = usePageInfo()
  const PageIcon = pageInfo.icon
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Canlı saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Profil menüsünü dışarı tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && !(event.target as Element).closest('.relative')) {
        setShowProfileMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileMenu])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-neutral-900' : 'bg-neutral-50'}`}>
      {!sidebarCollapsed && <Sidebar />}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-64'}`}>
        {/* Modern Header */}
        <header className={`border-b px-4 md:px-8 py-4 sticky top-0 z-30 ${
          isDarkMode 
            ? 'bg-neutral-900 border-neutral-800' 
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between gap-6">
            {/* Sol: Sayfa Başlığı + Icon */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'
              }`}>
                <PageIcon className={`w-5 h-5 ${
                  isDarkMode ? 'text-neutral-400' : 'text-neutral-700'
                }`} />
              </div>
              <h1 className={`text-2xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                {pageInfo.title}
              </h1>
            </div>
            
            {/* Orta: Global Arama */}
            <div className="hidden sm:block flex-1 max-w-2xl">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`} />
                <input
                  type="text"
                  placeholder="Ara... (Sipariş, Müşteri, Ekipman)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-neutral-600' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-neutral-300'
                  }`}
                />
              </div>
            </div>
            
            {/* Sağ: Tarih, Saat, Full Screen, Dark Mode */}
            <div className="flex items-center gap-3">
              {/* Tarih Widget */}
              <div className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-neutral-800' : 'bg-neutral-50'
              }`}>
                <Calendar className={`w-4 h-4 ${
                  isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                }`} />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {formatDate(currentTime)}
                </span>
              </div>

              {/* Saat Widget */}
              <div className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-neutral-800' : 'bg-neutral-50'
              }`}>
                <Clock className={`w-4 h-4 ${
                  isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                }`} />
                <span className={`text-sm font-medium tabular-nums ${
                  isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {formatTime(currentTime)}
                </span>
              </div>

              {/* Notification Bell */}
              <NotificationPanel />

              {/* Full Screen Toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2.5 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
                title={sidebarCollapsed ? 'Sidebar\'ı Göster' : 'Tam Ekran'}
              >
                {sidebarCollapsed ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title="Profil Menüsü"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    isDarkMode ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-900'
                  }`}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name || 'Kullanıcı'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden z-50 ${
                    isDarkMode 
                      ? 'bg-neutral-800 border-neutral-700' 
                      : 'bg-white border-neutral-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      isDarkMode ? 'border-neutral-700' : 'border-neutral-100'
                    }`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {user?.name || 'Kullanıcı'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {user?.email || 'email@example.com'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowProfileMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-neutral-300 hover:bg-neutral-700' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <User size={16} />
                      <span>Profilim</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/admin')
                        setShowProfileMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-neutral-300 hover:bg-neutral-700' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Settings size={16} />
                      <span>Ayarlar</span>
                    </button>

                    <div className={`border-t ${isDarkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:bg-neutral-700' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <LogOut size={16} />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-neutral-800 text-yellow-400 hover:bg-neutral-700' 
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>
        
        {/* Notification Banner for urgent notifications */}
        <NotificationBanner />
        
        {/* Content */}
        <div className={`p-4 md:p-8 max-w-[1600px] mx-auto ${
          isDarkMode ? 'text-white' : ''
        }`}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
