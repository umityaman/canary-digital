import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  appliedDate: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  rating: number;
  experience: string;
  education: string;
  skills: string[];
  cv: string;
  notes: string;
  avatar: string;
  location: string;
}

const RecruitmentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');

  const candidates: Candidate[] = [
    {
      id: 1,
      name: 'Ali Özkan',
      email: 'ali.ozkan@email.com',
      phone: '+90 532 111 22 33',
      position: 'Senior Developer',
      department: 'Yazılım',
      appliedDate: '2024-10-15',
      status: 'interview',
      rating: 4.5,
      experience: '7 yıl',
      education: 'Yüksek Lisans - Bilgisayar Mühendisliği',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      cv: 'ali_ozkan_cv.pdf',
      notes: 'Çok güçlü teknik bilgi, ekip çalışmasına yatkın.',
      avatar: '👨‍💻',
      location: 'İstanbul',
    },
    {
      id: 2,
      name: 'Zeynep Aydın',
      email: 'zeynep.aydin@email.com',
      phone: '+90 532 222 33 44',
      position: 'UI/UX Designer',
      department: 'Tasarım',
      appliedDate: '2024-10-18',
      status: 'screening',
      rating: 4.2,
      experience: '5 yıl',
      education: 'Lisans - Görsel İletişim Tasarımı',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research'],
      cv: 'zeynep_aydin_cv.pdf',
      notes: 'Portföyü etkileyici, kullanıcı deneyimi odaklı.',
      avatar: '👩‍🎨',
      location: 'Ankara',
    },
    {
      id: 3,
      name: 'Burak Şahin',
      email: 'burak.sahin@email.com',
      phone: '+90 532 333 44 55',
      position: 'Marketing Specialist',
      department: 'Pazarlama',
      appliedDate: '2024-10-20',
      status: 'offer',
      rating: 4.7,
      experience: '4 yıl',
      education: 'Lisans - İşletme',
      skills: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
      cv: 'burak_sahin_cv.pdf',
      notes: 'Dijital pazarlama konusunda uzman, sonuç odaklı.',
      avatar: '👨‍💼',
      location: 'İzmir',
    },
    {
      id: 4,
      name: 'Elif Yıldırım',
      email: 'elif.yildirim@email.com',
      phone: '+90 532 444 55 66',
      position: 'Junior Developer',
      department: 'Yazılım',
      appliedDate: '2024-10-22',
      status: 'applied',
      rating: 3.8,
      experience: '1 yıl',
      education: 'Lisans - Bilgisayar Mühendisliği',
      skills: ['JavaScript', 'React', 'HTML', 'CSS'],
      cv: 'elif_yildirim_cv.pdf',
      notes: 'Yeni mezun, öğrenmeye hevesli.',
      avatar: '👩‍💻',
      location: 'Bursa',
    },
    {
      id: 5,
      name: 'Emre Kara',
      email: 'emre.kara@email.com',
      phone: '+90 532 555 66 77',
      position: 'DevOps Engineer',
      department: 'Yazılım',
      appliedDate: '2024-10-10',
      status: 'hired',
      rating: 4.9,
      experience: '6 yıl',
      education: 'Yüksek Lisans - Yazılım Mühendisliği',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      cv: 'emre_kara_cv.pdf',
      notes: 'Mükemmel teknik bilgi, işe alındı.',
      avatar: '👨‍💻',
      location: 'İstanbul',
    },
  ];

  const positions = ['Senior Developer', 'UI/UX Designer', 'Marketing Specialist', 'Junior Developer', 'DevOps Engineer'];

  const getStatusConfig = (status: string) => {
    const config = {
      applied: { label: 'Başvurdu', color: 'bg-blue-100 text-blue-800', icon: <FileText size={14} /> },
      screening: { label: 'Eleme', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      interview: { label: 'Mülakat', color: 'bg-purple-100 text-purple-800', icon: <Users size={14} /> },
      offer: { label: 'Teklif', color: 'bg-orange-100 text-orange-800', icon: <Star size={14} /> },
      hired: { label: 'İşe Alındı', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
    };
    return config[status as keyof typeof config];
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    const matchesPosition = filterPosition === 'all' || candidate.position === filterPosition;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const stats = [
    { label: 'Toplam Başvuru', value: candidates.length, icon: <FileText size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Eleme Aşaması', value: candidates.filter(c => c.status === 'screening').length, icon: <Clock size={20} />, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Mülakat', value: candidates.filter(c => c.status === 'interview').length, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'İşe Alındı', value: candidates.filter(c => c.status === 'hired').length, icon: <CheckCircle size={20} />, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
            <div className="text-sm text-neutral-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Aday ara (isim, email, pozisyon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tüm Pozisyonlar</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="applied">Başvurdu</option>
            <option value="screening">Eleme</option>
            <option value="interview">Mülakat</option>
            <option value="offer">Teklif</option>
            <option value="hired">İşe Alındı</option>
            <option value="rejected">Reddedildi</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus size={18} />
            Yeni İlan
          </button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCandidates.map((candidate) => {
          const statusConfig = getStatusConfig(candidate.status);
          return (
            <div key={candidate.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all">
              {/* Header */}
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                      {candidate.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900">{candidate.name}</h3>
                      <p className="text-sm text-neutral-600">{candidate.position}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(candidate.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
                          />
                        ))}
                        <span className="text-xs text-neutral-600 ml-1">({candidate.rating})</span>
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail size={14} />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone size={14} />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin size={14} />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Briefcase size={14} />
                    <span>{candidate.experience} tecrübe</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Eğitim</p>
                  <p className="text-sm text-neutral-900">{candidate.education}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Yetenekler</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Notlar</p>
                  <p className="text-sm text-neutral-700">{candidate.notes}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-neutral-500" />
                  <span className="text-neutral-600">
                    Başvuru: {new Date(candidate.appliedDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-100 p-4 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                  <Eye size={16} />
                  Görüntüle
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                  <Download size={16} />
                  CV İndir
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Mail size={16} />
                  İletişim
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecruitmentManagement;
