import React, { useState } from 'react'
import { Search, Home, Moon, Sun, Maximize2, Minimize2, LogOut, User } from 'lucide-react'
import Sidebar from './Sidebar'
import { useNavigate } from 'react-router-dom'
import { NotificationPanel, NotificationBanner } from './NotificationSystem'
import LanguageSwitcher from './LanguageSwitcher'
import { useAuthStore } from '../stores/authStore'

const Layout: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout()
      navigate('/login')
    }
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-neutral-900' : 'bg-neutral-50'}`}>
      <Sidebar />
      <main className="ml-0 md:ml-64 transition-all duration-300">
        {/* Simplified Header */}
        <header className={`border-b px-6 py-3.5 sticky top-0 z-30 ${
          isDarkMode 
            ? 'bg-neutral-900 border-neutral-800' 
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between gap-6">
            {/* Sol: Ana Sayfa İkonu + Link */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-neutral-300 hover:bg-neutral-800' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Ana Sayfa</span>
              </button>
              
              {/* Global Arama */}
              <div className="relative flex-1 min-w-[400px]">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`} />
                <input
                  type="text"
                  placeholder="Ara... (Sipariş, Müşteri, Ekipman)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-neutral-600' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-neutral-300'
                  }`}
                />
              </div>
            </div>
            
            {/* Sağ: Kullanıcı, Dil, Bildirimler, Dark Mode, Tam Ekran, Logout */}
            <div className="flex items-center gap-2">
              {/* User Info */}
              {user && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-neutral-800 text-neutral-300' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}>
                  <User size={16} />
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                  {user.role && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      user.role === 'ADMIN' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </div>
              )}

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notification Bell */}
              <NotificationPanel />

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Full Screen Toggle */}
              <button
                onClick={toggleFullScreen}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
                title="Çıkış Yap"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        
        {/* Notification Banner for urgent notifications */}
        <NotificationBanner />
        
        {/* Content */}
        <div className={`p-6 ${isDarkMode ? 'text-white' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
