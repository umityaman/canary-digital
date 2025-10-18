import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  Users,
  Film,
  Sun,
  Moon,
  Sunset,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface ShootingDay {
  id: number;
  date: string;
  sceneNumber: string;
  location: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  duration: string;
  crew: number;
  cast: number;
  equipment: string[];
  status: 'planned' | 'in-progress' | 'completed';
  notes: string;
}

const SchedulePlanning: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  const shootingDays: ShootingDay[] = [
    {
      id: 1,
      date: '20 Eki 2024',
      sceneNumber: 'Sahne 1-5',
      location: 'Taksim Meydanı - İstanbul',
      timeOfDay: 'morning',
      duration: '8 saat',
      crew: 12,
      cast: 4,
      equipment: ['ARRI Alexa', 'Crane', 'Lighting Kit'],
      status: 'planned',
      notes: 'Hava durumu kontrol edilmeli',
    },
    {
      id: 2,
      date: '21 Eki 2024',
      sceneNumber: 'Sahne 6-12',
      location: 'Stüdyo A - Maslak',
      timeOfDay: 'afternoon',
      duration: '10 saat',
      crew: 15,
      cast: 6,
      equipment: ['Sony FX6', 'Green Screen', 'Audio Kit'],
      status: 'in-progress',
      notes: 'Catering saat 13:00',
    },
    {
      id: 3,
      date: '22 Eki 2024',
      sceneNumber: 'Sahne 13-18',
      location: 'Boğaz Sahili - Bebek',
      timeOfDay: 'evening',
      duration: '6 saat',
      crew: 10,
      cast: 3,
      equipment: ['Canon C70', 'Drone', 'Stabilizer'],
      status: 'completed',
      notes: 'Golden hour çekimi',
    },
  ];

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning':
        return <Sun size={16} className="text-neutral-700" />;
      case 'afternoon':
        return <Sunset size={16} className="text-neutral-700" />;
      case 'evening':
        return <Sunset size={16} className="text-neutral-700" />;
      case 'night':
        return <Moon size={16} className="text-neutral-700" />;
      default:
        return <Clock size={16} className="text-neutral-700" />;
    }
  };

  const getTimeText = (time: string) => {
    switch (time) {
      case 'morning':
        return 'Sabah (06:00-12:00)';
      case 'afternoon':
        return 'Öğleden Sonra (12:00-17:00)';
      case 'evening':
        return 'Akşam (17:00-21:00)';
      case 'night':
        return 'Gece (21:00-06:00)';
      default:
        return time;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-neutral-200 text-neutral-700';
      case 'in-progress':
        return 'bg-neutral-700 text-white';
      case 'completed':
        return 'bg-neutral-900 text-white';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planlandı';
      case 'in-progress':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <CalendarIcon size={32} className="text-neutral-900" />
              Çekim Planlama
            </h1>
            <p className="text-neutral-600 mt-1">
              Call sheet, sahne planı ve lokasyon yönetimi
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium">
              <Download size={18} />
              Call Sheet İndir
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
              <Plus size={20} />
              Yeni Çekim Günü
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Çekim Günü</span>
              <CalendarIcon size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">12</div>
            <div className="text-xs text-neutral-600 mt-1">3 tamamlandı</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Sahne</span>
              <Film size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">45</div>
            <div className="text-xs text-neutral-600 mt-1">18 çekildi</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Ekip Kapasitesi</span>
              <Users size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">24</div>
            <div className="text-xs text-neutral-600 mt-1">Ortalama 15 kişi/gün</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Lokasyon</span>
              <MapPin size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">8</div>
            <div className="text-xs text-neutral-600 mt-1">4 stüdyo, 4 dış</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'list'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Liste Görünümü
        </button>
        <button
          onClick={() => setActiveView('calendar')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'calendar'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Takvim Görünümü
        </button>
      </div>

      {/* List View */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {shootingDays.map((day) => (
            <div
              key={day.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon size={24} />
                      <h3 className="text-2xl font-bold">{day.date}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          day.status
                        )}`}
                      >
                        {getStatusText(day.status)}
                      </span>
                    </div>
                    <p className="text-neutral-200 text-lg font-medium">{day.sceneNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <MapPin size={20} className="text-neutral-700" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">Lokasyon</div>
                      <div className="text-sm font-medium text-neutral-900">{day.location}</div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">{getTimeIcon(day.timeOfDay)}</div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">Zaman Dilimi</div>
                      <div className="text-sm font-medium text-neutral-900">
                        {getTimeText(day.timeOfDay)}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <Clock size={20} className="text-neutral-700" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">Süre</div>
                      <div className="text-sm font-medium text-neutral-900">{day.duration}</div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <Users size={20} className="text-neutral-700" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">Ekip</div>
                      <div className="text-sm font-medium text-neutral-900">
                        {day.crew} Crew, {day.cast} Cast
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="mb-4">
                  <div className="text-xs text-neutral-600 mb-2">Ekipman:</div>
                  <div className="flex flex-wrap gap-2">
                    {day.equipment.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {day.notes && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-600 mb-1">Notlar:</div>
                    <div className="text-sm text-neutral-900">{day.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="text-center py-12">
            <CalendarIcon size={64} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-600 text-lg">Takvim görünümü yakında eklenecek</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePlanning;
