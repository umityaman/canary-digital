import { useState } from 'react'
import {
  Globe, Layout, FileText, ShoppingBag, Code, Package,
  Search, TrendingUp, Plus, Eye, Users, Calendar,
  BarChart3, Palette, Zap, Monitor, Activity, ArrowUpRight, Clock
} from 'lucide-react'

type Tab = 'sites' | 'builder' | 'cms' | 'shop' | 'embed' | 'apps' | 'seo' | 'analytics'

export default function Website() {
  const [activeTab, setActiveTab] = useState<Tab>('sites')

  const tabs = [
    { id: 'sites' as const, label: 'Web Siteleri', icon: <Globe size={18} />, description: 'Aktif web siteleri ve yönetim' },
    { id: 'builder' as const, label: 'Site Oluşturucu', icon: <Layout size={18} />, description: 'Sürükle-bırak editör' },
    { id: 'cms' as const, label: 'İçerik Yönetimi', icon: <FileText size={18} />, description: 'Blog ve sayfa yönetimi' },
    { id: 'shop' as const, label: 'Online Mağaza', icon: <ShoppingBag size={18} />, description: 'E-ticaret yönetimi' },
    { id: 'embed' as const, label: 'Embed & Entegrasyon', icon: <Code size={18} />, description: 'Widget ve API entegrasyonları' },
    { id: 'apps' as const, label: 'Uygulamalar', icon: <Package size={18} />, description: 'Eklentiler ve uzantılar' },
    { id: 'seo' as const, label: 'SEO & Pazarlama', icon: <Search size={18} />, description: 'Arama motoru optimizasyonu' },
    { id: 'analytics' as const, label: 'İstatistikler', icon: <TrendingUp size={18} />, description: 'Ziyaretçi ve performans' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Globe className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">+2 Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Aktif Web Sitesi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">+15.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">24.5K</h3>
          <p className="text-sm text-neutral-600">Toplam Ziyaretçi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">156</h3>
          <p className="text-sm text-neutral-600">Online Satış</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Activity className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Ortalama</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">98%</h3>
          <p className="text-sm text-neutral-600">Uptime Oranı</p>
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 px-4 py-4 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="mt-0.5">{tab.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Content Area - Sites Tab */}
          <div className="flex-1 p-6">
            {activeTab === 'sites' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Web Siteleri</h2>
                  <p className="text-neutral-600 mb-6">
                    Tüm web sitelerinizi tek yerden yönetin.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                          <Globe className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">Canary Kurumsal</h3>
                          <p className="text-sm text-neutral-600">canary.com.tr</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">Aktif</span>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Ziyaretçi:</span>
                        <span className="font-medium text-neutral-900">12.5K</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sayfa:</span>
                        <span className="font-medium text-neutral-900">24</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">Düzenle</button>
                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm">Görüntüle</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs with placeholder content */}
            {activeTab !== 'sites' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">{tabs.find(t => t.id === activeTab)?.label}</h2>
                  <p className="text-neutral-600">{tabs.find(t => t.id === activeTab)?.description}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                  <p className="text-neutral-600">İçerik yakında eklenecek...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}