import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Briefcase,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  FileText,
  Heart,
  GraduationCap,
  Target,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Plus,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Social Media Style Components
import PersonnelManagement from './hr/PersonnelManagement';
import RecruitmentManagement from './hr/RecruitmentManagement';
import LeaveManagement from './hr/LeaveManagement';
import PayrollManagement from './hr/PayrollManagement';
import PerformanceManagement from './hr/PerformanceManagement';
import TrainingManagement from './hr/TrainingManagement';

type TabType = 'feed' | 'personnel' | 'recruitment' | 'leave' | 'payroll' | 'performance' | 'training' | 'reports';

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    position: string;
    department: string;
  };
  type: 'announcement' | 'birthday' | 'newjoin' | 'achievement' | 'training';
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  image?: string;
}

const HumanResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for social feed
  const feedPosts: Post[] = [
    {
      id: 1,
      author: {
        name: 'İK Departmanı',
        avatar: '🏢',
        position: 'İnsan Kaynakları',
        department: 'Yönetim',
      },
      type: 'announcement',
      content: '🎉 Bugün aramıza katılan Ahmet Yılmaz\'a hoş geldiniz! Ahmet, Yazılım Geliştirme departmanında Senior Developer pozisyonunda görev yapacak.',
      timestamp: '2 saat önce',
      likes: 24,
      comments: 8,
      shares: 3,
    },
    {
      id: 2,
      author: {
        name: 'Ayşe Kaya',
        avatar: '👩‍💼',
        position: 'Proje Yöneticisi',
        department: 'Prodüksiyon',
      },
      type: 'achievement',
      content: '🏆 Harika bir başarı! Ekibimiz bu çeyrekte %25 performans artışı gösterdi. Tüm ekibe teşekkürler!',
      timestamp: '5 saat önce',
      likes: 47,
      comments: 12,
      shares: 5,
      image: 'https://via.placeholder.com/600x300',
    },
    {
      id: 3,
      author: {
        name: 'İK Departmanı',
        avatar: '🏢',
        position: 'İnsan Kaynakları',
        department: 'Yönetim',
      },
      type: 'birthday',
      content: '🎂 Bugün Mehmet Demir\'in doğum günü! En içten dileklerimizle... 🎉',
      timestamp: '1 gün önce',
      likes: 89,
      comments: 24,
      shares: 0,
    },
    {
      id: 4,
      author: {
        name: 'İK Departmanı',
        avatar: '🏢',
        position: 'İnsan Kaynakları',
        department: 'Yönetim',
      },
      type: 'training',
      content: '📚 Yeni eğitim programı: "Modern Liderlik Teknikleri" eğitimi 1 Kasım\'da başlıyor. Kayıtlar açıldı!',
      timestamp: '2 gün önce',
      likes: 34,
      comments: 7,
      shares: 12,
    },
  ];

  const quickStats = [
    {
      icon: <Users className="text-blue-600" size={24} />,
      label: 'Toplam Çalışan',
      value: '247',
      change: '+12',
      changeType: 'positive' as const,
      bg: 'bg-blue-50',
    },
    {
      icon: <UserPlus className="text-green-600" size={24} />,
      label: 'Yeni İşe Alım',
      value: '8',
      change: 'Bu ay',
      changeType: 'neutral' as const,
      bg: 'bg-green-50',
    },
    {
      icon: <Calendar className="text-orange-600" size={24} />,
      label: 'İzinli Personel',
      value: '12',
      change: 'Bugün',
      changeType: 'neutral' as const,
      bg: 'bg-orange-50',
    },
    {
      icon: <AlertCircle className="text-red-600" size={24} />,
      label: 'Bekleyen Onay',
      value: '5',
      change: 'İzin talebi',
      changeType: 'warning' as const,
      bg: 'bg-red-50',
    },
  ];

  const modules = [
    { id: 'personnel', label: 'Personel Yönetimi', icon: <Users size={20} />, color: 'bg-blue-600' },
    { id: 'recruitment', label: 'İşe Alım', icon: <Briefcase size={20} />, color: 'bg-green-600' },
    { id: 'leave', label: 'İzin Yönetimi', icon: <Calendar size={20} />, color: 'bg-orange-600' },
    { id: 'payroll', label: 'Bordro', icon: <DollarSign size={20} />, color: 'bg-purple-600' },
    { id: 'performance', label: 'Performans', icon: <Target size={20} />, color: 'bg-pink-600' },
    { id: 'training', label: 'Eğitim', icon: <GraduationCap size={20} />, color: 'bg-indigo-600' },
    { id: 'reports', label: 'Raporlar', icon: <FileText size={20} />, color: 'bg-neutral-600' },
  ];

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'birthday': return '🎂';
      case 'newjoin': return '👋';
      case 'achievement': return '🏆';
      case 'training': return '📚';
      default: return '📝';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personnel':
        return <PersonnelManagement />;
      case 'recruitment':
        return <RecruitmentManagement />;
      case 'leave':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'performance':
        return <PerformanceManagement />;
      case 'training':
        return <TrainingManagement />;
      case 'reports':
        return <div className="text-center py-12 text-gray-600">Raporlama modülü yakında...</div>;
      case 'feed':
      default:
        return (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Quick Links */}
            <div className="col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Briefcase size={18} />
                  Hızlı Erişim
                </h3>
                <div className="space-y-2">
                  {modules.slice(0, 6).map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setActiveTab(module.id as TabType)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors group"
                    >
                      <div className={`${module.color} w-8 h-8 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                        {module.icon}
                      </div>
                      <span className="font-medium">{module.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} />
                  Yaklaşan Etkinlikler
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex flex-col items-center justify-center">
                      <span className="text-xs text-blue-600 font-medium">KAS</span>
                      <span className="text-lg font-bold text-blue-600">01</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Liderlik Eğitimi</p>
                      <p className="text-xs text-neutral-600">09:00 - Toplantı Salonu</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex flex-col items-center justify-center">
                      <span className="text-xs text-green-600 font-medium">KAS</span>
                      <span className="text-lg font-bold text-green-600">05</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Performans Görüşmeleri</p>
                      <p className="text-xs text-neutral-600">Tüm Gün</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="col-span-6 space-y-4">
              {/* Create Post */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    İK
                  </div>
                  <button className="flex-1 text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors">
                    Duyuru paylaş, başarıları kutla...
                  </button>
                  <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Feed Posts */}
              {feedPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                          {post.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-neutral-900">{post.author.name}</h4>
                            <span className="text-2xl">{getPostIcon(post.type)}</span>
                          </div>
                          <p className="text-sm text-neutral-600">
                            {post.author.position} • {post.author.department}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">{post.timestamp}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <MoreVertical size={18} className="text-neutral-600" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <p className="text-neutral-800 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <img src={post.image} alt="" className="w-full h-64 object-cover" />
                  )}

                  {/* Post Actions */}
                  <div className="px-6 py-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-sm text-neutral-600 mb-3">
                      <span>{post.likes} beğeni</span>
                      <div className="flex gap-3">
                        <span>{post.comments} yorum</span>
                        <span>{post.shares} paylaşım</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 hover:bg-neutral-50 rounded-lg transition-colors text-neutral-700 font-medium">
                        <ThumbsUp size={18} />
                        Beğen
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 hover:bg-neutral-50 rounded-lg transition-colors text-neutral-700 font-medium">
                        <MessageSquare size={18} />
                        Yorum
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 hover:bg-neutral-50 rounded-lg transition-colors text-neutral-700 font-medium">
                        <Share2 size={18} />
                        Paylaş
                      </button>
                      <button className="p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                        <Bookmark size={18} className="text-neutral-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Sidebar - Quick Stats & Notifications */}
            <div className="col-span-3 space-y-4">
              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Bell size={18} />
                  Bildirimler
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    3
                  </span>
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Yeni izin talebi</p>
                      <p className="text-xs text-neutral-600">Ahmet Yılmaz yıllık izin talep etti</p>
                      <p className="text-xs text-neutral-500 mt-1">5 dk önce</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Sözleşme yenileme</p>
                      <p className="text-xs text-neutral-600">Ayşe Kaya sözleşmesi 15 gün sonra bitiyor</p>
                      <p className="text-xs text-neutral-500 mt-1">1 saat önce</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Eğitim hatırlatması</p>
                      <p className="text-xs text-neutral-600">Liderlik eğitimi yarın başlıyor</p>
                      <p className="text-xs text-neutral-500 mt-1">3 saat önce</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Birthdays */}
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  🎂 Doğum Günleri
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                      MD
                    </div>
                    <div>
                      <p className="font-medium">Mehmet Demir</p>
                      <p className="text-sm text-white/80">Bugün 🎉</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                      FÖ
                    </div>
                    <div>
                      <p className="font-medium">Fatma Öz</p>
                      <p className="text-sm text-white/80">3 gün sonra</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Culture */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Heart size={18} className="text-red-500" />
                  Şirket Kültürü
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-neutral-700">Esnek çalışma saatleri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-neutral-700">Uzaktan çalışma imkanı</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-neutral-700">Eğitim desteği</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-neutral-700">Sağlık sigortası</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Users size={32} className="text-blue-600" />
                İnsan Kaynakları
              </h1>
              <p className="text-neutral-600 mt-1">
                Çalışan yönetimi, işe alım ve performans takibi
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="Çalışan, pozisyon, departman ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-80 border border-neutral-200 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <button className="p-2.5 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors">
                <Filter size={18} className="text-neutral-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium">
                <Plus size={18} />
                Yeni Personel
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {quickStats.map((stat, index) => (
              <div key={index} className={`${stat.bg} rounded-xl p-4 border border-neutral-200`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'warning' ? 'text-red-600' : 
                    'text-neutral-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              📰 Ana Sayfa
            </button>
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveTab(module.id as TabType)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === module.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {module.icon}
                {module.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default HumanResources;
