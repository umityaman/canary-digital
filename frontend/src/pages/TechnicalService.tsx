import { useState } from 'react'
import {
  Wrench, ClipboardList, Settings, Package, Users, FileText,
  Clock, AlertCircle, TrendingUp, CheckCircle
} from 'lucide-react'

type Tab = 'dashboard' | 'work-orders' | 'assets' | 'parts' | 'technicians' | 'reports'

export default function TechnicalService() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <TrendingUp size={18} />, description: 'Genel bakış ve istatistikler' },
    { id: 'work-orders' as const, label: 'İş Emirleri', icon: <ClipboardList size={18} />, description: 'Servis talepleri ve iş emirleri' },
    { id: 'assets' as const, label: 'Ekipman', icon: <Settings size={18} />, description: 'Servise gelen ekipmanlar' },
    { id: 'parts' as const, label: 'Parça Stok', icon: <Package size={18} />, description: 'Yedek parça yönetimi' },
    { id: 'technicians' as const, label: 'Teknisyenler', icon: <Users size={18} />, description: 'Teknisyen yönetimi ve görevlendirme' },
    { id: 'reports' as const, label: 'Raporlar', icon: <FileText size={18} />, description: 'Performans raporları' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">18</h3>
          <p className="text-sm text-neutral-600">Açık İş Emirleri</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Ortalama</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">3.5 gün</h3>
          <p className="text-sm text-neutral-600">Tamir Süresi (MTTR)</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Package className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Uyarı</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">5</h3>
          <p className="text-sm text-neutral-600">Düşük Stok Uyarısı</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Görevde</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Aktif Teknisyen</p>
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

          {/* Content Area - Dashboard Tab */}
          <div className="flex-1 p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Teknik Servis Dashboard</h2>
                  <p className="text-neutral-600 mb-6">
                    Genel bakış, aktif iş emirleri ve performans metrikleri.
                  </p>
                </div>

                {/* SLA Critical Alert */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">SLA Uyarısı</h3>
                      <p className="text-sm text-red-700">3 iş emri için son teslim tarihi yaklaşıyor!</p>
                    </div>
                  </div>
                </div>

                {/* Recent Work Orders */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Son İş Emirleri</h3>
                  <div className="space-y-3">
                    <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                            <Wrench className="text-white" size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">TS-2025-001</h4>
                            <p className="text-sm text-neutral-600">Canon Projeksiyon Cihazı</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-lg">
                          Onarımda
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-neutral-600">
                        <div>
                          <span className="text-neutral-500">Müşteri:</span>
                          <p className="font-medium text-neutral-900">ABC Şirket</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Teknisyen:</span>
                          <p className="font-medium text-neutral-900">Ahmet Yılmaz</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Tahmini:</span>
                          <p className="font-medium text-neutral-900">2 gün</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                            <CheckCircle className="text-white" size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">TS-2025-002</h4>
                            <p className="text-sm text-neutral-600">Sony Ses Sistemi</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-lg">
                          Tamamlandı
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-neutral-600">
                        <div>
                          <span className="text-neutral-500">Müşteri:</span>
                          <p className="font-medium text-neutral-900">XYZ Ltd.</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Teknisyen:</span>
                          <p className="font-medium text-neutral-900">Mehmet Demir</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Tamamlanma:</span>
                          <p className="font-medium text-neutral-900">1 gün</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Düşük Stok Uyarıları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-orange-900">LED Lamba Seti</span>
                        <span className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded-lg font-medium">Kritik</span>
                      </div>
                      <p className="text-sm text-orange-700">Stok: 2 / Min: 10</p>
                    </div>

                    <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-orange-900">HDMI Kablo</span>
                        <span className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded-lg font-medium">Kritik</span>
                      </div>
                      <p className="text-sm text-orange-700">Stok: 5 / Min: 15</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Work Orders Tab */}
            {activeTab === 'work-orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İş Emirleri</h2>
                  <p className="text-neutral-600 mb-6">
                    Tüm servis taleplerini ve iş emirlerini yönetin.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                  <ClipboardList className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p className="text-neutral-600">İş emirleri listesi yakında eklenecek...</p>
                </div>
              </div>
            )}

            {/* Assets Tab */}
            {activeTab === 'assets' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Ekipman Yönetimi</h2>
                  <p className="text-neutral-600 mb-6">
                    Servise gelen ekipmanları kaydedin ve takip edin.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                  <Settings className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p className="text-neutral-600">Ekipman listesi yakında eklenecek...</p>
                </div>
              </div>
            )}

            {/* Parts Tab */}
            {activeTab === 'parts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Parça Stok Yönetimi</h2>
                  <p className="text-neutral-600 mb-6">
                    Yedek parça stoğunu ve tedarikçileri yönetin.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                  <Package className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p className="text-neutral-600">Parça stok listesi yakında eklenecek...</p>
                </div>
              </div>
            )}

            {/* Technicians Tab */}
            {activeTab === 'technicians' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Teknisyen Yönetimi</h2>
                  <p className="text-neutral-600 mb-6">
                    Teknisyenleri yönetin ve iş emirleri atayın.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                  <Users className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p className="text-neutral-600">Teknisyen listesi yakında eklenecek...</p>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Performans Raporları</h2>
                  <p className="text-neutral-600 mb-6">
                    Teknik servis performansını analiz edin.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                  <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p className="text-neutral-600">Raporlar yakında eklenecek...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}