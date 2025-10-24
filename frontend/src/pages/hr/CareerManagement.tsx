import { useState } from 'react'
import { Award, TrendingUp, Users, Target, Briefcase, ArrowUpCircle, RefreshCw, AlertCircle } from 'lucide-react'

type CompetencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface Employee {
  id: number
  name: string
  position: string
  department: string
  competencyLevel: CompetencyLevel
  nextPosition?: string
  readinessScore: number
}

interface PromotionPlan {
  id: number
  employee: string
  currentPosition: string
  targetPosition: string
  plannedDate: string
  status: 'planned' | 'in-progress' | 'completed'
  readiness: number
}

interface SuccessionPlan {
  id: number
  criticalPosition: string
  currentHolder: string
  successor1: string
  successor2?: string
  riskLevel: 'low' | 'medium' | 'high'
}

export default function CareerManagement() {
  const [activeView, setActiveView] = useState<'competency' | 'promotion' | 'succession'>('competency')

  const employees: Employee[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      position: 'Yazılım Geliştirici',
      department: 'Teknoloji',
      competencyLevel: 'advanced',
      nextPosition: 'Kıdemli Yazılım Geliştirici',
      readinessScore: 85
    },
    {
      id: 2,
      name: 'Ayşe Kaya',
      position: 'İK Uzmanı',
      department: 'İnsan Kaynakları',
      competencyLevel: 'intermediate',
      nextPosition: 'İK Müdürü',
      readinessScore: 65
    },
    {
      id: 3,
      name: 'Mehmet Demir',
      position: 'Satış Temsilcisi',
      department: 'Satış',
      competencyLevel: 'expert',
      nextPosition: 'Satış Müdürü',
      readinessScore: 92
    },
  ]

  const promotionPlans: PromotionPlan[] = [
    {
      id: 1,
      employee: 'Mehmet Demir',
      currentPosition: 'Satış Temsilcisi',
      targetPosition: 'Satış Müdürü',
      plannedDate: 'Q1 2025',
      status: 'in-progress',
      readiness: 92
    },
    {
      id: 2,
      employee: 'Ahmet Yılmaz',
      currentPosition: 'Yazılım Geliştirici',
      targetPosition: 'Kıdemli Yazılım Geliştirici',
      plannedDate: 'Q2 2025',
      status: 'planned',
      readiness: 85
    },
    {
      id: 3,
      employee: 'Fatma Şahin',
      currentPosition: 'Muhasebe Uzmanı',
      targetPosition: 'Muhasebe Müdürü',
      plannedDate: 'Q4 2024',
      status: 'completed',
      readiness: 100
    },
  ]

  const successionPlans: SuccessionPlan[] = [
    {
      id: 1,
      criticalPosition: 'CTO',
      currentHolder: 'Ali Öztürk',
      successor1: 'Ahmet Yılmaz',
      successor2: 'Zeynep Çelik',
      riskLevel: 'low'
    },
    {
      id: 2,
      criticalPosition: 'Satış Müdürü',
      currentHolder: 'Can Aydın',
      successor1: 'Mehmet Demir',
      riskLevel: 'low'
    },
    {
      id: 3,
      criticalPosition: 'İK Müdürü',
      currentHolder: 'Elif Yaman',
      successor1: 'Ayşe Kaya',
      riskLevel: 'medium'
    },
  ]

  const getCompetencyBadge = (level: CompetencyLevel) => {
    const badges = {
      'beginner': { label: 'Başlangıç', class: 'bg-neutral-100 text-neutral-600' },
      'intermediate': { label: 'Orta', class: 'bg-blue-100 text-blue-800' },
      'advanced': { label: 'İleri', class: 'bg-purple-100 text-purple-800' },
      'expert': { label: 'Uzman', class: 'bg-green-100 text-green-800' },
    }
    const badge = badges[level]
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>{badge.label}</span>
  }

  const getPromotionStatusBadge = (status: PromotionPlan['status']) => {
    const badges = {
      'planned': { label: 'Planlandı', class: 'bg-blue-100 text-blue-800' },
      'in-progress': { label: 'Devam Ediyor', class: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Tamamlandı', class: 'bg-green-100 text-green-800' },
    }
    const badge = badges[status]
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>{badge.label}</span>
  }

  const getRiskBadge = (risk: SuccessionPlan['riskLevel']) => {
    const badges = {
      'low': { label: 'Düşük Risk', class: 'bg-green-100 text-green-800' },
      'medium': { label: 'Orta Risk', class: 'bg-yellow-100 text-yellow-800' },
      'high': { label: 'Yüksek Risk', class: 'bg-red-100 text-red-800' },
    }
    const badge = badges[risk]
    return <span className={`px-3 py-1 rounded-lg text-xs font-medium ${badge.class}`}>{badge.label}</span>
  }

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Kariyer Yönetimi</h2>
        <p className="text-neutral-600">
          Çalışan gelişimi, terfi planlaması ve yedekleme stratejileri.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-neutral-600" size={20} />
            <ArrowUpCircle className="text-green-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {promotionPlans.filter(p => p.status === 'in-progress' || p.status === 'planned').length}
          </h3>
          <p className="text-sm text-neutral-600">Aktif Terfi Planı</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-neutral-600" size={20} />
            <Target className="text-blue-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {employees.filter(e => e.readinessScore >= 80).length}
          </h3>
          <p className="text-sm text-neutral-600">Terfi Hazır Çalışan</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="text-neutral-600" size={20} />
            <Briefcase className="text-purple-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {successionPlans.length}
          </h3>
          <p className="text-sm text-neutral-600">Yedekleme Planı</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-neutral-600" size={20} />
            <AlertCircle className="text-orange-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {successionPlans.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium').length}
          </h3>
          <p className="text-sm text-neutral-600">Risk Alanı</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveView('competency')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeView === 'competency'
              ? 'text-neutral-900 border-b-2 border-neutral-900'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Yetkinlik Matrisi
        </button>
        <button
          onClick={() => setActiveView('promotion')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeView === 'promotion'
              ? 'text-neutral-900 border-b-2 border-neutral-900'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Terfi Planları
        </button>
        <button
          onClick={() => setActiveView('succession')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeView === 'succession'
              ? 'text-neutral-900 border-b-2 border-neutral-900'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Yedekleme Planı
        </button>
      </div>

      {/* Competency Matrix */}
      {activeView === 'competency' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Çalışan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Mevcut Pozisyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Departman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Yetkinlik Seviyesi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Hedef Pozisyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Hazırlık Durumu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-neutral-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {emp.position}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {emp.department}
                    </td>
                    <td className="px-6 py-4">
                      {getCompetencyBadge(emp.competencyLevel)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                      {emp.nextPosition || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              emp.readinessScore >= 80 ? 'bg-green-500' : emp.readinessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${emp.readinessScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getReadinessColor(emp.readinessScore)}`}>
                          {emp.readinessScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Promotion Plans */}
      {activeView === 'promotion' && (
        <div className="space-y-4">
          {promotionPlans.map(plan => (
            <div key={plan.id} className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                    <ArrowUpCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{plan.employee}</h3>
                    <p className="text-sm text-neutral-600">{plan.currentPosition} → {plan.targetPosition}</p>
                  </div>
                </div>
                {getPromotionStatusBadge(plan.status)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Planlanan Tarih:</span>
                  <p className="font-medium text-neutral-900">{plan.plannedDate}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Hazırlık Durumu:</span>
                  <p className={`font-medium ${getReadinessColor(plan.readiness)}`}>{plan.readiness}%</p>
                </div>
                <div>
                  <span className="text-neutral-500">Durum:</span>
                  <p className="font-medium text-neutral-900">
                    {plan.status === 'completed' ? 'Tamamlandı' : plan.status === 'in-progress' ? 'Devam Ediyor' : 'Planlandı'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Succession Planning */}
      {activeView === 'succession' && (
        <div className="space-y-4">
          {successionPlans.map(plan => (
            <div key={plan.id} className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                    <RefreshCw className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{plan.criticalPosition}</h3>
                    <p className="text-sm text-neutral-600">Kritik Pozisyon</p>
                  </div>
                </div>
                {getRiskBadge(plan.riskLevel)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Mevcut:</span>
                  <p className="font-medium text-neutral-900">{plan.currentHolder}</p>
                </div>
                <div>
                  <span className="text-neutral-500">1. Yedek:</span>
                  <p className="font-medium text-neutral-900">{plan.successor1}</p>
                </div>
                <div>
                  <span className="text-neutral-500">2. Yedek:</span>
                  <p className="font-medium text-neutral-900">{plan.successor2 || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
