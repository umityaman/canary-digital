import { useState } from 'react';
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
  Plus,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

type Tab = 'projects' | 'budget' | 'team' | 'schedule' | 'post' | 'contracts' | 'equipment' | 'clients' | 'reports' | 'communications' | 'integrations' | 'settings';

const Production = () => {
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  const tabs = [
    { id: 'projects' as const, label: 'Proje Yönetimi', icon: <Film size={18} />, description: 'Film, dizi ve reklam projeleri' },
    { id: 'budget' as const, label: 'Bütçe Yönetimi', icon: <DollarSign size={18} />, description: 'Maliyet takibi ve faturalama' },
    { id: 'team' as const, label: 'Ekip & Oyuncu', icon: <Users size={18} />, description: 'Teknik kadro yönetimi' },
    { id: 'schedule' as const, label: 'Çekim Planlama', icon: <Calendar size={18} />, description: 'Call sheet ve lokasyon' },
    { id: 'post' as const, label: 'Post Prodüksiyon', icon: <Clapperboard size={18} />, description: 'Kurgu, renk, ses' },
    { id: 'contracts' as const, label: 'Sözleşmeler', icon: <FileText size={18} />, description: 'Kontrat ve belgeler' },
    { id: 'equipment' as const, label: 'Ekipman Kiralama', icon: <Package size={18} />, description: 'Envanter yönetimi' },
    { id: 'clients' as const, label: 'Müşteri & Ajans', icon: <Briefcase size={18} />, description: 'CRM ve teklif yönetimi' },
    { id: 'reports' as const, label: 'Raporlama', icon: <BarChart3 size={18} />, description: 'Kâr-zarar analizi' },
    { id: 'communications' as const, label: 'İletişim', icon: <MessageSquare size={18} />, description: 'Mesajlaşma ve duyurular' },
    { id: 'integrations' as const, label: 'Entegrasyonlar', icon: <Globe size={18} />, description: 'Google Drive, Slack' },
    { id: 'settings' as const, label: 'Ayarlar', icon: <Settings size={18} />, description: 'Modül yapılandırma' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Proje Yönetimi</h2>
                  <p className="text-neutral-600 mb-6">
                    Film, dizi, reklam ve video prodüksiyon projelerinizi yönetin
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Film className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Aktif Projeler</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Devam eden 3 proje: Film çekimi, reklam prodüksiyonu, kurumsal video
                    </p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Projeleri Görüntüle
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Plus className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Yeni Proje</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Yeni bir prodüksiyon projesi oluşturun ve ekibinizi yönetin
                    </p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Proje Oluştur
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'projects' && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Film className="text-neutral-400" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
                  <p className="text-neutral-600 max-w-md mx-auto mb-6">
                    {tabs.find(t => t.id === activeTab)?.description}
                  </p>
                  <button className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                    Yakında
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Production;
