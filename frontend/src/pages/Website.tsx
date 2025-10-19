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
  Image,
  Video,
  File,
  Trash2,
  Edit,
  MoreVertical,
  Calendar,
  Tag,
  DollarSign,
  Box,
  AlertCircle,
  CheckCircle,
  XCircle,
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
        return renderCMS();
      case 'shop':
        return renderShop();
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

  const renderCMS = () => {
    const pages = [
      { id: 1, title: 'Ana Sayfa', slug: '/home', status: 'published', views: 3500, lastUpdated: '2 saat önce', author: 'Admin', type: 'page' },
      { id: 2, title: 'Hakkımızda', slug: '/about', status: 'published', views: 1200, lastUpdated: '1 gün önce', author: 'Admin', type: 'page' },
      { id: 3, title: 'Ürünlerimiz', slug: '/products', status: 'published', views: 2100, lastUpdated: '3 saat önce', author: 'Admin', type: 'page' },
      { id: 4, title: 'İletişim', slug: '/contact', status: 'published', views: 890, lastUpdated: '5 gün önce', author: 'Admin', type: 'page' },
      { id: 5, title: '10 Kiralama İpucu', slug: '/blog/rental-tips', status: 'draft', views: 0, lastUpdated: '1 saat önce', author: 'Editör', type: 'blog' },
    ];

    const mediaItems = [
      { id: 1, name: 'hero-image.jpg', type: 'image', size: '2.4 MB', date: '19 Eki 2025' },
      { id: 2, name: 'product-demo.mp4', type: 'video', size: '45.2 MB', date: '18 Eki 2025' },
      { id: 3, name: 'logo-dark.svg', type: 'image', size: '12 KB', date: '17 Eki 2025' },
      { id: 4, name: 'brochure.pdf', type: 'file', size: '1.8 MB', date: '16 Eki 2025' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><FileText className="text-blue-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Toplam</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">45</h3>
            <p className="text-sm text-neutral-600">Sayfa</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><FileEdit className="text-purple-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Blog</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">23</h3>
            <p className="text-sm text-neutral-600">Yazı</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Image className="text-green-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Medya</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">156</h3>
            <p className="text-sm text-neutral-600">Dosya</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Clock className="text-orange-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Taslak</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">8</h3>
            <p className="text-sm text-neutral-600">Bekliyor</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Sayfalar & Blog</h3>
                <p className="text-sm text-neutral-600 mt-1">İçeriklerinizi yönetin ve düzenleyin</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input type="text" placeholder="Ara..." className="pl-4 pr-10 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 text-sm" />
                  <Search className="absolute right-3 top-2.5 text-neutral-400" size={16} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"><Plus size={16} />Yeni İçerik</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Başlık</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Tür</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Durum</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Görüntülenme</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Yazar</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Son Güncelleme</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4"><div><p className="font-medium text-neutral-900">{page.title}</p><p className="text-xs text-neutral-500">{page.slug}</p></div></td>
                    <td className="p-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${page.type === 'page' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{page.type === 'page' ? <FileText size={12} /> : <FileEdit size={12} />}{page.type === 'page' ? 'Sayfa' : 'Blog'}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{page.status === 'published' ? '✓ Yayında' : '⏳ Taslak'}</span></td>
                    <td className="p-4"><div className="flex items-center gap-1 text-neutral-700"><Eye size={14} /><span className="text-sm font-medium">{page.views.toLocaleString()}</span></div></td>
                    <td className="p-4"><span className="text-sm text-neutral-700">{page.author}</span></td>
                    <td className="p-4"><div className="flex items-center gap-1 text-neutral-600"><Calendar size={14} /><span className="text-sm">{page.lastUpdated}</span></div></td>
                    <td className="p-4"><div className="flex items-center gap-2"><button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Düzenle"><Edit size={16} className="text-neutral-700" /></button><button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Önizle"><Eye size={16} className="text-neutral-700" /></button><button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Sil"><Trash2 size={16} className="text-red-600" /></button><button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><MoreVertical size={16} className="text-neutral-700" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">5 içerikten 1-5 arası gösteriliyor</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Önceki</button>
              <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Sonraki</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div><h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><Image size={20} />Medya Kütüphanesi</h3><p className="text-sm text-neutral-600 mt-1">Görsel, video ve dosyalarınızı yönetin</p></div>
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"><Plus size={16} />Dosya Yükle</button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 transition-all cursor-pointer group">
                  <div className="flex items-center justify-center h-32 mb-3 bg-white rounded-lg">
                    {item.type === 'image' && <Image size={40} className="text-neutral-400" />}
                    {item.type === 'video' && <Video size={40} className="text-neutral-400" />}
                    {item.type === 'file' && <File size={40} className="text-neutral-400" />}
                  </div>
                  <div className="space-y-1"><p className="text-sm font-medium text-neutral-900 truncate" title={item.name}>{item.name}</p><div className="flex items-center justify-between"><span className="text-xs text-neutral-600">{item.size}</span><span className="text-xs text-neutral-500">{item.date}</span></div></div>
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"><button className="flex-1 py-1.5 bg-neutral-900 text-white rounded-lg text-xs hover:bg-neutral-800">Seç</button><button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button></div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center"><button className="px-6 py-2.5 border border-neutral-300 hover:border-neutral-400 rounded-xl text-sm font-medium transition-colors">Daha Fazla Yükle</button></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"><FileText size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Yeni Sayfa</h3><p className="text-sm text-white/80 mb-4">Boş sayfa oluştur</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Oluştur →</button></div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"><FileEdit size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Yeni Blog Yazısı</h3><p className="text-sm text-white/80 mb-4">Blog içeriği ekle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Yaz →</button></div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"><Image size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Medya Yükle</h3><p className="text-sm text-white/80 mb-4">Görsel/video ekle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Yükle →</button></div>
        </div>
      </div>
    );
  };

  const renderShop = () => {
    const products = [
      { id: 1, name: 'Sony A7 IV Kamera', category: 'Kamera', price: 500, stock: 5, status: 'available', sales: 42, image: '📷' },
      { id: 2, name: 'Canon 24-70mm Lens', category: 'Lens', price: 150, stock: 3, status: 'available', sales: 28, image: '🔭' },
      { id: 3, name: 'DJI Ronin RS3 Gimbal', category: 'Stabilizasyon', price: 300, stock: 2, status: 'low', sales: 15, image: '🎥' },
      { id: 4, name: 'Aputure 300D II Işık', category: 'Işık', price: 200, stock: 4, status: 'available', sales: 31, image: '💡' },
      { id: 5, name: 'Rode Wireless GO II', category: 'Ses', price: 100, stock: 0, status: 'out', sales: 56, image: '🎤' },
    ];

    return (
      <div className="space-y-6">
        {/* Shop Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><ShoppingBag className="text-blue-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Toplam</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">67</h3>
            <p className="text-sm text-neutral-600">Ürün</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="text-green-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Müsait</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">52</h3>
            <p className="text-sm text-neutral-600">Stokta</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><AlertCircle className="text-orange-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Düşük</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">8</h3>
            <p className="text-sm text-neutral-600">Stok Azaldı</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><XCircle className="text-red-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Tükendi</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">7</h3>
            <p className="text-sm text-neutral-600">Stok Yok</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Ürün Yönetimi</h3>
                <p className="text-sm text-neutral-600 mt-1">Kiralama ürünlerinizi ve stoklarınızı yönetin</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input type="text" placeholder="Ürün ara..." className="pl-4 pr-10 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 text-sm" />
                  <Search className="absolute right-3 top-2.5 text-neutral-400" size={16} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"><Plus size={16} />Yeni Ürün</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Ürün</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Kategori</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Fiyat</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Stok</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Durum</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Satışlar</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">{product.image}</div>
                        <div><p className="font-medium text-neutral-900">{product.name}</p></div>
                      </div>
                    </td>
                    <td className="p-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"><Tag size={12} />{product.category}</span></td>
                    <td className="p-4"><div className="flex items-center gap-1 text-neutral-900"><DollarSign size={14} /><span className="font-semibold">₺{product.price}</span><span className="text-xs text-neutral-500">/gün</span></div></td>
                    <td className="p-4"><div className="flex items-center gap-1"><Box size={14} className="text-neutral-600" /><span className="font-medium text-neutral-900">{product.stock}</span></div></td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === 'available' ? 'bg-green-100 text-green-700' : product.status === 'low' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {product.status === 'available' ? '✓ Müsait' : product.status === 'low' ? '⚠️ Düşük' : '✕ Tükendi'}
                      </span>
                    </td>
                    <td className="p-4"><span className="text-sm font-medium text-neutral-700">{product.sales} kiralama</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Düzenle"><Edit size={16} className="text-neutral-700" /></button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Önizle"><Eye size={16} className="text-neutral-700" /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Sil"><Trash2 size={16} className="text-red-600" /></button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><MoreVertical size={16} className="text-neutral-700" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">5 üründen 1-5 arası gösteriliyor</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Önceki</button>
              <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Sonraki</button>
            </div>
          </div>
        </div>

        {/* Revenue & Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center"><DollarSign className="mr-2 text-green-600" size={20} />Gelir Özeti</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div><p className="text-sm text-neutral-600">Bu Ay</p><p className="text-2xl font-bold text-neutral-900">₺32,450</p></div>
                <div className="text-right"><span className="text-sm text-green-600 font-medium">+18%</span><p className="text-xs text-neutral-500 mt-1">geçen aya göre</p></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div><p className="text-sm text-neutral-600">Geçen Ay</p><p className="text-xl font-bold text-neutral-900">₺27,500</p></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div><p className="text-sm text-neutral-600">Toplam (Yıl)</p><p className="text-xl font-bold text-neutral-900">₺285,600</p></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center"><Calendar className="mr-2 text-blue-600" size={20} />Rezervasyon Durumu</h3>
            <div className="space-y-3">
              {[
                { title: 'Sony A7 IV - Emirhan Y.', date: '20-22 Eki', status: 'active', color: 'bg-blue-500' },
                { title: 'DJI Ronin - Zeynep K.', date: '21-25 Eki', status: 'pending', color: 'bg-yellow-500' },
                { title: 'Canon Lens - Mehmet A.', date: '23-24 Eki', status: 'active', color: 'bg-blue-500' },
                { title: 'Aputure Işık - Ayşe D.', date: '25-27 Eki', status: 'confirmed', color: 'bg-green-500' },
              ].map((reservation, idx) => (
                <div key={idx} className="flex items-start border-l-4 pl-3 py-2" style={{ borderColor: reservation.color.replace('bg-', '#').replace('500', '') }}>
                  <span className={`w-2 h-2 ${reservation.color} rounded-full mr-3 mt-2`}></span>
                  <div className="flex-1"><p className="text-sm font-medium text-neutral-900">{reservation.title}</p><p className="text-xs text-neutral-600">{reservation.date}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"><ShoppingBag size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Yeni Ürün</h3><p className="text-sm text-white/80 mb-4">Kiralama ürünü ekle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Ekle →</button></div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"><Box size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Stok Yönetimi</h3><p className="text-sm text-white/80 mb-4">Stok güncelle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Yönet →</button></div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white"><Calendar size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Rezervasyonlar</h3><p className="text-sm text-white/80 mb-4">Tüm rezervasyonları gör</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Görüntüle →</button></div>
        </div>
      </div>
    );
  };

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