import { useState } from 'react'
import { 
  Building2, Link2, CheckCircle, XCircle, AlertCircle, 
  ExternalLink, Settings, Shield, Zap, Clock, Globe,
  TrendingUp, Users, Lock, Key, Database, RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { card, button, input, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

interface Bank {
  id: string
  name: string
  logo: string
  category: 'devlet' | 'ozel' | 'yabanci' | 'katilim' | 'yatirim'
  status: 'active' | 'coming-soon' | 'inactive'
  features: string[]
  apiType?: 'open-banking' | 'private' | 'manual'
  connected: boolean
  lastSync?: string
}

interface BankConnection {
  bankId: string
  accountName: string
  accountNumber: string
  iban: string
  balance: number
  currency: string
  lastSync: string
  autoSync: boolean
}

export default function BankIntegrations() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)

  // Türkiye'deki Tüm Bankalar
  const banks: Bank[] = [
    // DEVLET BANKALARI
    {
      id: 'ziraat',
      name: 'Ziraat Bankası',
      logo: '🏛️',
      category: 'devlet',
      status: 'active',
      features: ['Hesap Özeti', 'Hesap Hareketleri', 'EFT/Havale', 'Otomatik Senkronizasyon'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'vakifbank',
      name: 'Vakıfbank',
      logo: '🏦',
      category: 'devlet',
      status: 'active',
      features: ['Hesap Özeti', 'İşlem Geçmişi', 'Toplu Ödeme'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'halkbank',
      name: 'Halkbank',
      logo: '🏛️',
      category: 'devlet',
      status: 'active',
      features: ['Hesap Bilgileri', 'Ödeme Emri', 'Toplu İşlem'],
      apiType: 'open-banking',
      connected: false
    },

    // ÖZEL BANKALAR
    {
      id: 'isbank',
      name: 'Türkiye İş Bankası',
      logo: '🏦',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'Hesap Hareketleri', 'EFT/Havale', 'Kredi Kartı Entegrasyonu'],
      apiType: 'open-banking',
      connected: true,
      lastSync: '2024-10-28 14:30'
    },
    {
      id: 'garanti',
      name: 'Garanti BBVA',
      logo: '💚',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'Hesap Hareketleri', 'EFT/Havale', 'API Entegrasyonu'],
      apiType: 'open-banking',
      connected: true,
      lastSync: '2024-10-28 14:25'
    },
    {
      id: 'yapikredi',
      name: 'Yapı Kredi Bankası',
      logo: '💙',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'İşlem Geçmişi', 'Toplu Ödeme'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'akbank',
      name: 'Akbank',
      logo: '🔴',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'Hesap Hareketleri', 'Otomatik Senkronizasyon'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'denizbank',
      name: 'DenizBank',
      logo: '🌊',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Bilgileri', 'İşlem Geçmişi'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'qnb-finansbank',
      name: 'QNB Finansbank',
      logo: '🟣',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'Hesap Hareketleri'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'teb',
      name: 'TEB (Türk Ekonomi Bankası)',
      logo: '🔵',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'İşlem Geçmişi'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'sekerbank',
      name: 'Şekerbank',
      logo: '🍬',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Bilgileri', 'Hesap Hareketleri'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'fibabanka',
      name: 'Fibabanka',
      logo: '🟠',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'İşlem Takibi'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'turkiye-finans',
      name: 'Türkiye Finans',
      logo: '🕌',
      category: 'katilim',
      status: 'active',
      features: ['Hesap Özeti', 'Faizsiz Bankacılık'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'albaraka',
      name: 'Albaraka Türk',
      logo: '🕌',
      category: 'katilim',
      status: 'active',
      features: ['Hesap Özeti', 'Katılım Bankacılığı'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'kuveyt-turk',
      name: 'Kuveyt Türk',
      logo: '🕌',
      category: 'katilim',
      status: 'active',
      features: ['Hesap Bilgileri', 'Katılım Hesapları'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'vakif-katilim',
      name: 'Vakıf Katılım',
      logo: '🕌',
      category: 'katilim',
      status: 'active',
      features: ['Hesap Özeti', 'Katılım Bankacılığı'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'ziraat-katilim',
      name: 'Ziraat Katılım',
      logo: '🕌',
      category: 'katilim',
      status: 'active',
      features: ['Hesap Bilgileri', 'Katılım Hesapları'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'emlak-katilim',
      name: 'Emlak Katılım',
      logo: '🕌',
      category: 'katilim',
      status: 'coming-soon',
      features: ['Hesap Özeti', 'Katılım Bankacılığı'],
      apiType: 'open-banking',
      connected: false
    },

    // YABANCI BANKALAR
    {
      id: 'hsbc',
      name: 'HSBC Bank',
      logo: '🔺',
      category: 'yabanci',
      status: 'active',
      features: ['Hesap Özeti', 'Global Banking'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'ing',
      name: 'ING Bank',
      logo: '🦁',
      category: 'yabanci',
      status: 'active',
      features: ['Hesap Özeti', 'Dijital Bankacılık'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'citibank',
      name: 'Citibank',
      logo: '🏦',
      category: 'yabanci',
      status: 'active',
      features: ['Hesap Bilgileri', 'Uluslararası İşlemler'],
      apiType: 'private',
      connected: false
    },
    {
      id: 'burgan',
      name: 'Burgan Bank',
      logo: '🏦',
      category: 'yabanci',
      status: 'active',
      features: ['Hesap Özeti', 'İşlem Geçmişi'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'anadolubank',
      name: 'Anadolubank',
      logo: '🏛️',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'KOBİ Bankacılığı'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'alternatifbank',
      name: 'Alternatifbank',
      logo: '🔶',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Bilgileri', 'Ticari Bankacılık'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'odeabank',
      name: 'Odeabank',
      logo: '💜',
      category: 'ozel',
      status: 'active',
      features: ['Hesap Özeti', 'Dijital Bankacılık'],
      apiType: 'open-banking',
      connected: false
    },
    {
      id: 'turkland',
      name: 'Türkland Bank',
      logo: '🏦',
      category: 'ozel',
      status: 'coming-soon',
      features: ['Hesap Özeti', 'KOBİ Desteği'],
      apiType: 'open-banking',
      connected: false
    },

    // YATIRIM VE KALKINMA BANKALARI
    {
      id: 'kalkinma',
      name: 'Türkiye Kalkınma Bankası',
      logo: '🏛️',
      category: 'yatirim',
      status: 'coming-soon',
      features: ['Yatırım Desteği', 'Proje Finansmanı'],
      apiType: 'private',
      connected: false
    },
    {
      id: 'ihracat-kredi',
      name: 'Türk Eximbank',
      logo: '🏛️',
      category: 'yatirim',
      status: 'coming-soon',
      features: ['İhracat Desteği', 'Dış Ticaret'],
      apiType: 'private',
      connected: false
    }
  ]

  const categories = [
    { id: 'all', label: 'Tümü', count: banks.length },
    { id: 'devlet', label: 'Devlet Bankaları', count: banks.filter(b => b.category === 'devlet').length },
    { id: 'ozel', label: 'Özel Bankalar', count: banks.filter(b => b.category === 'ozel').length },
    { id: 'katilim', label: 'Katılım Bankaları', count: banks.filter(b => b.category === 'katilim').length },
    { id: 'yabanci', label: 'Yabancı Bankalar', count: banks.filter(b => b.category === 'yabanci').length },
    { id: 'yatirim', label: 'Yatırım Bankaları', count: banks.filter(b => b.category === 'yatirim').length }
  ]

  const filteredBanks = banks.filter(bank => {
    const matchesCategory = activeCategory === 'all' || bank.category === activeCategory
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const connectedBanks = banks.filter(b => b.connected)

  const handleConnect = (bank: Bank) => {
    setSelectedBank(bank)
    setShowConnectionModal(true)
  }

  const handleDisconnect = (bankId: string) => {
    if (confirm('Bu banka bağlantısını kaldırmak istediğinize emin misiniz?')) {
      toast.success('Banka bağlantısı kaldırıldı')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aktif</span>
      case 'coming-soon':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Yakında</span>
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Pasif</span>
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'devlet': return '🏛️'
      case 'ozel': return '🏦'
      case 'katilim': return '🕌'
      case 'yabanci': return '🌍'
      case 'yatirim': return '📈'
      default: return '🏦'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`${DESIGN_TOKENS.typography.h1} ${DESIGN_TOKENS.colors.text.primary}`}>
          Banka Entegrasyonları
        </h2>
        <p className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.tertiary} mt-2`}>
          Türkiye'deki tüm bankalarınızı tek platformda yönetin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cx(card('md', 'md', 'default', 'lg'), 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200')}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="text-white" size={20} />
            </div>
          </div>
          <h3 className={`${DESIGN_TOKENS.typography.stat.md} text-blue-900 mb-1`}>{banks.length}</h3>
          <p className={`${DESIGN_TOKENS.typography.body.sm} text-blue-700`}>Toplam Banka</p>
        </div>

        <div className={cx(card('md', 'md', 'default', 'lg'), 'bg-gradient-to-br from-green-50 to-green-100 border-green-200')}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Link2 className="text-white" size={20} />
            </div>
          </div>
          <h3 className={`${DESIGN_TOKENS.typography.stat.md} text-green-900 mb-1`}>{connectedBanks.length}</h3>
          <p className={`${DESIGN_TOKENS.typography.body.sm} text-green-700`}>Bağlı Hesap</p>
        </div>

        <div className={cx(card('md', 'md', 'default', 'lg'), 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200')}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
          </div>
          <h3 className={`${DESIGN_TOKENS.typography.stat.md} text-purple-900 mb-1`}>{banks.filter(b => b.status === 'active').length}</h3>
          <p className={`${DESIGN_TOKENS.typography.body.sm} text-purple-700`}>Aktif Entegrasyon</p>
        </div>

        <div className={cx(card('md', 'md', 'default', 'lg'), 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200')}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
          </div>
          <h3 className={`${DESIGN_TOKENS.typography.stat.md} text-orange-900 mb-1`}>{banks.filter(b => b.status === 'coming-soon').length}</h3>
          <p className={`${DESIGN_TOKENS.typography.body.sm} text-orange-700`}>Yakında</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={cx(card('md', 'sm', 'default', 'lg'))}>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {getCategoryIcon(cat.id)} {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className={card('md', 'sm', 'default', 'lg')}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Banka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
          />
        </div>
      </div>

      {/* Connected Banks */}
      {connectedBanks.length > 0 && (
        <div>
          <h3 className={`${DESIGN_TOKENS.typography.h3} ${DESIGN_TOKENS.colors.text.primary} mb-4`}>
            Bağlı Hesaplar ({connectedBanks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedBanks.map(bank => (
              <div key={bank.id} className={cx(card('md', 'md', 'default', 'lg'), 'border-2 border-green-200 bg-green-50')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{bank.logo}</div>
                    <div>
                      <h4 className={`${DESIGN_TOKENS.typography.h4} ${DESIGN_TOKENS.colors.text.primary}`}>
                        {bank.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs text-green-700">Bağlı</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Son Senkronizasyon:</span>
                    <span className="font-medium text-gray-900">{bank.lastSync}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className={cx(button('sm', 'outline', 'md'), 'flex-1')}>
                    <RefreshCw size={14} />
                    Yenile
                  </button>
                  <button 
                    onClick={() => handleDisconnect(bank.id)}
                    className={cx(button('sm', 'outline', 'md'), 'text-red-600 hover:bg-red-50')}
                  >
                    <XCircle size={14} />
                    Bağlantıyı Kes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Banks */}
      <div>
        <h3 className={`${DESIGN_TOKENS.typography.h3} ${DESIGN_TOKENS.colors.text.primary} mb-4`}>
          Mevcut Bankalar ({filteredBanks.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map(bank => (
            <div key={bank.id} className={cx(card('md', 'md', 'default', 'lg'), 'hover:shadow-lg transition-shadow')}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{bank.logo}</div>
                  <div>
                    <h4 className={`${DESIGN_TOKENS.typography.h4} ${DESIGN_TOKENS.colors.text.primary}`}>
                      {bank.name}
                    </h4>
                    <div className="mt-1">{getStatusBadge(bank.status)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {bank.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-gray-500">
                  {bank.apiType === 'open-banking' ? '🔓 Open Banking' : 
                   bank.apiType === 'private' ? '🔒 Private API' : '📝 Manuel'}
                </span>
                {bank.connected ? (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <CheckCircle size={16} />
                    Bağlı
                  </span>
                ) : bank.status === 'active' ? (
                  <button
                    onClick={() => handleConnect(bank)}
                    className={cx(button('sm', 'primary', 'md'), 'gap-1')}
                  >
                    <Link2 size={14} />
                    Bağlan
                  </button>
                ) : (
                  <span className="text-sm text-gray-500">Yakında</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className={cx(card('md', 'md', 'subtle', 'lg'), 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200')}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className={`${DESIGN_TOKENS.typography.h3} ${DESIGN_TOKENS.colors.text.primary} mb-2`}>
              Güvenli Banka Entegrasyonu
            </h3>
            <p className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary} mb-3`}>
              Tüm banka bağlantıları 256-bit SSL şifreleme ile korunmaktadır. Hiçbir şifreniz sistemimizde saklanmaz. 
              Open Banking standartları ile güvenli API bağlantısı sağlanmaktadır.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="text-blue-600" size={16} />
                <span className="text-gray-700">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Key className="text-blue-600" size={16} />
                <span className="text-gray-700">OAuth 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="text-blue-600" size={16} />
                <span className="text-gray-700">KVKK Uyumlu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && selectedBank && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className={cx(card('lg', 'none', 'default', 'xl'), 'w-full max-w-md')}>
            <div className="p-6 border-b">
              <h3 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary}`}>
                {selectedBank.name} Bağlantısı
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedBank.logo}</div>
                <p className="text-gray-600">
                  {selectedBank.name} hesabınızı bağlamak için bankanızın internet bankacılığı bilgileriniz ile giriş yapın.
                </p>
              </div>

              <div className="space-y-4">
                <button className={cx(button('md', 'primary', 'md'), 'w-full')}>
                  <ExternalLink size={16} />
                  {selectedBank.name} Giriş Sayfasına Git
                </button>
                <button 
                  onClick={() => setShowConnectionModal(false)}
                  className={cx(button('md', 'outline', 'md'), 'w-full')}
                >
                  İptal
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Güvenlik Notu:</p>
                    <p>Bağlantı işlemi bankanızın resmi web sitesi üzerinden gerçekleştirilecektir. 
                    Giriş bilgileriniz bizimle paylaşılmaz.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
