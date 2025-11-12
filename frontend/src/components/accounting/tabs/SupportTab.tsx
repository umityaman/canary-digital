import React from 'react'
import { 
  MessageCircle, BookOpen, Video, HelpCircle, Send, Clock
} from 'lucide-react'
import ActionCard from '../../ui/ActionCard'
import { toast } from 'react-hot-toast'
import { button, cx } from '../../../styles/design-tokens'

const SupportTab: React.FC = () => {
  const quickActions = [
    {
      title: 'Canlı Destek',
      description: 'Anlık destek alın',
      icon: MessageCircle,
      onClick: () => toast.success('Canlı destek başlatılıyor...'),
    },
    {
      title: 'Dokümantasyon',
      description: 'Kullanım kılavuzlarını inceleyin',
      icon: BookOpen,
      onClick: () => toast.success('Dokümantasyon açılıyor...'),
    },
    {
      title: 'Video Eğitimler',
      description: 'Video eğitimlerimize göz atın',
      icon: Video,
      onClick: () => toast.success('Video eğitimler açılıyor...'),
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
      subject: 'Fatura düzenleme hatası',
      status: 'resolved',
      priority: 'low',
      date: '2025-10-28',
    },
  ]

  const faq = [
    {
      question: 'E-fatura nasıl kesilir?',
      answer: 'Faturalar sekmesinden yeni fatura oluştur butonuna tıklayarak e-fatura kesebilirsiniz.',
    },
    {
      question: 'Ekstre nasıl paylaşılır?',
      answer: 'Araçlar > Ekstre Paylaşımı menüsünden müşterinizi seçerek ekstre gönderebilirsiniz.',
    },
    {
      question: 'Hatırlatma nasıl kurulur?',
      answer: 'Araçlar > Hatırlatmalar sekmesinden yeni hatırlatma oluşturabilirsiniz.',
    },
    {
      question: 'Raporlar nasıl dışa aktarılır?',
      answer: 'Raporlar sekmesinde Excel veya PDF butonlarını kullanarak raporlarınızı indirebilirsiniz.',
    },
    {
      question: 'Barkod okuyucu nasıl kullanılır?',
      answer: 'Araçlar > Barkod Okuyucu menüsünden kamera erişimi vererek barkod okutabilirsiniz.',
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'open': { color: 'bg-neutral-800 text-white', text: 'Açık' },
      'in-progress': { color: 'bg-neutral-600 text-white', text: 'Devam Ediyor' },
      'resolved': { color: 'bg-neutral-900 text-white', text: 'Çözüldü' }
    }
    return statusMap[status] || { color: 'bg-neutral-300 text-neutral-700', text: status }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      'high': { color: 'bg-neutral-900 text-white', text: 'Yüksek' },
      'medium': { color: 'bg-neutral-600 text-white', text: 'Orta' },
      'low': { color: 'bg-neutral-300 text-neutral-700', text: 'Düşük' }
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Destek Talepleri</h2>
          <button
            onClick={() => toast.success('Yeni destek talebi oluşturuluyor...')}
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
              className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-neutral-900">
                      {ticket.id}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status).color}`}>
                      {getStatusBadge(ticket.status).text}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority).color}`}>
                      {getPriorityBadge(ticket.priority).text}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{ticket.subject}</h3>
                  <p className="text-sm text-neutral-600 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(ticket.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={() => toast.success(`${ticket.id} detayları gösteriliyor...`)}
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="text-neutral-900" size={24} />
          <h2 className="text-xl font-semibold text-neutral-900">Sık Sorulan Sorular</h2>
        </div>

        <div className="space-y-4">
          {faq.map((item, index) => (
            <div key={index} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
              <h3 className="font-semibold text-neutral-900 mb-2">❓ {item.question}</h3>
              <p className="text-neutral-600 text-sm">💡 {item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SupportTab
