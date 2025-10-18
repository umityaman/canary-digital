import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  Star,
  Award,
  Briefcase,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  type: 'crew' | 'cast';
  rating: number;
  phone: string;
  email: string;
  projects: number;
  dailyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  skills: string[];
}

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crew' | 'cast'>('crew');

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      role: 'Görüntü Yönetmeni',
      type: 'crew',
      rating: 4.8,
      phone: '+90 532 123 45 67',
      email: 'ahmet@example.com',
      projects: 24,
      dailyRate: 5000,
      availability: 'available',
      skills: ['ARRI Alexa', 'Sony FX6', 'Lighting'],
    },
    {
      id: 2,
      name: 'Mehmet Demir',
      role: 'Yönetmen',
      type: 'crew',
      rating: 4.9,
      phone: '+90 532 234 56 78',
      email: 'mehmet@example.com',
      projects: 18,
      dailyRate: 8000,
      availability: 'busy',
      skills: ['Drama', 'Commercial', 'Music Video'],
    },
    {
      id: 3,
      name: 'Ayşe Kaya',
      role: 'Oyuncu',
      type: 'cast',
      rating: 4.7,
      phone: '+90 532 345 67 89',
      email: 'ayse@example.com',
      projects: 32,
      dailyRate: 4500,
      availability: 'available',
      skills: ['Drama', 'Comedy', 'Theater'],
    },
    {
      id: 4,
      name: 'Fatma Öz',
      role: 'Sanat Yönetmeni',
      type: 'crew',
      rating: 4.6,
      phone: '+90 532 456 78 90',
      email: 'fatma@example.com',
      projects: 15,
      dailyRate: 4000,
      availability: 'available',
      skills: ['Set Design', 'Props', 'Styling'],
    },
  ];

  const filteredMembers = teamMembers.filter((member) => member.type === activeTab);

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-neutral-900 text-white';
      case 'busy':
        return 'bg-neutral-500 text-white';
      case 'unavailable':
        return 'bg-neutral-200 text-neutral-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Müsait';
      case 'busy':
        return 'Meşgul';
      case 'unavailable':
        return 'Müsait Değil';
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
              <Users size={32} className="text-neutral-900" />
              Ekip & Oyuncu Yönetimi
            </h1>
            <p className="text-neutral-600 mt-1">
              Teknik kadro ve oyuncu kadrosu yönetimi
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Ekle
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Ekip</span>
              <Users size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">24</div>
            <div className="text-xs text-neutral-600 mt-1">12 Teknik, 12 Oyuncu</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Müsait</span>
              <Award size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">18</div>
            <div className="text-xs text-neutral-600 mt-1">%75 müsaitlik oranı</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Ortalama Puan</span>
              <Star size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">4.7</div>
            <div className="text-xs text-neutral-600 mt-1">250+ değerlendirme</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Günlük Maliyet</span>
              <DollarSign size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺5.2K</div>
            <div className="text-xs text-neutral-600 mt-1">Ortalama ücret</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="İsim, rol veya yetenek ara..."
              className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
            <Filter size={20} className="text-neutral-700" />
            Filtrele
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('crew')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'crew'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Teknik Ekip
        </button>
        <button
          onClick={() => setActiveTab('cast')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'cast'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Oyuncu Kadrosu
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white text-neutral-900 rounded-full flex items-center justify-center text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(
                    member.availability
                  )}`}
                >
                  {getAvailabilityText(member.availability)}
                </span>
              </div>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-neutral-200 text-sm">{member.role}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(member.rating)
                          ? 'fill-neutral-900 text-neutral-900'
                          : 'text-neutral-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-neutral-900">{member.rating}</span>
                <span className="text-xs text-neutral-600">({member.projects} proje)</span>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Phone size={14} />
                  {member.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Mail size={14} />
                  {member.email}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                    <Briefcase size={12} />
                    Projeler
                  </div>
                  <div className="text-lg font-bold text-neutral-900">{member.projects}</div>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                    <DollarSign size={12} />
                    Günlük Ücret
                  </div>
                  <div className="text-lg font-bold text-neutral-900">
                    ₺{member.dailyRate.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="text-xs text-neutral-600 mb-2">Yetenekler:</div>
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium">
                  <Calendar size={16} />
                  Projeye Ata
                </button>
                <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Edit size={16} className="text-neutral-700" />
                </button>
                <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Trash2 size={16} className="text-neutral-700" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
