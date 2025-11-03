import React from 'react'
import { 
  FileText, Bell, BarChart, Users, Package, Calendar,
  CreditCard, Mail, Calculator, FolderOpen
} from 'lucide-react'
import ActionCard from '../../ui/ActionCard'
import StatCard from '../../ui/StatCard'
import { toast } from 'react-hot-toast'

interface ToolsTabProps {
  onNavigate: (tab: string) => void
}

const ToolsTab: React.FC<ToolsTabProps> = ({ onNavigate }) => {
  const quickStats = [
    {
      title: 'Aktif Araçlar',
      value: '12',
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Kullanılan Bu Ay',
      value: '847',
      icon: Calculator,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Zaman Kazanımı',
      value: '24 saat',
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  const tools = [
    {
      title: 'Hesap Kategorileri',
      description: 'Gelir ve gider kategorilerini yönetin',
      icon: FolderOpen,
      gradient: 'from-blue-500 to-blue-600',
      onClick: () => onNavigate('categories'),
    },
    {
      title: 'Raporlar',
      description: 'Detaylı finansal raporlar oluşturun',
      icon: BarChart,
      gradient: 'from-purple-500 to-purple-600',
      onClick: () => onNavigate('reports'),
    },
    {
      title: 'Cari Hesaplar',
      description: 'Müşteri ve tedarikçi hesaplarını görüntüleyin',
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      onClick: () => onNavigate('cari'),
    },
    {
      title: 'Hatırlatmalar',
      description: 'Ödeme ve işlem hatırlatmaları ayarlayın',
      icon: Bell,
      gradient: 'from-orange-500 to-orange-600',
      onClick: () => onNavigate('reminders'),
      badge: 5,
    },
    {
      title: 'Ekstre Paylaşımı',
      description: 'Müşterilerinize ekstre gönderin',
      icon: Mail,
      gradient: 'from-pink-500 to-pink-600',
      onClick: () => onNavigate('statements'),
    },
    {
      title: 'Barkod Okuyucu',
      description: 'Ürün barkodlarını okuyun ve fatura oluşturun',
      icon: CreditCard,
      gradient: 'from-indigo-500 to-indigo-600',
      onClick: () => onNavigate('barcode'),
    },
    {
      title: 'Fatura Oluştur',
      description: 'Hızlı fatura oluşturma aracı',
      icon: FileText,
      gradient: 'from-teal-500 to-teal-600',
      onClick: () => {
        toast.success('Fatura oluşturma sayfasına yönlendiriliyorsunuz...')
        onNavigate('invoice')
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Tools Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Muhasebe Araçları</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <ActionCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              gradient={tool.gradient}
              onClick={tool.onClick}
              badge={tool.badge}
            />
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 İpucu</h3>
        <p className="text-gray-700">
          Araçlar sekmesinden tüm muhasebe işlemlerinize hızlıca erişebilirsiniz. 
          Sık kullandığınız araçları favorilere ekleyerek daha verimli çalışabilirsiniz.
        </p>
      </div>
    </div>
  )
}

export default ToolsTab
