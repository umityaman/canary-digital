import { useState } from 'react'
import { 
  Building2, Link2, CheckCircle, XCircle, AlertCircle, 
  ExternalLink, Shield, Zap, Clock,
  Lock, Key, Database, RefreshCw, Search
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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
        return <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">Pasif</span>
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
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                Banka Entegrasyonları
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Türkiye'deki tüm bankalarınızı tek platformda yönetin
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Yeni Banka Bağla
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Toplam Banka</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{banks.length}+</p>
                </div>
                <Building2 className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Bağlı Hesap</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{connectedBanks.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Aktif Entegrasyon</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{banks.filter(b => b.status === 'active').length}</p>
                </div>
                <Zap className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Yakında</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{banks.filter(b => b.status === 'coming-soon').length}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-600 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Connected Banks */}
        {connectedBanks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Bağlı Hesaplar ({connectedBanks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedBanks.map(bank => (
                <div key={bank.id} className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{bank.logo}</span>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{bank.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700">Bağlı</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Son Senkronizasyon:</span>
                      <span className="font-medium text-neutral-900">{bank.lastSync}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4" />
                      Yenile
                    </button>
                    <button 
                      onClick={() => handleDisconnect(bank.id)}
                      className="px-3 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Kes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <span>{getCategoryIcon(cat.id)}</span>
                {cat.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-neutral-700'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Banka ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            />
          </div>

          {/* Available Banks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map(bank => (
              <div key={bank.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{bank.logo}</span>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{bank.name}</h3>
                      <div className="mt-1">{getStatusBadge(bank.status)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {bank.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-neutral-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {bank.apiType === 'open-banking' ? '🔓 Open Banking' : 
                     bank.apiType === 'private' ? '🔒 Private API' : '📝 Manuel'}
                  </span>
                  {bank.connected ? (
                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Bağlı
                    </span>
                  ) : bank.status === 'active' ? (
                    <button
                      onClick={() => handleConnect(bank)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Link2 className="w-4 h-4" />
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-neutral-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Güvenli Banka Entegrasyonu
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                Tüm banka bağlantıları 256-bit SSL şifreleme ile korunmaktadır. Hiçbir şifreniz sistemimizde saklanmaz. 
                Open Banking standartları ile güvenli API bağlantısı sağlanmaktadır.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="text-blue-600 w-4 h-4" />
                  <span className="text-neutral-700">256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="text-blue-600 w-4 h-4" />
                  <span className="text-neutral-700">OAuth 2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="text-blue-600 w-4 h-4" />
                  <span className="text-neutral-700">KVKK Uyumlu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
