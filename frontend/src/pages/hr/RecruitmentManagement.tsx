import { useState } from 'react'
import { 
  UserPlus, Search, Plus, Mail,
  MapPin, Calendar, Star, MoreVertical,
  Briefcase
} from 'lucide-react'

interface Candidate {
  id: number
  name: string
  position: string
  email: string
  phone: string
  location: string
  appliedDate: string
  status: 'new' | 'screening' | 'interview' | 'offer' | 'rejected'
  experience: string
  rating: number
  avatar: string
  skills: string[]
}

export default function RecruitmentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const candidates: Candidate[] = [
    {
      id: 1,
      name: 'Ali Yılmaz',
      position: 'Frontend Developer',
      email: 'ali.yilmaz@email.com',
      phone: '+90 532 111 2233',
      location: 'İstanbul',
      appliedDate: '15 Ekim 2024',
      status: 'interview',
      experience: '3 yıl',
      rating: 4.5,
      avatar: '👨‍💻',
      skills: ['React', 'TypeScript', 'Tailwind']
    },
    {
      id: 2,
      name: 'Fatma Demir',
      position: 'UI/UX Designer',
      email: 'fatma.demir@email.com',
      phone: '+90 533 222 3344',
      location: 'Ankara',
      appliedDate: '18 Ekim 2024',
      status: 'screening',
      experience: '5 yıl',
      rating: 4.8,
      avatar: '👩‍🎨',
      skills: ['Figma', 'Adobe XD', 'Sketch']
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      position: 'Backend Developer',
      email: 'mehmet.kaya@email.com',
      phone: '+90 534 333 4455',
      location: 'İzmir',
      appliedDate: '20 Ekim 2024',
      status: 'new',
      experience: '2 yıl',
      rating: 4.0,
      avatar: '👨‍💻',
      skills: ['Node.js', 'Python', 'PostgreSQL']
    },
    {
      id: 4,
      name: 'Ayşe Şahin',
      position: 'Product Manager',
      email: 'ayse.sahin@email.com',
      phone: '+90 535 444 5566',
      location: 'İstanbul',
      appliedDate: '22 Ekim 2024',
      status: 'offer',
      experience: '7 yıl',
      rating: 4.9,
      avatar: '👩‍💼',
      skills: ['Agile', 'Scrum', 'Jira']
    },
    {
      id: 5,
      name: 'Can Öztürk',
      position: 'DevOps Engineer',
      email: 'can.ozturk@email.com',
      phone: '+90 536 555 6677',
      location: 'Bursa',
      appliedDate: '25 Ekim 2024',
      status: 'rejected',
      experience: '4 yıl',
      rating: 3.5,
      avatar: '👨‍💻',
      skills: ['Docker', 'Kubernetes', 'AWS']
    }
  ]

  const openPositions = [
    { id: 1, title: 'Frontend Developer', department: 'Yazılım', count: 2 },
    { id: 2, title: 'Backend Developer', department: 'Yazılım', count: 1 },
    { id: 3, title: 'UI/UX Designer', department: 'Tasarım', count: 1 },
    { id: 4, title: 'Product Manager', department: 'Ürün', count: 1 },
    { id: 5, title: 'DevOps Engineer', department: 'Yazılım', count: 1 }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      new: 'bg-blue-100 text-blue-700',
      screening: 'bg-yellow-100 text-yellow-700',
      interview: 'bg-purple-100 text-purple-700',
      offer: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    const labels = {
      new: 'Yeni',
      screening: 'İnceleniyor',
      interview: 'Mülakat',
      offer: 'Teklif',
      rejected: 'Reddedildi'
    }
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İşe Alım Yönetimi</h2>
        <p className="text-neutral-600">
          Açık pozisyonları ve başvuruları yönetin, adayları takip edin.
        </p>
      </div>

      {/* Open Positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {openPositions.map((position) => (
          <div key={position.id} className="bg-white rounded-2xl p-4 border border-neutral-200">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                <Briefcase className="text-neutral-700" size={20} />
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                {position.count} Pozisyon
              </span>
            </div>
            <h3 className="font-medium text-neutral-900 text-sm mb-1">{position.title}</h3>
            <p className="text-xs text-neutral-600">{position.department}</p>
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
              placeholder="Aday ara..."
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
            <option value="new">Yeni</option>
            <option value="screening">İnceleniyor</option>
            <option value="interview">Mülakat</option>
            <option value="offer">Teklif</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>

        {/* Add Button */}
        <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus size={18} />
          <span>Yeni İlan</span>
        </button>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => {
          const statusBadge = getStatusBadge(candidate.status)
          return (
            <div key={candidate.id} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl">
                    {candidate.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{candidate.name}</h3>
                    <p className="text-sm text-neutral-600">{candidate.position}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  <MoreVertical size={18} className="text-neutral-400" />
                </button>
              </div>

              {/* Status and Rating */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg`}>
                  {statusBadge.label}
                </span>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-neutral-900">{candidate.rating}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-neutral-400" />
                  <span>{candidate.experience} deneyim</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-neutral-400" />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-neutral-400" />
                  <span>{candidate.appliedDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">
                  <Mail size={16} />
                  <span>İletişim</span>
                </button>
                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
                  <UserPlus size={16} />
                  <span>Detay</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
