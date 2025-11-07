import React from 'react'
import { 
  Users, FileText, Download, Send, Calendar, TrendingUp
} from 'lucide-react'
import StatCard from '../../ui/StatCard'
import ActionCard from '../../ui/ActionCard'
import { toast } from 'react-hot-toast'
import { card, button, DESIGN_TOKENS, cx } from '../../../styles/design-tokens'

const AdvisorTab: React.FC = () => {
  const stats = [
    {
      title: 'Toplam Müşteri',
      value: '42',
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Aktif Dönem',
      value: '2025/10',
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Aylık İşlem',
      value: '1,247',
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'E-Belge Sayısı',
      value: '384',
      icon: FileText,
      gradient: 'from-orange-500 to-orange-600',
    },
  ]

  const actions = [
    {
      title: 'XML Export',
      description: 'E-fatura XML dosyalarını dışa aktarın',
      icon: Download,
      gradient: 'from-blue-500 to-blue-600',
      onClick: () => toast.success('XML export başlatılıyor...'),
    },
    {
      title: 'Excel Raporlar',
      description: 'Detaylı Excel raporları oluşturun',
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      onClick: () => toast.success('Excel raporu hazırlanıyor...'),
    },
    {
      title: 'Toplu E-Belge Gönderimi',
      description: 'Birden fazla e-belgeyi aynı anda gönderin',
      icon: Send,
      gradient: 'from-purple-500 to-purple-600',
      onClick: () => toast.success('Toplu gönderim başlatılıyor...'),
    },
  ]

  const clients = [
    { name: 'ABC Ticaret Ltd. Şti.', vkn: '1234567890', status: 'active' },
    { name: 'XYZ A.Ş.', vkn: '0987654321', status: 'active' },
    { name: 'DEF İnşaat', vkn: '1122334455', status: 'pending' },
    { name: 'GHI Lojistik', vkn: '5544332211', status: 'active' },
    { name: 'JKL Tekstil', vkn: '9988776655', status: 'active' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className={card('md', 'sm')}>
        <h2 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary} mb-6`}>Hızlı İşlemler</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              gradient={action.gradient}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>

      {/* Client List */}
      <div className={card('md', 'sm')}>
        <h2 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary} mb-6`}>Müşteri Listesi</h2>
        
        <div className="space-y-3">
          {clients.map((client, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                <p className="text-sm text-gray-600">VKN: {client.vkn}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {client.status === 'active' ? 'Aktif' : 'Beklemede'}
                </span>
                
                <button
                  onClick={() => toast.success(`${client.name} detayları gösteriliyor...`)}
                  className={button('sm', 'primary')}
                >
                  Detay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdvisorTab
