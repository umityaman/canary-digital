import React from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  DollarSign,
  Users,
  Calendar,
  Clapperboard,
  FileText,
  Package,
  Briefcase,
  BarChart3,
  MessageSquare,
  Settings,
  Globe,
  ArrowRight,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';

const Production: React.FC = () => {
  const modules = [
    {
      id: 1,
      title: 'Proje Yönetimi',
      description: 'Film, dizi, reklam projelerinizi yönetin',
      icon: Film,
      link: '/production/projects',
      color: 'from-neutral-900 to-neutral-800',
      stats: '3 Aktif Proje',
    },
    {
      id: 2,
      title: 'Bütçe Yönetimi',
      description: 'Maliyetleri takip edin, fatura yönetin',
      icon: DollarSign,
      link: '/production/budget',
      color: 'from-neutral-800 to-neutral-700',
      stats: '₺250K Bütçe',
    },
    {
      id: 3,
      title: 'Ekip & Oyuncu',
      description: 'Teknik kadro ve oyuncu yönetimi',
      icon: Users,
      link: '/production/team',
      color: 'from-neutral-700 to-neutral-600',
      stats: '24 Ekip Üyesi',
    },
    {
      id: 4,
      title: 'Çekim Planlama',
      description: 'Call sheet, sahne planı, lokasyon',
      icon: Calendar,
      link: '/production/schedule',
      color: 'from-neutral-600 to-neutral-500',
      stats: '5 Çekim Günü',
    },
    {
      id: 5,
      title: 'Post Prodüksiyon',
      description: 'Kurgu, renk, ses, efekt takibi',
      icon: Clapperboard,
      link: '/production/post-production',
      color: 'from-neutral-500 to-neutral-400',
      stats: '8 Görev',
    },
    {
      id: 6,
      title: 'Sözleşmeler',
      description: 'Kontrat, lisans ve belgeler',
      icon: FileText,
      link: '/production/contracts',
      color: 'from-neutral-400 to-neutral-300',
      stats: '12 Sözleşme',
    },
    {
      id: 7,
      title: 'Ekipman Kiralama',
      description: 'Ekipman envanter ve kiralama',
      icon: Package,
      link: '/production/equipment',
      color: 'from-neutral-900 to-neutral-800',
      stats: '45 Ekipman',
    },
    {
      id: 8,
      title: 'Müşteri & Ajans',
      description: 'CRM, teklif, revizyon yönetimi',
      icon: Briefcase,
      link: '/production/clients',
      color: 'from-neutral-800 to-neutral-700',
      stats: '15 Müşteri',
    },
    {
      id: 9,
      title: 'Raporlama',
      description: 'Kâr-zarar, performans analizi',
      icon: BarChart3,
      link: '/production/reports',
      color: 'from-neutral-700 to-neutral-600',
      stats: '6 Rapor',
    },
    {
      id: 10,
      title: 'İletişim',
      description: 'Mesajlaşma, duyurular, set notları',
      icon: MessageSquare,
      link: '/production/communications',
      color: 'from-neutral-600 to-neutral-500',
      stats: '23 Mesaj',
    },
    {
      id: 11,
      title: 'Entegrasyonlar',
      description: 'Google Drive, Slack, Calendar sync',
      icon: Globe,
      link: '/production/integrations',
      color: 'from-neutral-500 to-neutral-400',
      stats: '4 Bağlantı',
    },
    {
      id: 12,
      title: 'Ayarlar',
      description: 'Modül ayarları ve yapılandırma',
      icon: Settings,
      link: '/production/settings',
      color: 'from-neutral-400 to-neutral-300',
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
              <Film size={40} className="text-neutral-900" />
              Yapım & Prodüksiyon
            </h1>
            <p className="text-neutral-600 mt-2 text-lg">
              Film, dizi, reklam ve video prodüksiyon süreçlerinizi yönetin
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Proje
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Film className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">12</h3>
          <p className="text-sm text-neutral-600">Toplam Proje</p>
          <p className="text-xs text-neutral-500 mt-2">3 aktif, 9 tamamlandı</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bu Yıl</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">₺2.5M</h3>
          <p className="text-sm text-neutral-600">Toplam Bütçe</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
            <TrendingUp size={14} />
            <span>+18%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">47</h3>
          <p className="text-sm text-neutral-600">Ekip Üyeleri</p>
          <p className="text-xs text-neutral-500 mt-2">Çalışanlar</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Son 6 Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">95%</h3>
          <p className="text-sm text-neutral-600">Müşteri Memnuniyeti</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
            <TrendingUp size={14} />
            <span>+5%</span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  );
};

export default Production;
