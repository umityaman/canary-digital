import React, { useState } from 'react'
import { 
  FileText, Bell, BarChart, Users, Package, Calendar,
  CreditCard, Mail, Calculator, FolderOpen, ArrowLeft, Globe
} from 'lucide-react'
import ActionCard from '../../ui/ActionCard'
import StatCard from '../../ui/StatCard'
import CategoryTagManagement from '../CategoryTagManagement'
import IntegrationsTab from './IntegrationsTab'
import { toast } from 'react-hot-toast'
import { card, button, DESIGN_TOKENS, cx } from '../../../styles/design-tokens'

type ToolView = 'list' | 'categories' | 'integrations'

interface ToolsTabProps {
  onNavigate: (tab: string) => void
}

const ToolsTab: React.FC<ToolsTabProps> = ({ onNavigate }) => {
  const [currentView, setCurrentView] = useState<ToolView>('list')

  const quickStats = [
    {
      title: 'Aktif Araçlar',
      value: '12',
      icon: Package,
    },
    {
      title: 'Kullanılan Bu Ay',
      value: '847',
      icon: Calculator,
    },
    {
      title: 'Zaman Kazanımı',
      value: '24 saat',
      icon: Calendar,
    },
  ]

  const tools = [
    {
      title: 'Entegrasyonlar',
      description: 'Banka, e-ticaret ve GİB entegrasyonlarını yönetin',
      icon: Globe,
      onClick: () => setCurrentView('integrations'),
    },
    {
      title: 'Kategori ve Etiket Yönetimi',
      description: 'Gelir/gider kategorileri ve etiketleri yönetin',
      icon: FolderOpen,
      onClick: () => setCurrentView('categories'),
    },
    {
      title: 'Raporlar',
      description: 'Detaylı finansal raporlar oluşturun',
      icon: BarChart,
      onClick: () => onNavigate('reports'),
    },
    {
      title: 'Cari Hesaplar',
      description: 'Müşteri ve tedarikçi hesaplarını görüntüleyin',
      icon: Users,
      onClick: () => onNavigate('cari'),
    },
    {
      title: 'Hatırlatmalar',
      description: 'Ödeme ve işlem hatırlatmaları ayarlayın',
      icon: Bell,
      onClick: () => onNavigate('reminders'),
      badge: 5,
    },
    {
      title: 'Ekstre Paylaşımı',
      description: 'Müşterilerinize ekstre gönderin',
      icon: Mail,
      onClick: () => onNavigate('statements'),
    },
    {
      title: 'Barkod Okuyucu',
      description: 'Ürün barkodlarını okuyun ve fatura oluşturun',
      icon: CreditCard,
      onClick: () => onNavigate('barcode'),
    },
    {
      title: 'Fatura Oluştur',
      description: 'Hızlı fatura oluşturma aracı',
      icon: FileText,
      onClick: () => {
        toast.success('Fatura oluşturma sayfasına yönlendiriliyorsunuz...')
        onNavigate('invoice')
      },
    },
  ]

  // Show Integrations view
  if (currentView === 'integrations') {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setCurrentView('list')}
          className={cx(button('sm', 'ghost'), 'gap-2')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Araçlara Dön</span>
        </button>

        {/* Integrations Component */}
        <IntegrationsTab />
      </div>
    )
  }

  // Show Category Management view
  if (currentView === 'categories') {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setCurrentView('list')}
          className={cx(button('sm', 'ghost'), 'gap-2')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Araçlara Dön</span>
        </button>

        {/* Category Management Component */}
        <CategoryTagManagement />
      </div>
    )
  }

  // Default Tools List View
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-8 h-8 text-neutral-900" />
            </div>
            <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">İşletme Kolaylıkları</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <ActionCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              onClick={tool.onClick}
              badge={tool.badge}
            />
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">💡 İpucu</h3>
        <p className="text-sm text-neutral-600">
          Araçlar sekmesinden tüm muhasebe işlemlerinize hızlıca erişebilirsiniz. 
          Sık kullandığınız araçları favorilere ekleyerek daha verimli çalışabilirsiniz.
        </p>
      </div>
    </div>
  )
}

export default ToolsTab
