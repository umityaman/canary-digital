import { useState } from 'react'
import { 
  GraduationCap, Search, Plus, Calendar, Users,
  Clock, Award, CheckCircle, Target, User
} from 'lucide-react'

interface Training {
  id: number
  title: string
  instructor: string
  category: string
  startDate: string
  endDate: string
  duration: string
  capacity: number
  enrolled: number
  status: 'upcoming' | 'ongoing' | 'completed'
  description: string
}

export default function TrainingManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const trainings: Training[] = [
    {
      id: 1,
      title: 'React ve TypeScript ile Modern Web Geliştirme',
      instructor: 'Ahmet Yılmaz',
      category: 'Yazılım',
      startDate: '01 Kasım 2024',
      endDate: '15 Kasım 2024',
      duration: '40 saat',
      capacity: 20,
      enrolled: 18,
      status: 'upcoming',
      description: 'React, TypeScript ve modern web teknolojileri eğitimi'
    },
    {
      id: 2,
      title: 'Agile Proje Yönetimi',
      instructor: 'Ayşe Kaya',
      category: 'Yönetim',
      startDate: '20 Ekim 2024',
      endDate: '30 Ekim 2024',
      duration: '24 saat',
      capacity: 15,
      enrolled: 15,
      status: 'ongoing',
      description: 'Agile ve Scrum metodolojileri ile proje yönetimi'
    },
    {
      id: 3,
      title: 'UI/UX Tasarım İlkeleri',
      instructor: 'Mehmet Demir',
      category: 'Tasarım',
      startDate: '01 Ekim 2024',
      endDate: '15 Ekim 2024',
      duration: '32 saat',
      capacity: 12,
      enrolled: 12,
      status: 'completed',
      description: 'Kullanıcı deneyimi ve arayüz tasarımı'
    },
    {
      id: 4,
      title: 'Dijital Pazarlama Stratejileri',
      instructor: 'Zeynep Şahin',
      category: 'Pazarlama',
      startDate: '05 Kasım 2024',
      endDate: '20 Kasım 2024',
      duration: '36 saat',
      capacity: 25,
      enrolled: 22,
      status: 'upcoming',
      description: 'SEO, SEM ve sosyal medya pazarlama'
    },
    {
      id: 5,
      title: 'DevOps ve CI/CD',
      instructor: 'Can Öztürk',
      category: 'Yazılım',
      startDate: '15 Ekim 2024',
      endDate: '30 Ekim 2024',
      duration: '40 saat',
      capacity: 10,
      enrolled: 10,
      status: 'ongoing',
      description: 'Docker, Kubernetes ve otomatik deployment'
    },
    {
      id: 6,
      title: 'İletişim Becerileri',
      instructor: 'Elif Yıldırım',
      category: 'Kişisel Gelişim',
      startDate: '05 Eylül 2024',
      endDate: '15 Eylül 2024',
      duration: '20 saat',
      capacity: 30,
      enrolled: 28,
      status: 'completed',
      description: 'Etkili iletişim ve sunum teknikleri'
    }
  ]

  const trainingStats = [
    { label: 'Aktif Eğitim', value: 12, color: 'bg-blue-100 text-blue-700' },
    { label: 'Toplam Katılımcı', value: 186, color: 'bg-green-100 text-green-700' },
    { label: 'Tamamlanan', value: 42, color: 'bg-purple-100 text-purple-700' },
    { label: 'Sertifika', value: 156, color: 'bg-orange-100 text-orange-700' }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-green-100 text-green-700',
      completed: 'bg-neutral-100 text-neutral-700'
    }
    const labels = {
      upcoming: 'Yaklaşan',
      ongoing: 'Devam Ediyor',
      completed: 'Tamamlandı'
    }
    const icons = {
      upcoming: <Calendar size={14} />,
      ongoing: <Clock size={14} />,
      completed: <CheckCircle size={14} />
    }
    return { 
      class: badges[status as keyof typeof badges], 
      label: labels[status as keyof typeof labels],
      icon: icons[status as keyof typeof icons]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Eğitim Yönetimi</h2>
        <p className="text-neutral-600">
          Eğitim programlarını planlayın, yönetin ve katılımcıları takip edin.
        </p>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trainingStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-neutral-200">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-neutral-700" size={20} />
              </div>
              <span className={`px-2 py-1 ${stat.color} text-xs font-medium rounded-lg`}>
                {stat.value}
              </span>
            </div>
            <h3 className="font-medium text-neutral-900 text-sm">{stat.label}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Eğitim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">Tüm Eğitimler</option>
            <option value="upcoming">Yaklaşan</option>
            <option value="ongoing">Devam Eden</option>
            <option value="completed">Tamamlanan</option>
          </select>
        </div>

        {/* Add Button */}
        <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus size={18} />
          <span>Yeni Eğitim</span>
        </button>
      </div>

      {/* Training Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => {
          const statusBadge = getStatusBadge(training.status)
          const enrollmentPercentage = (training.enrolled / training.capacity) * 100

          return (
            <div key={training.id} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-neutral-700" size={24} />
                  </div>
                  <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg inline-flex items-center gap-1`}>
                    {statusBadge.icon}
                    {statusBadge.label}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">{training.title}</h3>
                <p className="text-sm text-neutral-600">{training.description}</p>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg">
                  {training.category}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-neutral-400" />
                  <span>Eğitmen: {training.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-neutral-400" />
                  <span>{training.startDate} - {training.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-neutral-400" />
                  <span>Süre: {training.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-neutral-400" />
                  <span>Kapasite: {training.enrolled}/{training.capacity}</span>
                </div>
              </div>

              {/* Enrollment Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                  <span>Doluluk Oranı</span>
                  <span className="font-medium">{enrollmentPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      enrollmentPercentage === 100 ? 'bg-red-500' : 
                      enrollmentPercentage >= 80 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${enrollmentPercentage}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">
                  <Target size={16} />
                  <span>Detaylar</span>
                </button>
                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
                  <Award size={16} />
                  <span>Katılımcılar</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
