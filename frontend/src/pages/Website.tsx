import React, { useState } from 'react';
import {
  Globe,
  Layout,
  FileText,
  ShoppingBag,
  Code,
  Package,
  Search,
  TrendingUp,
  Plus,
  Eye,
  Users,
  Clock,
  Bell,
  Award,
  Star,
  BarChart3,
  Palette,
  FileEdit,
  Zap,
} from 'lucide-react';

type Tab = 'dashboard' | 'builder' | 'cms' | 'shop' | 'embed' | 'apps' | 'seo' | 'analytics';

const Website: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'builder' as const, label: 'Site Oluşturucu', icon: <Layout size={18} /> },
    { id: 'cms' as const, label: 'İçerik Yönetimi', icon: <FileText size={18} /> },
    { id: 'shop' as const, label: 'Online Mağaza', icon: <ShoppingBag size={18} /> },
    { id: 'embed' as const, label: 'Embed & Entegrasyon', icon: <Code size={18} /> },
    { id: 'apps' as const, label: 'Uygulamalar', icon: <Package size={18} /> },
    { id: 'seo' as const, label: 'SEO & Pazarlama', icon: <Search size={18} /> },
    { id: 'analytics' as const, label: 'İstatistikler', icon: <TrendingUp size={18} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'builder':
        return renderPlaceholder('Site Oluşturucu', 'Tema seçimi ve özelleştirme özellikleri yakında eklenecek');
      case 'cms':
        return renderPlaceholder('İçerik Yönetimi', 'Sayfa, blog ve medya yönetimi özellikleri yakında eklenecek');
      case 'shop':
        return renderPlaceholder('Online Mağaza', 'Ürün yönetimi ve rezervasyon özellikleri yakında eklenecek');
      case 'embed':
        return renderPlaceholder('Embed & Entegrasyon', 'WordPress, Shopify ve diğer platform entegrasyonları yakında eklenecek');
      case 'apps':
        return renderPlaceholder('Uygulamalar', 'Uygulama marketyeri ve entegrasyonlar yakında eklenecek');
      case 'seo':
        return renderPlaceholder('SEO & Pazarlama', 'SEO araçları ve pazarlama özellikleri yakında eklenecek');
      case 'analytics':
        return renderPlaceholder('İstatistikler', 'Detaylı analitik raporlar ve grafikler yakında eklenecek');
      default:
        return null;
    }
  };

  const renderPlaceholder = (title: string, description: string) => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileEdit className="text-neutral-400" size={48} />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600 max-w-md mx-auto">{description}</p>
        <button className="mt-6 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
          Yakında
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Eye className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">12.5K</h3>
          <p className="text-sm text-neutral-600">Toplam Ziyaretçi</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
            <TrendingUp size={14} />
            <span>+15%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">234</h3>
          <p className="text-sm text-neutral-600">Kullanıcılar</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
            <TrendingUp size={14} />
            <span>+8%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Ortalama</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">3:45</h3>
          <p className="text-sm text-neutral-600">Oturum Süresi</p>
          <p className="text-xs text-neutral-500 mt-2">dakika</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Oran</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">4.2%</h3>
          <p className="text-sm text-neutral-600">Dönüşüm</p>
          <p className="text-xs text-neutral-500 mt-2">rezervasyon/ziyaret</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Palette size={24} />
            </div>
            <span className="text-sm opacity-75">Eylem 1</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Yeni Site Oluştur</h3>
          <p className="text-sm opacity-75 mb-4">Hazır şablonlardan seçim yapın</p>
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
            Başla →
          </button>
        </div>

        <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <FileEdit size={24} />
            </div>
            <span className="text-sm opacity-75">Eylem 2</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Sayfa Ekle</h3>
          <p className="text-sm opacity-75 mb-4">Yeni içerik sayfası oluşturun</p>
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
            Oluştur →
          </button>
        </div>

        <div className="bg-gradient-to-br from-neutral-700 to-neutral-600 p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="text-sm opacity-75">Eylem 3</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Ürün Ekle</h3>
          <p className="text-sm opacity-75 mb-4">Yeni kiralama ürünü ekleyin</p>
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
            Ekle →
          </button>
        </div>
      </div>

      {/* Activity & Popular Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
            <Bell className="mr-2 text-neutral-700" size={20} />
            Son Aktiviteler
          </h3>
          <div className="space-y-3">
            {[
              { action: 'Yeni sayfa oluşturuldu', page: 'Ürünlerimiz', time: '5 dk önce', color: 'bg-green-500' },
              { action: 'Blog yazısı yayınlandı', page: 'Kiralama İpuçları', time: '1 saat önce', color: 'bg-blue-500' },
              { action: 'SEO ayarları güncellendi', page: 'Ana Sayfa', time: '2 saat önce', color: 'bg-yellow-500' },
              { action: 'Yeni rezervasyon', page: 'Sony A7 IV', time: '3 saat önce', color: 'bg-green-500' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start">
                <span className={`w-2 h-2 ${activity.color} rounded-full mr-3 mt-2`}></span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                  <p className="text-xs text-neutral-600">{activity.page} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
            <Award className="mr-2 text-neutral-700" size={20} />
            Popüler Sayfalar
          </h3>
          <div className="space-y-3">
            {[
              { page: 'Ana Sayfa', views: '3.5K', rate: '+12%' },
              { page: 'Ürünler', views: '2.1K', rate: '+8%' },
              { page: 'Blog', views: '1.8K', rate: '+15%' },
              { page: 'İletişim', views: '890', rate: '+5%' },
            ].map((page, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{page.page}</p>
                    <p className="text-xs text-neutral-600">{page.views} görüntülenme</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  <span className="text-sm font-medium text-green-600">{page.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">Web Sitesi</h1>
              <p className="text-xs text-neutral-600">Yönetim Paneli</p>
            </div>
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium">
            <Plus size={16} />
            Yeni Site
          </button>
        </div>


        {/* Tabs Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-lg'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-neutral-600'}>
                  {tab.icon}
                </span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 text-center">
            <p>Canary Digital</p>
            <p className="mt-1">Web Platform v2.0</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-neutral-600">
              {activeTab === 'dashboard' && 'Web sitenizin genel durumunu ve performansını görüntüleyin'}
              {activeTab === 'builder' && 'Site tasarımınızı oluşturun ve özelleştirin'}
              {activeTab === 'cms' && 'İçeriklerinizi oluşturun ve yönetin'}
              {activeTab === 'shop' && 'Ürünlerinizi ve rezervasyonlarınızı yönetin'}
              {activeTab === 'embed' && 'Sitenizi farklı platformlara entegre edin'}
              {activeTab === 'apps' && 'Üçüncü parti uygulamaları kurun ve yönetin'}
              {activeTab === 'seo' && 'SEO ve pazarlama araçlarınızı yönetin'}
              {activeTab === 'analytics' && 'Detaylı istatistikleri ve raporları görüntüleyin'}
            </p>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Website;