import { useState } from 'react';
import { Plus, Calendar, Clock, History, Users, Video, MapPin, CalendarDays } from 'lucide-react';

type Tab = 'upcoming' | 'today' | 'history' | 'rooms' | 'calendar';

export default function Meetings(){
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const tabs = [
    { id: 'upcoming' as const, label: 'Yaklaşan', icon: <Calendar size={18} />, description: 'Planlanmış toplantılar' },
    { id: 'today' as const, label: 'Bugün', icon: <Clock size={18} />, description: 'Bugünkü toplantılar' },
    { id: 'history' as const, label: 'Geçmiş', icon: <History size={18} />, description: 'Tamamlanan toplantılar' },
    { id: 'rooms' as const, label: 'Toplantı Odaları', icon: <MapPin size={18} />, description: 'Oda durumu ve rezervasyon' },
    { id: 'calendar' as const, label: 'Takvim', icon: <CalendarDays size={18} />, description: 'Aylık takvim görünümü' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bu Hafta</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Toplantı</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bugün</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">3</h3>
          <p className="text-sm text-neutral-600">Toplantı</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Katılımcı</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">24</h3>
          <p className="text-sm text-neutral-600">Kişi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <MapPin className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Odalar</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">2/4</h3>
          <p className="text-sm text-neutral-600">Müsait</p>
        </div>
      </div>

      {/* Tab Navigation + Content */}
      <div className="flex gap-6">
        {/* Vertical Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p
                  className={`text-xs ml-7 ${
                    activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            ))}
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-2xl hover:bg-neutral-800 transition-colors">
            <Plus size={20} />
            Yeni Toplantı
          </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'upcoming' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Yaklaşan Toplantılar</h2>
              <div className="space-y-3">
                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">Haftalık Değerlendirme</h3>
                      <p className="text-sm text-neutral-600">Yarın 14:00 - 15:30 (1.5 saat)</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">Zoom</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                    <Users size={14} />
                    <span>8 Katılımcı</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Detayları Gör
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">Müşteri Toplantısı - ABC Ajans</h3>
                      <p className="text-sm text-neutral-600">Perşembe 10:00 - 11:00 (1 saat)</p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-lg">Teams</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                    <Users size={14} />
                    <span>5 Katılımcı</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Detayları Gör
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">Proje Sunumu</h3>
                      <p className="text-sm text-neutral-600">Cuma 16:00 - 17:30 (1.5 saat)</p>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-lg">Oda A</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                    <Users size={14} />
                    <span>12 Katılımcı</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Detayları Gör
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'today' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Bugünkü Toplantılar</h2>
              <div className="space-y-3">
                <div className="border border-neutral-200 rounded-xl p-4 bg-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">Sabah Standup</h3>
                      <p className="text-sm text-neutral-600">09:30 - 10:00 (30 dk)</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-lg">Devam Ediyor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                    <Users size={14} />
                    <span>6 Katılımcı</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                    <Video size={16} />
                    Katıl
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">Bütçe Görüşmesi</h3>
                      <p className="text-sm text-neutral-600">14:00 - 15:00 (1 saat)</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">Zoom</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                    <Users size={14} />
                    <span>4 Katılımcı</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Hatırlat
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">Ekip Retrospektif</h3>
                      <p className="text-sm text-neutral-600">17:00 - 18:00 (1 saat)</p>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-lg">Oda B</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                    <Users size={14} />
                    <span>10 Katılımcı</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Hatırlat
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Toplantı Geçmişi</h2>
              <div className="space-y-3">
                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-900">Aylık Planlama</h3>
                      <p className="text-sm text-neutral-600">21 Ekim 2025 - 1 saat 30 dk</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Tamamlandı</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">15 katılımcı • Zoom</p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-900">Ekipman Eğitimi</h3>
                      <p className="text-sm text-neutral-600">15 Ekim 2025 - 45 dk</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Tamamlandı</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">8 katılımcı • Oda A</p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-900">Müşteri Geri Bildirimi</h3>
                      <p className="text-sm text-neutral-600">12 Ekim 2025 - 1 saat</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Tamamlandı</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">6 katılımcı • Teams</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Toplantı Odaları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">Oda A</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-lg">Müsait</span>
                  </div>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>• Kapasite: 12 kişi</p>
                    <p>• Ekran, Projeksiyon</p>
                    <p>• Beyaz Tahta</p>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Rezervasyon Yap
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">Oda B</h3>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-lg">Dolu</span>
                  </div>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>• Kapasite: 8 kişi</p>
                    <p>• TV Ekran</p>
                    <p>• Video Konferans</p>
                  </div>
                  <div className="mt-4 text-xs text-neutral-500">
                    Sonraki müsait: 15:00
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">Oda C</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-lg">Müsait</span>
                  </div>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>• Kapasite: 20 kişi</p>
                    <p>• Projeksiyon, Ses Sistemi</p>
                    <p>• Klima</p>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Rezervasyon Yap
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">Online Oda</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">Sanal</span>
                  </div>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>• Zoom, Teams, Meet</p>
                    <p>• Kayıt Özelliği</p>
                    <p>• Ekran Paylaşımı</p>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                    Link Oluştur
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Takvim Görünümü</h2>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                    ← Önceki Ay
                  </button>
                  <span className="px-4 py-2 font-medium text-neutral-900">Ekim 2025</span>
                  <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                    Sonraki Ay →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Header - Days */}
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                  <div key={day} className="text-center font-semibold text-neutral-600 text-sm py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 1; // Starting from day 1
                  const isToday = dayNum === 14;
                  const hasMeeting = [5, 8, 14, 19, 22, 28].includes(dayNum);
                  
                  return (
                    <div
                      key={i}
                      className={`
                        aspect-square border border-neutral-200 rounded-lg p-2 text-sm
                        ${dayNum < 1 || dayNum > 31 ? 'bg-neutral-50 text-neutral-300' : 'bg-white hover:bg-neutral-50 cursor-pointer'}
                        ${isToday ? 'border-2 border-neutral-900 bg-neutral-50' : ''}
                        ${hasMeeting ? 'border-blue-500' : ''}
                      `}
                    >
                      {dayNum > 0 && dayNum <= 31 && (
                        <>
                          <div className={`font-semibold ${isToday ? 'text-neutral-900' : 'text-neutral-600'}`}>
                            {dayNum}
                          </div>
                          {hasMeeting && (
                            <div className="mt-1 space-y-1">
                              <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                                Toplantı
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-900 rounded"></div>
                  <span>Bugün</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-blue-500 bg-blue-50 rounded"></div>
                  <span>Toplantı Var</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}