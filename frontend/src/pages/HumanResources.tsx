import { useState } from 'react'
import {
  Users, UserPlus, Calendar, DollarSign, 
  TrendingUp, GraduationCap, FileText, CheckCircle
} from 'lucide-react'
import PersonnelManagement from './hr/PersonnelManagement'
import RecruitmentManagement from './hr/RecruitmentManagement'
import LeaveManagement from './hr/LeaveManagement'
import PayrollManagement from './hr/PayrollManagement'
import PerformanceManagement from './hr/PerformanceManagement'
import TrainingManagement from './hr/TrainingManagement'

type Tab = 'personnel' | 'recruitment' | 'leave' | 'payroll' | 'performance' | 'training' | 'reports'

export default function HumanResources() {
  const [activeTab, setActiveTab] = useState<Tab>('personnel')

  const tabs = [
    { id: 'personnel' as const, label: 'Personel Yönetimi', icon: <Users size={18} />, description: 'Çalışan bilgileri ve profilleri' },
    { id: 'recruitment' as const, label: 'İşe Alım', icon: <UserPlus size={18} />, description: 'Pozisyonlar ve başvurular' },
    { id: 'leave' as const, label: 'İzin Yönetimi', icon: <Calendar size={18} />, description: 'İzin talepleri ve onaylar' },
    { id: 'payroll' as const, label: 'Bordro', icon: <DollarSign size={18} />, description: 'Maaş ve ödemeler' },
    { id: 'performance' as const, label: 'Performans', icon: <TrendingUp size={18} />, description: 'Değerlendirme ve hedefler' },
    { id: 'training' as const, label: 'Eğitim', icon: <GraduationCap size={18} />, description: 'Eğitim programları ve sertifikalar' },
    { id: 'reports' as const, label: 'Raporlar', icon: <FileText size={18} />, description: 'Analiz ve istatistikler' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">+12 Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">248</h3>
          <p className="text-sm text-neutral-600">Toplam Personel</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <UserPlus className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">+3 Yeni</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Aktif İlanlar</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Bekleyen</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">15</h3>
          <p className="text-sm text-neutral-600">İzin Talepleri</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Hazır</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">₺486K</h3>
          <p className="text-sm text-neutral-600">Bu Ay Bordro</p>
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 px-4 py-4 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="mt-0.5">{tab.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Personnel Tab */}
            {activeTab === 'personnel' && <PersonnelManagement />}

            {/* Recruitment Tab */}
            {activeTab === 'recruitment' && <RecruitmentManagement />}

            {/* Leave Tab */}
            {activeTab === 'leave' && <LeaveManagement />}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && <PayrollManagement />}

            {/* Performance Tab */}
            {activeTab === 'performance' && <PerformanceManagement />}

            {/* Training Tab */}
            {activeTab === 'training' && <TrainingManagement />}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İK Raporları ve Analizler</h2>
                  <p className="text-neutral-600 mb-6">
                    Personel, performans ve bordro raporlarını görüntüleyin ve analiz edin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personnel Report */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="text-blue-700" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">Personel Raporu</h3>
                          <p className="text-sm text-neutral-600">Çalışan istatistikleri</p>
                        </div>
                      </div>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Toplam Çalışan:</span>
                        <span className="font-medium text-neutral-900">248</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Yeni İşe Alımlar:</span>
                        <span className="font-medium text-neutral-900">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ayrılanlar:</span>
                        <span className="font-medium text-neutral-900">3</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                        Detaylı Rapor
                      </button>
                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm">
                        İndir
                      </button>
                    </div>
                  </div>

                  {/* Performance Report */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="text-green-700" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">Performans Raporu</h3>
                          <p className="text-sm text-neutral-600">Değerlendirme sonuçları</p>
                        </div>
                      </div>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Ortalama Puan:</span>
                        <span className="font-medium text-neutral-900">4.2/5.0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tamamlanan:</span>
                        <span className="font-medium text-neutral-900">186</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bekleyen:</span>
                        <span className="font-medium text-neutral-900">62</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                        Detaylı Rapor
                      </button>
                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm">
                        İndir
                      </button>
                    </div>
                  </div>

                  {/* Payroll Report */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="text-purple-700" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">Bordro Raporu</h3>
                          <p className="text-sm text-neutral-600">Maaş ödemeleri</p>
                        </div>
                      </div>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Bu Ay Toplam:</span>
                        <span className="font-medium text-neutral-900">₺486.250</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ödenen:</span>
                        <span className="font-medium text-neutral-900">₺486.250</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bekleyen:</span>
                        <span className="font-medium text-neutral-900">₺0</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                        Detaylı Rapor
                      </button>
                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm">
                        İndir
                      </button>
                    </div>
                  </div>

                  {/* Training Report */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <GraduationCap className="text-orange-700" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">Eğitim Raporu</h3>
                          <p className="text-sm text-neutral-600">Tamamlanan eğitimler</p>
                        </div>
                      </div>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                    <div className="space-y-2 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Toplam Eğitim:</span>
                        <span className="font-medium text-neutral-900">24</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Katılımcı:</span>
                        <span className="font-medium text-neutral-900">186</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tamamlanan:</span>
                        <span className="font-medium text-neutral-900">142</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
                        Detaylı Rapor
                      </button>
                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm">
                        İndir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
