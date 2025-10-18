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
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Ziyaretçi</span>
              <Eye size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">12.5K</div>
            <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1">
              <TrendingUp size={14} />
              <span>+15% bu ay</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Aktif Kullanıcılar</span>
              <Users size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">234</div>
            <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1">
              <TrendingUp size={14} />
              <span>+8% bu hafta</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Ortalama Süre</span>
              <Clock size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">3:45</div>
            <div className="text-xs text-neutral-600 mt-1">dakika</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Dönüşüm Oranı</span>
              <TrendingUp size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">4.2%</div>
            <div className="text-xs text-neutral-600 mt-1">rezervasyon/ziyaret</div>
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
              className="group bg-white rounded-xl border border-neutral-200 hover:border-neutral-900 hover:shadow-xl transition-all overflow-hidden"
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
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            {[
              { action: 'Yeni sayfa oluşturuldu', page: 'Ürünlerimiz', time: '5 dk önce' },
              { action: 'Blog yazısı yayınlandı', page: 'Kiralama İpuçları', time: '1 saat önce' },
              { action: 'SEO ayarları güncellendi', page: 'Ana Sayfa', time: '2 saat önce' },
              { action: 'Yeni rezervasyon', page: 'Sony A7 IV', time: '3 saat önce' },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-neutral-900">{activity.action}</div>
                  <div className="text-xs text-neutral-600">{activity.page}</div>
                </div>
                <div className="text-xs text-neutral-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Popüler Sayfalar</h3>
          <div className="space-y-3">
            {[
              { page: 'Ana Sayfa', views: '3.5K', rate: '+12%' },
              { page: 'Ürünler', views: '2.1K', rate: '+8%' },
              { page: 'Blog', views: '1.8K', rate: '+15%' },
              { page: 'İletişim', views: '890', rate: '+5%' },
            ].map((page, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Eye size={16} className="text-neutral-700" />
                  <div className="text-sm font-medium text-neutral-900">{page.page}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-neutral-900">{page.views}</div>
                  <div className="text-xs text-neutral-600">{page.rate}</div>
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