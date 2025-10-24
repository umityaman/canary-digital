import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  Award,
  Star,
  Calendar,
  User,
  BarChart,
  CheckCircle,
} from 'lucide-react';

interface Performance {
  id: number;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  position: string;
  period: string;
  overallScore: number;
  technical: number;
  communication: number;
  teamwork: number;
  leadership: number;
  goals: {
    total: number;
    completed: number;
  };
  status: 'pending' | 'completed' | 'inreview';
}

const PerformanceManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-Q4');

  const performances: Performance[] = [
    {
      id: 1,
      employeeId: 'EMP-2025-001',
      employeeName: 'Ahmet Yılmaz',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      position: 'Senior Developer',
      period: '2024-Q4',
      overallScore: 4.5,
      technical: 5.0,
      communication: 4.2,
      teamwork: 4.5,
      leadership: 4.3,
      goals: {
        total: 8,
        completed: 7,
      },
      status: 'completed',
    },
    {
      id: 2,
      employeeId: 'EMP-2025-002',
      employeeName: 'Ayşe Kaya',
      employeeAvatar: '👩‍💼',
      department: 'Prodüksiyon',
      position: 'Proje Yöneticisi',
      period: '2024-Q4',
      overallScore: 4.7,
      technical: 4.5,
      communication: 4.8,
      teamwork: 4.9,
      leadership: 4.6,
      goals: {
        total: 10,
        completed: 9,
      },
      status: 'completed',
    },
    {
      id: 3,
      employeeId: 'EMP-2025-003',
      employeeName: 'Mehmet Demir',
      employeeAvatar: '👨‍💼',
      department: 'Yazılım',
      position: 'Yazılım Müdürü',
      period: '2024-Q4',
      overallScore: 4.8,
      technical: 4.7,
      communication: 4.8,
      teamwork: 4.9,
      leadership: 4.9,
      goals: {
        total: 12,
        completed: 11,
      },
      status: 'completed',
    },
    {
      id: 4,
      employeeId: 'EMP-2025-005',
      employeeName: 'Can Yıldız',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      position: 'Junior Developer',
      period: '2024-Q4',
      overallScore: 4.0,
      technical: 4.2,
      communication: 3.8,
      teamwork: 4.0,
      leadership: 3.9,
      goals: {
        total: 6,
        completed: 5,
      },
      status: 'inreview',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Bekliyor</span>;
      case 'inreview':
        return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">İncelemede</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Tamamlandı</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const avgScore = performances.reduce((sum, p) => sum + p.overallScore, 0) / performances.length;
  const highPerformers = performances.filter((p) => p.overallScore >= 4.5).length;
  const totalGoals = performances.reduce((sum, p) => sum + p.goals.total, 0);
  const completedGoals = performances.reduce((sum, p) => sum + p.goals.completed, 0);

  const stats = [
    {
      label: 'Ortalama Puan',
      value: avgScore.toFixed(1),
      icon: <Star size={20} />,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Yüksek Performans',
      value: highPerformers,
      icon: <Award size={20} />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Hedef Tamamlama',
      value: `${((completedGoals / totalGoals) * 100).toFixed(0)}%`,
      icon: <Target size={20} />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Toplam Değerlendirme',
      value: performances.length,
      icon: <BarChart size={20} />,
      color: 'bg-purple-50 text-purple-600',
    },
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

      {/* Period Selector */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-neutral-600" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
            >
              <option value="2024-Q4">Q4 2024 (Ekim-Kasım-Aralık)</option>
              <option value="2024-Q3">Q3 2024 (Temmuz-Ağustos-Eylül)</option>
              <option value="2024-Q2">Q2 2024 (Nisan-Mayıs-Haziran)</option>
              <option value="2024-Q1">Q1 2024 (Ocak-Şubat-Mart)</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Target size={18} />
            Yeni Değerlendirme
          </button>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {performances.map((perf) => (
          <div key={perf.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
                    {perf.employeeAvatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{perf.employeeName}</h3>
                    <p className="text-sm text-white/80">{perf.position}</p>
                    <p className="text-xs text-white/60">{perf.employeeId} • {perf.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{perf.overallScore}</div>
                  <div className="text-xs text-white/80">Genel Puan</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Skill Scores */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Yetkinlik Puanları</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">Teknik</span>
                    <span className={`text-lg font-bold ${getScoreColor(perf.technical)}`}>{perf.technical}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">İletişim</span>
                    <span className={`text-lg font-bold ${getScoreColor(perf.communication)}`}>{perf.communication}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">Takım Çalışması</span>
                    <span className={`text-lg font-bold ${getScoreColor(perf.teamwork)}`}>{perf.teamwork}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">Liderlik</span>
                    <span className={`text-lg font-bold ${getScoreColor(perf.leadership)}`}>{perf.leadership}</span>
                  </div>
                </div>
              </div>

              {/* Goals Progress */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Hedef Durumu</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">
                      {perf.goals.completed} / {perf.goals.total} Hedef Tamamlandı
                    </span>
                    <span className={`font-bold ${getScoreColor((perf.goals.completed / perf.goals.total) * 5)}`}>
                      %{((perf.goals.completed / perf.goals.total) * 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                      style={{ width: `${(perf.goals.completed / perf.goals.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <span className="text-sm text-neutral-600">Durum</span>
                {getStatusBadge(perf.status)}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 p-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                <User size={16} />
                Detay
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <TrendingUp size={16} />
                Raporla
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceManagement;
