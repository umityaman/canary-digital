import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Users,
  Clock,
  Award,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Training {
  id: number;
  title: string;
  description: string;
  type: 'online' | 'classroom' | 'workshop' | 'certification';
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  duration: string;
  capacity: number;
  enrolled: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  thumbnail: string;
}

interface TrainingParticipant {
  id: number;
  employeeId: string;
  employeeName: string;
  avatar: string;
  trainingId: number;
  enrollDate: string;
  completionStatus: 'enrolled' | 'inprogress' | 'completed' | 'failed';
  score?: number;
  certificateUrl?: string;
}

const TrainingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trainings' | 'participants'>('trainings');

  const trainings: Training[] = [
    {
      id: 1,
      title: 'Modern Liderlik Teknikleri',
      description: 'Çağdaş liderlik yaklaşımları ve ekip yönetimi becerileri.',
      type: 'classroom',
      category: 'Liderlik',
      instructor: 'Dr. Mehmet Yılmaz',
      startDate: '2024-11-01',
      endDate: '2024-11-03',
      duration: '3 gün',
      capacity: 20,
      enrolled: 15,
      status: 'upcoming',
      thumbnail: '🎯',
    },
    {
      id: 2,
      title: 'React & TypeScript İleri Seviye',
      description: 'Modern web uygulamaları geliştirme teknikleri ve best practices.',
      type: 'online',
      category: 'Yazılım',
      instructor: 'Ahmet Kaya',
      startDate: '2024-10-25',
      endDate: '2024-11-25',
      duration: '4 hafta',
      capacity: 30,
      enrolled: 28,
      status: 'ongoing',
      thumbnail: '💻',
    },
    {
      id: 3,
      title: 'İletişim Becerileri Geliştirme',
      description: 'Etkili iletişim, sunum ve müzakere teknikleri.',
      type: 'workshop',
      category: 'Soft Skills',
      instructor: 'Ayşe Demir',
      startDate: '2024-10-15',
      endDate: '2024-10-16',
      duration: '2 gün',
      capacity: 25,
      enrolled: 25,
      status: 'completed',
      thumbnail: '🗣️',
    },
    {
      id: 4,
      title: 'AWS Cloud Practitioner Sertifikası',
      description: 'AWS bulut hizmetleri temel bilgileri ve sertifikasyon hazırlığı.',
      type: 'certification',
      category: 'IT & Cloud',
      instructor: 'Can Öztürk',
      startDate: '2024-11-10',
      endDate: '2024-12-10',
      duration: '1 ay',
      capacity: 15,
      enrolled: 12,
      status: 'upcoming',
      thumbnail: '☁️',
    },
  ];

  const participants: TrainingParticipant[] = [
    {
      id: 1,
      employeeId: 'EMP-2025-001',
      employeeName: 'Ahmet Yılmaz',
      avatar: '👨‍💻',
      trainingId: 2,
      enrollDate: '2024-10-20',
      completionStatus: 'inprogress',
    },
    {
      id: 2,
      employeeId: 'EMP-2025-002',
      employeeName: 'Ayşe Kaya',
      avatar: '👩‍💼',
      trainingId: 3,
      enrollDate: '2024-10-10',
      completionStatus: 'completed',
      score: 95,
      certificateUrl: 'cert_ayse_kaya.pdf',
    },
    {
      id: 3,
      employeeId: 'EMP-2025-005',
      employeeName: 'Can Yıldız',
      avatar: '👨‍💻',
      trainingId: 2,
      enrollDate: '2024-10-22',
      completionStatus: 'inprogress',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video size={16} />;
      case 'classroom':
        return <Users size={16} />;
      case 'workshop':
        return <BookOpen size={16} />;
      case 'certification':
        return <Award size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'online':
        return 'Online';
      case 'classroom':
        return 'Sınıf İçi';
      case 'workshop':
        return 'Workshop';
      case 'certification':
        return 'Sertifika';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Yaklaşan</span>;
      case 'ongoing':
        return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Devam Ediyor</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded-full">Tamamlandı</span>;
    }
  };

  const getCompletionBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Kayıtlı</span>;
      case 'inprogress':
        return <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Devam Ediyor</span>;
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle size={12} />
            Tamamlandı
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <XCircle size={12} />
            Başarısız
          </span>
        );
    }
  };

  const stats = [
    { label: 'Toplam Eğitim', value: trainings.length, color: 'bg-blue-50 text-blue-600' },
    { label: 'Devam Eden', value: trainings.filter((t) => t.status === 'ongoing').length, color: 'bg-green-50 text-green-600' },
    { label: 'Toplam Katılımcı', value: participants.length, color: 'bg-purple-50 text-purple-600' },
    { label: 'Tamamlanan', value: participants.filter((p) => p.completionStatus === 'completed').length, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-neutral-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('trainings')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'trainings' ? 'bg-blue-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Eğitimler
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'participants' ? 'bg-blue-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Katılımcılar
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus size={18} />
            Yeni Eğitim
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'trainings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trainings.map((training) => (
            <div key={training.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all">
              {/* Header */}
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                      {training.thumbnail}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 mb-1">{training.title}</h3>
                      <p className="text-sm text-neutral-600">{training.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full">
                    {getTypeIcon(training.type)}
                    {getTypeLabel(training.type)}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {training.category}
                  </span>
                  {getStatusBadge(training.status)}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Users size={16} className="text-neutral-500" />
                  <span>Eğitmen: {training.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Calendar size={16} className="text-neutral-500" />
                  <span>
                    {new Date(training.startDate).toLocaleDateString('tr-TR')} -{' '}
                    {new Date(training.endDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Clock size={16} className="text-neutral-500" />
                  <span>Süre: {training.duration}</span>
                </div>

                {/* Capacity */}
                <div className="pt-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600">Kayıtlı Katılımcı</span>
                    <span className="font-medium text-neutral-900">
                      {training.enrolled} / {training.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                      style={{ width: `${(training.enrolled / training.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-100 p-4 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                  <FileText size={16} />
                  Detaylar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Users size={16} />
                  Katılımcılar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Çalışan</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Eğitim</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Kayıt Tarihi</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Durum</th>
                <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">Puan</th>
                <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {participants.map((participant) => {
                const training = trainings.find((t) => t.id === participant.trainingId);
                return (
                  <tr key={participant.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                          {participant.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{participant.employeeName}</p>
                          <p className="text-xs text-neutral-600">{participant.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-neutral-900">{training?.title}</p>
                      <p className="text-xs text-neutral-600">{training?.category}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-700">
                        {new Date(participant.enrollDate).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getCompletionBadge(participant.completionStatus)}</td>
                    <td className="py-4 px-6 text-right">
                      {participant.score ? (
                        <span className="text-sm font-bold text-green-600">{participant.score}</span>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {participant.certificateUrl && (
                          <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <Award size={14} />
                            Sertifika
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement;
