import { useState } from 'react'
import { Settings, Users, Activity, Plug } from 'lucide-react'
import BooqableSettings from '../components/settings/BooqableSettings'

type TabType = 'genel' | 'kullanicilar' | 'entegrasyonlar'

export default function Admin(){
  const [activeTab, setActiveTab] = useState<TabType>('genel')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('genel')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'genel'
                ? 'bg-neutral-900 text-white shadow-lg'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Settings size={18} />
            <span className="font-medium">Genel Bakış</span>
          </button>
          <button
            onClick={() => setActiveTab('kullanicilar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'kullanicilar'
                ? 'bg-neutral-900 text-white shadow-lg'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Users size={18} />
            <span className="font-medium">Kullanıcılar</span>
          </button>
          <button
            onClick={() => setActiveTab('entegrasyonlar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'entegrasyonlar'
                ? 'bg-neutral-900 text-white shadow-lg'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Plug size={18} />
            <span className="font-medium">Entegrasyonlar</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'genel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <Users size={32} className="mx-auto text-neutral-700 mb-3" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">15</h3>
              <p className="text-neutral-600">Toplam Kullanıcı</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <Activity size={32} className="mx-auto text-neutral-700 mb-3" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">8</h3>
              <p className="text-neutral-600">Aktif Oturum</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">156</h3>
              <p className="text-neutral-600">Toplam Ekipman</p>
            </div>
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">99.9%</h3>
              <p className="text-neutral-600">Sistem Uptime</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Sistem Ayarları</h2>
              <div className="space-y-3">
                <button className="btn-secondary w-full">Genel Ayarlar</button>
                <button className="btn-secondary w-full">Email Ayarları</button>
                <button className="btn-secondary w-full">Güvenlik Ayarları</button>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Son Aktiviteler</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Yeni kullanıcı eklendi: john@example.com</span>
                  <span className="text-xs text-neutral-600">5 dk önce</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Sistem yedeği tamamlandı</span>
                  <span className="text-xs text-neutral-600">1 saat önce</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Güvenlik ayarları güncellendi</span>
                  <span className="text-xs text-neutral-600">3 saat önce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kullanicilar' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Kullanıcı Yönetimi</h2>
            <div className="space-y-3">
              <button className="btn-primary w-full">Yeni Kullanıcı Ekle</button>
              <button className="btn-secondary w-full">Yetki Grupları</button>
              <button className="btn-secondary w-full">Kullanıcı Listesi</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'entegrasyonlar' && (
        <div className="space-y-6">
          <BooqableSettings />
        </div>
      )}
    </div>
  )
}