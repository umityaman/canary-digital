import { useState } from 'react'
import {
  Users, UserPlus, Calendar, DollarSign, 
  TrendingUp, GraduationCap, FileText, CheckCircle, FolderOpen, Award, BarChart3
} from 'lucide-react'
import PersonnelManagement from './hr/PersonnelManagement'
import RecruitmentManagement from './hr/RecruitmentManagement'
import LeaveManagement from './hr/LeaveManagement'
import PayrollManagement from './hr/PayrollManagement'
import PerformanceManagement from './hr/PerformanceManagement'
import TrainingManagement from './hr/TrainingManagement'
import DocumentManagement from './hr/DocumentManagement'
import CareerManagement from './hr/CareerManagement'
import HRReports from './hr/HRReports'

type Tab = 'personnel' | 'recruitment' | 'leave' | 'payroll' | 'performance' | 'training' | 'documents' | 'career' | 'reports'

export default function HumanResources() {
  const [activeTab, setActiveTab] = useState<Tab>('personnel')

  const tabs = [
    { id: 'personnel' as const, label: 'Personel Yönetimi', icon: <Users size={18} />, description: 'Çalışan bilgileri ve profilleri' },
    { id: 'recruitment' as const, label: 'İşe Alım', icon: <UserPlus size={18} />, description: 'Pozisyonlar ve başvurular' },
    { id: 'leave' as const, label: 'İzin Yönetimi', icon: <Calendar size={18} />, description: 'İzin talepleri ve onaylar' },
    { id: 'payroll' as const, label: 'Bordro', icon: <DollarSign size={18} />, description: 'Maaş ve ödemeler' },
    { id: 'performance' as const, label: 'Performans', icon: <TrendingUp size={18} />, description: 'Değerlendirme ve hedefler' },
    { id: 'training' as const, label: 'Eğitim', icon: <GraduationCap size={18} />, description: 'Eğitim programları ve sertifikalar' },
    { id: 'documents' as const, label: 'Özlük İşleri', icon: <FolderOpen size={18} />, description: 'Sözleşme ve doküman yönetimi' },
    { id: 'career' as const, label: 'Kariyer', icon: <Award size={18} />, description: 'Terfi ve yedekleme planları' },
    { id: 'reports' as const, label: 'Raporlar', icon: <BarChart3 size={18} />, description: 'Analiz ve istatistikler' },
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
            {activeTab === 'reports' && <HRReports />}

            {activeTab === 'documents' && <DocumentManagement />}

            {activeTab === 'career' && <CareerManagement />}
          </div>
        </div>
      </div>
    </div>
  )
}
