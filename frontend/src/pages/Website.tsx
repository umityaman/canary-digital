import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Layout,
  FileText,
  Users,
  ShoppingBag,
  Search,
  DollarSign,
  Shield,
  Plus,
  TrendingUp,
  Eye,
  Clock,
  ArrowRight,
  Bell,
  Award,
  Star,
} from 'lucide-react';

const Website: React.FC = () => {
  const modules = [
    {
      id: 1,
      title: 'Site Oluşturma',
      description: 'Şablon seçimi, sürükle-bırak düzenleme',
      icon: Layout,
      link: '/website/builder',
      color: 'from-neutral-900 to-neutral-800',
      stats: '3 Aktif Site',
    },
    {
      id: 2,
      title: 'İçerik Yönetimi',
      description: 'Sayfalar, blog, medya galerisi',
      icon: FileText,
      link: '/website/cms',
      color: 'from-neutral-800 to-neutral-700',
      stats: '45 Sayfa',
    },
    {
      id: 3,
      title: 'Üyelik Sistemi',
      description: 'Kullanıcılar, roller, profiller',
      icon: Users,
      link: '/website/users',
      color: 'from-neutral-700 to-neutral-600',
      stats: '234 Üye',
    },
    {
      id: 4,
      title: 'Kiralama Yönetimi',
      description: 'Ürünler, rezervasyon, takvim',
      icon: ShoppingBag,
      link: '/website/rental',
      color: 'from-neutral-600 to-neutral-500',
      stats: '67 Ürün',
    },
    {
      id: 5,
      title: 'SEO & Pazarlama',
      description: 'Meta etiketler, analytics, kampanya',
      icon: Search,
      link: '/website/seo',
      color: 'from-neutral-500 to-neutral-400',
      stats: '8 Kampanya',
    },
    {
      id: 6,
      title: 'Finans & Raporlar',
      description: 'Gelir-gider, komisyon, satış istatistikleri',
      icon: DollarSign,
      link: '/website/finance',
      color: 'from-neutral-900 to-neutral-800',
      stats: '₺125K Gelir',
    },
    {
      id: 7,
      title: 'Güvenlik',
      description: 'SSL, yedekleme, rol yönetimi',
      icon: Shield,
      link: '/website/security',
      color: 'from-neutral-800 to-neutral-700',
      stats: 'SSL Aktif',
    },
    {
      id: 8,
      title: 'Ayarlar',
      description: 'Dil, para birimi, API, bildirimler',
      icon: Globe,
      link: '/website/settings',
      color: 'from-neutral-700 to-neutral-600',
      stats: 'Yapılandır',
    },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 flex items-center gap-3">
              <Globe size={40} className="text-neutral-900" />
              Web Sitesi Yönetimi
            </h1>
            <p className="text-neutral-600 mt-2 text-lg">
              Kiralama platformunuzu oluşturun ve yönetin
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Site Oluştur
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.id}
              to={module.link}
              className="group bg-white rounded-2xl shadow-sm border border-neutral-200 hover:border-neutral-900 hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-br ${module.color} p-6`}>
                <Icon size={32} className="text-white" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">{module.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">{module.stats}</span>
                  <ArrowRight
                    size={18}
                    className="text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
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
              <div
                key={idx}
                className="flex items-start"
              >
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
              <div
                key={idx}
                className="flex items-center justify-between border-b border-neutral-100 pb-2"
              >
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
};

export default Website;