import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Calendar, Users, Activity, Plug, Database } from 'lucide-react';
import GoogleAuthButton from '../components/calendar/GoogleAuthButton';
import NotificationPreferences from '../components/settings/NotificationPreferences';
import BooqableSettings from '../components/settings/BooqableSettings';

type Tab = 'profile' | 'notifications' | 'security' | 'integrations' | 'admin' | 'users'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as Tab, label: 'Profil Ayarları', icon: <User size={18} />, description: 'Kişisel bilgiler' },
    { id: 'notifications' as Tab, label: 'Bildirimler', icon: <Bell size={18} />, description: 'Bildirim tercihleri' },
    { id: 'security' as Tab, label: 'Güvenlik', icon: <Shield size={18} />, description: 'Şifre ve 2FA' },
    { id: 'integrations' as Tab, label: 'Entegrasyonlar', icon: <Plug size={18} />, description: 'Harici servisler' },
    { id: 'admin' as Tab, label: 'Yönetim', icon: <SettingsIcon size={18} />, description: 'Sistem ayarları' },
    { id: 'users' as Tab, label: 'Kullanıcılar', icon: <Users size={18} />, description: 'Kullanıcı yönetimi' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Profil Ayarları</h2>
            <div className="space-y-6">
              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Ad</label>
                    <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" defaultValue="Admin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Soyad</label>
                    <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" defaultValue="User" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">E-posta</label>
                    <input type="email" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" defaultValue="admin@canary.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Telefon</label>
                    <input type="tel" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" defaultValue="+90 555 123 45 67" />
                  </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                  Kaydet
                </button>
              </div>

              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Tercihler</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Dil</label>
                    <select className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900">
                      <option>Türkçe</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Saat Dilimi</label>
                    <select className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900">
                      <option>Istanbul (UTC+3)</option>
                      <option>London (UTC+0)</option>
                      <option>New York (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Bildirim Tercihleri</h2>
            <NotificationPreferences />
          </div>
        );

      case 'security':
        return (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Güvenlik Ayarları</h2>
            <div className="space-y-6">
              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Şifre Değiştir</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Mevcut Şifre</label>
                    <input type="password" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Yeni Şifre</label>
                    <input type="password" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Yeni Şifre (Tekrar)</label>
                    <input type="password" className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                  Şifreyi Güncelle
                </button>
              </div>

              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">İki Faktörlü Kimlik Doğrulama</h3>
                <p className="text-sm text-neutral-600 mb-4">Hesabınızı ekstra bir güvenlik katmanıyla koruyun.</p>
                <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                  <span className="font-medium text-neutral-900">2FA Aktif</span>
                  <input type="checkbox" className="w-5 h-5" />
                </label>
              </div>

              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Aktif Oturumlar</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl">
                    <div>
                      <p className="font-medium text-neutral-900">Windows PC - Chrome</p>
                      <p className="text-sm text-neutral-600">Istanbul, Turkey • Son kullanım: Şimdi</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Entegrasyonlar</h2>
            <div className="space-y-6">
              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Takvim Entegrasyonları</h3>
                <GoogleAuthButton />
                <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    <Calendar className="inline-block mr-2" size={16} />
                    Microsoft Outlook ve Apple Calendar entegrasyonları yakında...
                  </p>
                </div>
              </div>

              <BooqableSettings />
            </div>
          </div>
        );

      case 'admin':
        return (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Sistem Yönetimi</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-neutral-200 rounded-xl p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Sistem Ayarları</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                      Genel Ayarlar
                    </button>
                    <button className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                      Email Ayarları
                    </button>
                    <button className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                      Güvenlik Politikaları
                    </button>
                    <button className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                      Yedekleme Ayarları
                    </button>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Son Aktiviteler</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start p-3 bg-neutral-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Yeni kullanıcı eklendi</p>
                        <p className="text-xs text-neutral-600">john@example.com</p>
                      </div>
                      <span className="text-xs text-neutral-500">5 dk önce</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-neutral-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Sistem yedeği tamamlandı</p>
                        <p className="text-xs text-neutral-600">Başarılı</p>
                      </div>
                      <span className="text-xs text-neutral-500">1 saat önce</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-neutral-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Güvenlik ayarları güncellendi</p>
                        <p className="text-xs text-neutral-600">2FA etkinleştirildi</p>
                      </div>
                      <span className="text-xs text-neutral-500">3 saat önce</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Sistem Durumu</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 font-medium mb-1">Database</p>
                    <p className="text-2xl font-bold text-green-700">✓</p>
                    <p className="text-xs text-green-600">Çalışıyor</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 font-medium mb-1">API Server</p>
                    <p className="text-2xl font-bold text-green-700">✓</p>
                    <p className="text-xs text-green-600">Çalışıyor</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 font-medium mb-1">Storage</p>
                    <p className="text-2xl font-bold text-green-700">72%</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Kullanıcı Yönetimi</h2>
            <div className="space-y-6">
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                  + Yeni Kullanıcı Ekle
                </button>
                <button className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors">
                  Yetki Grupları
                </button>
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
                  <div className="grid grid-cols-5 gap-4 font-medium text-sm text-neutral-700">
                    <div>İsim</div>
                    <div>E-posta</div>
                    <div>Rol</div>
                    <div>Durum</div>
                    <div>İşlemler</div>
                  </div>
                </div>
                <div className="divide-y divide-neutral-200">
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-neutral-900">Admin User</div>
                      <div className="text-sm text-neutral-600">admin@canary.com</div>
                      <div><span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">Admin</span></div>
                      <div><span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Aktif</span></div>
                      <div><button className="text-sm text-neutral-700 hover:text-neutral-900">Düzenle</button></div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-neutral-900">Test User</div>
                      <div className="text-sm text-neutral-600">test@canary.com</div>
                      <div><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">Kullanıcı</span></div>
                      <div><span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Aktif</span></div>
                      <div><button className="text-sm text-neutral-700 hover:text-neutral-900">Düzenle</button></div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-neutral-900">John Doe</div>
                      <div className="text-sm text-neutral-600">john@example.com</div>
                      <div><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">Kullanıcı</span></div>
                      <div><span className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium">Pasif</span></div>
                      <div><button className="text-sm text-neutral-700 hover:text-neutral-900">Düzenle</button></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">15</h3>
          <p className="text-sm text-neutral-600">Toplam Kullanıcı</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Activity className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Online</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Aktif Oturum</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Plug className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bağlı</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">5</h3>
          <p className="text-sm text-neutral-600">Entegrasyon</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Database className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Uptime</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">99.9%</h3>
          <p className="text-sm text-neutral-600">Sistem Sağlığı</p>
        </div>
      </div>

      {/* Tab Navigation & Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-neutral-200 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p className={`text-xs ml-7 ${activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {tab.description}
                </p>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
