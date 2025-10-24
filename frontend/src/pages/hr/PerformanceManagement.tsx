import { useState } from 'react'
import { 
  TrendingUp, Search, Plus, Star, Target, 
  Award, Calendar, User, CheckCircle, Clock
} from 'lucide-react'

interface PerformanceReview {
  id: number
  employeeName: string
  employeeAvatar: string
  department: string
  reviewPeriod: string
  overallScore: number
  categories: {
    name: string
    score: number
  }[]
  status: 'completed' | 'pending' | 'scheduled'
  reviewDate: string
  reviewer: string
}

export default function PerformanceManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const performanceReviews: PerformanceReview[] = [
    {
      id: 1,
      employeeName: 'Ahmet Yılmaz',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      reviewPeriod: 'Q3 2024',
      overallScore: 4.5,
      categories: [
        { name: 'Teknik Yetenek', score: 4.8 },
        { name: 'İletişim', score: 4.2 },
        { name: 'Takım Çalışması', score: 4.5 }
      ],
      status: 'completed',
      reviewDate: '15 Ekim 2024',
      reviewer: 'Mehmet Yönetici'
    },
    {
      id: 2,
      employeeName: 'Ayşe Kaya',
      employeeAvatar: '👩‍💼',
      department: 'Proje',
      reviewPeriod: 'Q3 2024',
      overallScore: 4.8,
      categories: [
        { name: 'Liderlik', score: 4.9 },
        { name: 'Planlama', score: 4.7 },
        { name: 'İletişim', score: 4.8 }
      ],
      status: 'completed',
      reviewDate: '16 Ekim 2024',
      reviewer: 'Ahmet Direktör'
    },
    {
      id: 3,
      employeeName: 'Mehmet Demir',
      employeeAvatar: '👨‍🎨',
      department: 'Tasarım',
      reviewPeriod: 'Q3 2024',
      overallScore: 4.3,
      categories: [
        { name: 'Yaratıcılık', score: 4.6 },
        { name: 'Teknik', score: 4.2 },
        { name: 'İletişim', score: 4.1 }
      ],
      status: 'completed',
      reviewDate: '18 Ekim 2024',
      reviewer: 'Ayşe Müdür'
    },
    {
      id: 4,
      employeeName: 'Zeynep Şahin',
      employeeAvatar: '👩‍💼',
      department: 'Pazarlama',
      reviewPeriod: 'Q3 2024',
      overallScore: 0,
      categories: [],
      status: 'pending',
      reviewDate: '25 Ekim 2024',
      reviewer: 'Can Yönetici'
    },
    {
      id: 5,
      employeeName: 'Can Öztürk',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      reviewPeriod: 'Q3 2024',
      overallScore: 0,
      categories: [],
      status: 'scheduled',
      reviewDate: '30 Ekim 2024',
      reviewer: 'Mehmet Yönetici'
    }
  ]

  const performanceStats = [
    { label: 'Tamamlanan', value: 186, color: 'bg-green-100 text-green-700' },
    { label: 'Bekleyen', value: 42, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Planlanmış', value: 20, color: 'bg-blue-100 text-blue-700' },
    { label: 'Ortalama Puan', value: '4.2/5', color: 'bg-purple-100 text-purple-700' }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      scheduled: 'bg-blue-100 text-blue-700'
    }
    const labels = {
      completed: 'Tamamlandı',
      pending: 'Bekliyor',
      scheduled: 'Planlandı'
    }
    const icons = {
      completed: <CheckCircle size={14} />,
      pending: <Clock size={14} />,
      scheduled: <Calendar size={14} />
    }
    return { 
      class: badges[status as keyof typeof badges], 
      label: labels[status as keyof typeof labels],
      icon: icons[status as keyof typeof icons]
    }
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= Math.floor(score) ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-neutral-900">{score.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Performans Yönetimi</h2>
        <p className="text-neutral-600">
          Çalışan performansını değerlendirin, hedefler belirleyin ve gelişim planları oluşturun.
        </p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-neutral-200">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-neutral-700" size={20} />
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
              placeholder="Çalışan ara..."
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
            <option value="all">Tüm Durumlar</option>
            <option value="completed">Tamamlanan</option>
            <option value="pending">Bekleyen</option>
            <option value="scheduled">Planlanmış</option>
          </select>
        </div>

        {/* Add Button */}
        <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus size={18} />
          <span>Yeni Değerlendirme</span>
        </button>
      </div>

      {/* Performance Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceReviews.map((review) => {
          const statusBadge = getStatusBadge(review.status)
          return (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl">
                    {review.employeeAvatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{review.employeeName}</h3>
                    <p className="text-sm text-neutral-600">{review.department}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg inline-flex items-center gap-1`}>
                  {statusBadge.icon}
                  {statusBadge.label}
                </span>
              </div>

              {/* Overall Score */}
              {review.status === 'completed' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">Genel Puan</span>
                    {renderStars(review.overallScore)}
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all"
                      style={{ width: `${(review.overallScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Categories */}
              {review.status === 'completed' && (
                <div className="space-y-2 mb-4">
                  {review.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{category.name}</span>
                      <span className="font-medium text-neutral-900">{category.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="space-y-2 text-sm text-neutral-600 mb-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-neutral-400" />
                  <span>{review.reviewDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-neutral-400" />
                  <span>Değerlendiren: {review.reviewer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-neutral-400" />
                  <span>Dönem: {review.reviewPeriod}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                {review.status === 'completed' && (
                  <>
                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">
                      <Award size={16} />
                      <span>Detaylar</span>
                    </button>
                    <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
                      <Target size={16} />
                      <span>Hedefler</span>
                    </button>
                  </>
                )}
                {review.status !== 'completed' && (
                  <button className="col-span-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">
                    <Plus size={16} />
                    <span>Değerlendirmeyi Başlat</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
