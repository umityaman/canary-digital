import React, { useEffect, useState } from 'react'
import { Plus, ShoppingCart, Package, FileText, MessageSquare, CheckSquare } from 'lucide-react'
import { useEquipmentStore } from '../stores/equipmentStore'
import { useAuthStore } from '../stores/authStore'
import QuickActionButton from '../components/QuickActionButton'
import ClockWidget from '../components/widgets/ClockWidget'
import CalculatorWidget from '../components/widgets/CalculatorWidget'
import CurrencyWidget from '../components/widgets/CurrencyWidget'

const Home: React.FC = () => {
  const { user } = useAuthStore()
  const { equipment, fetchEquipment } = useEquipmentStore()
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    rentedEquipment: 0,
    maintenanceEquipment: 0
  })

  useEffect(() => {
    fetchEquipment()
  }, [])

  useEffect(() => {
    // Ekipman istatistiklerini hesapla
    const total = equipment.length
    const available = equipment.filter(e => e.status === 'AVAILABLE').length
    const rented = equipment.filter(e => e.status === 'RENTED').length
    const maintenance = equipment.filter(e => e.status === 'MAINTENANCE').length

    setStats({
      totalEquipment: total,
      availableEquipment: available,
      rentedEquipment: rented,
      maintenanceEquipment: maintenance
    })
  }, [equipment])

  const quickActions = [
    { title: 'Müşteri Ekle', icon: <Plus />, color: 'primary' as const },
    { title: 'Sipariş Ekle', icon: <ShoppingCart />, color: 'success' as const },
    { title: 'Ekipman Ekle', icon: <Package />, color: 'secondary' as const },
    { title: 'Fatura Düzenle', icon: <FileText />, color: 'warning' as const },
    { title: 'Mesaj Yaz', icon: <MessageSquare />, color: 'primary' as const },
    { title: 'Görev Ekle', icon: <CheckSquare />, color: 'secondary' as const },
  ]

  return (
    <div className="space-y-8">
      {/* Hızlı İşlemler - Minimal White */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Hızlı İşlemler</h2>
          <p className="text-sm text-neutral-500 mt-1">Sık kullanılan işlemlerinize hızlı erişim</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => console.log(`${action.title} clicked`)}
              className="group cursor-pointer bg-white hover:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 hover:border-neutral-900 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                <span className="text-neutral-700 group-hover:text-neutral-900">
                  {action.icon}
                </span>
              </div>
              <h3 className="font-medium text-neutral-900 group-hover:text-white text-sm transition-colors">
                {action.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Ekipman Durumu - Minimal Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Ekipman Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">Toplam Ekipman</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.totalEquipment}</p>
              <p className="text-sm text-neutral-500 mt-1">Tüm envanteriniz</p>
            </div>
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-neutral-700" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center text-sm text-neutral-600">
              <div className="w-2 h-2 bg-neutral-900 rounded-full mr-2"></div>
              Aktif ekipmanlar
            </div>
          </div>
        </div>

        {/* Müsait Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">Müsait</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.availableEquipment}</p>
              <p className="text-sm text-neutral-500 mt-1">Kiralama için hazır</p>
            </div>
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-neutral-700" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-neutral-900 rounded-full mr-2"></div>
              <span className="text-neutral-700 font-medium">%{stats.totalEquipment > 0 ? Math.round((stats.availableEquipment / stats.totalEquipment) * 100) : 0} müsaitlik oranı</span>
            </div>
          </div>
        </div>

        {/* Kiralık Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Kiralık</p>
              <p className="text-3xl font-bold text-red-600">{stats.rentedEquipment}</p>
              <p className="text-sm text-gray-500 mt-1">Şu anda kirada</p>
            </div>
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-neutral-700" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-red-700 font-medium">Aktif kiralama</span>
            </div>
          </div>
        </div>

        {/* Bakımda Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bakımda</p>
              <p className="text-3xl font-bold text-orange-600">{stats.maintenanceEquipment}</p>
              <p className="text-sm text-gray-500 mt-1">Servis gerekli</p>
            </div>
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-neutral-700" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-orange-700 font-medium">Bakım kontrolü</span>
            </div>
          </div>
        </div>
      </section>

      {/* Son Eklenen Ekipmanlar - Refined Design */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Son Eklenen Ekipmanlar</h2>
            <p className="text-sm text-gray-500 mt-1">En son sisteme eklenen ekipmanlar</p>
          </div>
          <a 
            href="/inventory" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Tümünü Gör
            <Plus size={16} className="ml-2" />
          </a>
        </div>
        
        <div className="divide-y divide-gray-100">
          {equipment.slice(0, 4).map((item, index) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                    <Package size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand} {item.model}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {item.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                        item.status === 'RENTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.status === 'AVAILABLE' ? 'Müsait' : 
                         item.status === 'RENTED' ? 'Kiralık' : 'Bakımda'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {item.dailyPrice ? `₺${item.dailyPrice}` : '-'}
                  </div>
                  <div className="text-sm text-gray-500">günlük</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {equipment.length === 0 && (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ekipman yok</h3>
            <p className="text-gray-500 mb-6">İlk ekipmanınızı ekleyerek başlayın</p>
            <a 
              href="/inventory" 
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Ekipman Ekle
            </a>
          </div>
        )}
      </section>

      {/* Araçlar & Bilgi Merkezi - Professional Grid */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Araçlar & Bilgi Merkezi</h2>
          <p className="text-sm text-gray-500 mt-1">İş akışınızı hızlandıran araçlar ve güncel bilgiler</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Functional Widgets */}
          <ClockWidget />
          <CalculatorWidget />
          <CurrencyWidget />
          
          {/* Additional Information Widgets */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Borsa & Kripto</h3>
              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-neutral-700" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">BIST 100:</span>
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">+2.45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Bitcoin:</span>
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md">-1.23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Ethereum:</span>
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">+0.87%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Hava Durumu</h3>
              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌤️</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">22°C</div>
              <div className="text-sm text-gray-600 mb-2">İstanbul</div>
              <div className="text-xs text-gray-500 bg-white/60 px-3 py-1 rounded-full">Parçalı bulutlu</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Hatırlatıcılar</h3>
              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                <CheckSquare size={16} className="text-neutral-700" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white/70 rounded-lg p-3 border border-yellow-200">
                <div className="font-medium text-sm text-gray-900 mb-1">Bakım zamanı</div>
                <div className="text-xs text-gray-600">Sony A7 IV bakıma alınacak</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                <div className="font-medium text-sm text-gray-900 mb-1">Toplantı</div>
                <div className="text-xs text-gray-600">Müşteri görüşmesi - 14:00</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
