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
  Check,
  ExternalLink,
  Sparkles,
  Monitor,
  Smartphone,
  Settings,
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
        return renderSiteBuilder();
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

  const renderSiteBuilder = () => {
    const themes = [
      {
        id: 1,
        name: 'Modern Dark',
        category: 'Profesyonel',
        image: '🎨',
        color: 'from-neutral-900 to-neutral-800',
        isActive: true,
        features: ['Responsive', 'SEO Ready', 'Fast Loading'],
      },
      {
        id: 2,
        name: 'Minimal White',
        category: 'Minimalist',
        image: '✨',
        color: 'from-neutral-100 to-white',
        isActive: false,
        features: ['Clean Design', 'Typography', 'Animations'],
      },
      {
        id: 3,
        name: 'Creative Studio',
        category: 'Yaratıcı',
        image: '🎭',
        color: 'from-purple-500 to-pink-500',
        isActive: false,
        features: ['Portfolio', 'Gallery', 'Video Support'],
      },
      {
        id: 4,
        name: 'E-commerce Pro',
        category: 'E-ticaret',
        image: '🛒',
        color: 'from-blue-500 to-cyan-500',
        isActive: false,
        features: ['Product Grid', 'Cart', 'Checkout'],
      },
      {
        id: 5,
        name: 'Business Elite',
        category: 'Kurumsal',
        image: '💼',
        color: 'from-neutral-700 to-neutral-600',
        isActive: false,
        features: ['Corporate', 'Trust Elements', 'CTA'],
      },
      {
        id: 6,
        name: 'Rental Focus',
        category: 'Kiralama',
        image: '📦',
        color: 'from-green-500 to-emerald-500',
        isActive: false,
        features: ['Booking', 'Availability', 'Calendar'],
      },
    ];

    return (
      <div className="space-y-6">
        {/* Active Site Info */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Globe size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">canary-rental.com</h3>
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    Yayında
                  </span>
                </div>
                <p className="text-sm text-white/70">Modern Dark - Profesyonel Tema</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">
                <Monitor size={16} />
                Önizle
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">
                <Settings size={16} />
                Özelleştir
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-900 hover:bg-white/90 rounded-xl transition-colors text-sm font-medium">
                <ExternalLink size={16} />
                Siteyi Aç
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-sm text-white/70 mb-1">Sayfa Sayısı</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-sm text-white/70 mb-1">Son Güncelleme</p>
              <p className="text-2xl font-bold">2 saat önce</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-sm text-white/70 mb-1">Performans</p>
              <p className="text-2xl font-bold text-green-400">98/100</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-sm text-white/70 mb-1">SEO Skoru</p>
              <p className="text-2xl font-bold text-blue-400">92/100</p>
            </div>
          </div>
        </div>

        {/* Theme Gallery */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Tema Galerisi</h3>
              <p className="text-sm text-neutral-600 mt-1">60+ profesyonel tema arasından seçim yapın</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors text-sm font-medium text-neutral-900">
              <Sparkles size={16} />
              Tüm Temalar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden ${
                  theme.isActive 
                    ? 'border-neutral-900 shadow-xl' 
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Theme Preview */}
                <div className={`bg-gradient-to-br ${theme.color} h-40 flex items-center justify-center text-6xl relative`}>
                  {theme.image}
                  {theme.isActive && (
                    <div className="absolute top-3 right-3 bg-neutral-900 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check size={14} />
                      Aktif
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-neutral-900">{theme.name}</h4>
                    <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                      {theme.category}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {theme.features.map((feature, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-neutral-50 text-neutral-600 rounded-md">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {theme.isActive ? (
                      <button className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                        <Settings size={16} />
                        Özelleştir
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors">
                          Kullan
                        </button>
                        <button className="px-4 py-2.5 border border-neutral-300 hover:border-neutral-400 text-neutral-700 rounded-xl text-sm font-medium transition-colors">
                          <Eye size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
              <Palette className="mr-2 text-neutral-700" size={20} />
              Renk & Stil
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Ana Renk</label>
                <div className="flex gap-2">
                  {['#0f172a', '#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c'].map((color, idx) => (
                    <button
                      key={idx}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        idx === 0 ? 'border-neutral-900 scale-110' : 'border-neutral-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Yazı Tipi</label>
                <select className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900">
                  <option>Inter (Mevcut)</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Lato</option>
                  <option>Montserrat</option>
                </select>
              </div>
              <button className="w-full py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium">
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
              <Smartphone className="mr-2 text-neutral-700" size={20} />
              Cihaz Önizlemesi
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-neutral-900 text-white rounded-xl">
                <div className="flex items-center gap-3">
                  <Monitor size={20} />
                  <div className="text-left">
                    <p className="font-medium">Masaüstü</p>
                    <p className="text-xs text-white/70">1920x1080 ve üzeri</p>
                  </div>
                </div>
                <Check size={20} />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Monitor size={20} className="text-neutral-700" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-900">Tablet</p>
                    <p className="text-xs text-neutral-600">768x1024</p>
                  </div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-neutral-700" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-900">Mobil</p>
                    <p className="text-xs text-neutral-600">375x667</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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