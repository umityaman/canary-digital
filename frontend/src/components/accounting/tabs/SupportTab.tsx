import React from 'react'
import { 
  MessageCircle, BookOpen, Video, HelpCircle, Send, Clock
} from 'lucide-react'
import ActionCard from '../../ui/ActionCard'
import { toast } from 'react-hot-toast'
import { card, button, DESIGN_TOKENS, cx } from '../../../styles/design-tokens'

const SupportTab: React.FC = () => {
  const quickActions = [
    {
      title: 'Canlý Destek',
      description: 'Anlýk destek alýn',
      icon: MessageCircle,
      onClick: () => toast.success('Canlý destek baþlatýlýyor...'),
    },
    {
      title: 'Dokümantasyon',
      description: 'Kullaným kýlavuzlarýný inceleyin',
      icon: BookOpen,
      onClick: () => toast.success('Dokümantasyon açýlýyor...'),
    },
    {
      title: 'Video Eðitimler',
      description: 'Video eðitimlerimize göz atýn',
      icon: Video,
      onClick: () => toast.success('Video eðitimler açýlýyor...'),
    },
  ]

  const tickets = [
    {
      id: '#SUP-2025-001',
      subject: 'E-fatura entegrasyonu sorunu',
      status: 'open',
      priority: 'high',
      date: '2025-11-01',
    },
    {
      id: '#SUP-2025-002',
      subject: 'Ekstre raporu sorusu',
      status: 'in-progress',
      priority: 'medium',
      date: '2025-10-30',
    },
    {
      id: '#SUP-2025-003',
      subject: 'Fatura düzenleme hatasý',
      status: 'resolved',
      priority: 'low',
      date: '2025-10-28',
    },
  ]

  const faq = [
    {
      question: 'E-fatura nasýl kesilir?',
      answer: 'Faturalar sekmesinden yeni fatura oluþtur butonuna týklayarak e-fatura kesebilirsiniz.',
    },
    {
      question: 'Ekstre nasýl paylaþýlýr?',
      answer: 'Araçlar > Ekstre Paylaþýmý menüsünden müþterinizi seçerek ekstre gönderebilirsiniz.',
    },
    {
      question: 'Hatýrlatma nasýl kurulur?',
      answer: 'Araçlar > Hatýrlatmalar sekmesinden yeni hatýrlatma oluþturabilirsiniz.',
    },
    {
      question: 'Raporlar nasýl dýþa aktarýlýr?',
      answer: 'Raporlar sekmesinde Excel veya PDF butonlarýný kullanarak raporlarýnýzý indirebilirsiniz.',
    },
    {
      question: 'Barkod okuyucu nasýl kullanýlýr?',
      answer: 'Araçlar > Barkod Okuyucu menüsünden kamera eriþimi vererek barkod okutabilirsiniz.',
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'open': { color: 'bg-neutral-800 text-white', text: 'Açýk' },
      'in-progress': { color: 'bg-neutral-600 text-white', text: 'Devam Ediyor' },
      'resolved': { color: 'bg-neutral-900 text-white', text: 'Çözüldü' }
    }
    return statusMap[status] || { color: 'bg-neutral-300 text-neutral-700', text: status }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      'high': { color: 'bg-neutral-900 text-white', text: 'Yüksek' },
      'medium': { color: 'bg-neutral-600 text-white', text: 'Orta' },
      'low': { color: 'bg-neutral-300 text-neutral-700', text: 'Düþük' }
    }
    return priorityMap[priority] || { color: 'bg-neutral-300 text-neutral-700', text: priority }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <ActionCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={action.onClick}
          />
        ))}
      </div>

      {/* Support Tickets */}
      <div className={card('md', 'sm')}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>Destek Talepleri</h2>
          <button
            onClick={() => toast.success('Yeni destek talebi oluþturuluyor...')}
            className={cx(button('md', 'primary'), 'gap-2')}
          >
            <Send size={18} />
            Yeni Talep
          </button>
        </div>

        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {ticket.id}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status).color}`}>
                      {getStatusBadge(ticket.status).text}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority).color}`}>
                      {getPriorityBadge(ticket.priority).text}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(ticket.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={() => toast.success(`${ticket.id} detaylarý gösteriliyor...`)}
                  className={button('sm', 'primary')}
                >
                  Detay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className={card('md', 'sm')}>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="text-neutral-900" size={24} />
          <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>Sýk Sorulan Sorular</h2>
        </div>

        <div className="space-y-4">
          {faq.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-gray-900 mb-2">? {item.question}</h3>
              <p className="text-gray-600 text-sm">?? {item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SupportTab
