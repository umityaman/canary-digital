import { useState, useEffect } from 'react'
import {
  Calculator, DollarSign, TrendingUp, TrendingDown, FileText, Users,
  CreditCard, Banknote, Building2, Receipt, Package, BarChart3,
  PieChart, Settings, Download, Upload, RefreshCw, Clock, Globe
} from 'lucide-react'
import { accountingAPI } from '../services/api'
import { toast } from 'react-hot-toast'

type Tab = 'dashboard' | 'preaccounting' | 'reports' | 'invoice' | 'offer' | 'ebelge' | 'integration' | 'tools' | 'advisor' | 'support'

interface AccountingStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalCollections: number
  totalOverdue: number
  invoiceCount: number
  period: {
    start: string
    end: string
  }
}

export default function Accounting() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<AccountingStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Load accounting stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await accountingAPI.getStats()
      setStats(response.data.data)
    } catch (error: any) {
      console.error('Failed to load accounting stats:', error)
      toast.error('İstatistikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Ana Sayfa', icon: <BarChart3 size={18} /> },
    { id: 'preaccounting' as const, label: 'Ön Muhasebe', icon: <Calculator size={18} /> },
    { id: 'reports' as const, label: 'Raporlar', icon: <PieChart size={18} /> },
    { id: 'invoice' as const, label: 'Fatura Takibi', icon: <FileText size={18} /> },
    { id: 'offer' as const, label: 'Teklif Yönetimi', icon: <Receipt size={18} /> },
    { id: 'ebelge' as const, label: 'e-Belge', icon: <CreditCard size={18} /> },
    { id: 'integration' as const, label: 'Entegrasyonlar', icon: <RefreshCw size={18} /> },
    { id: 'tools' as const, label: 'İşletme Kolaylıkları', icon: <Settings size={18} /> },
    { id: 'advisor' as const, label: 'Mali Müşavir', icon: <Users size={18} /> },
    { id: 'support' as const, label: 'Yardım & Araçlar', icon: <Globe size={18} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Bu Ay Gelir */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-neutral-700" size={24} />
            </div>
            {stats && stats.invoiceCount > 0 && (
              <span className="text-xs text-neutral-700 font-medium">
                {stats.invoiceCount} fatura
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {loading ? '...' : stats ? formatCurrency(stats.totalRevenue) : '₺0'}
          </h3>
          <p className="text-sm text-neutral-600">Bu Ay Gelir</p>
        </div>

        {/* Bu Ay Gider */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-neutral-700" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {loading ? '...' : stats ? formatCurrency(stats.totalExpenses) : '₺0'}
          </h3>
          <p className="text-sm text-neutral-600">Bu Ay Gider</p>
        </div>

        {/* Net Kâr */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Net</span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${
            stats && stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {loading ? '...' : stats ? formatCurrency(stats.netProfit) : '₺0'}
          </h3>
          <p className="text-sm text-neutral-600">Net Kâr</p>
        </div>

        {/* Tahsilat / Bekleyen */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bekleyen</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {loading ? '...' : stats ? formatCurrency(stats.totalOverdue) : '₺0'}
          </h3>
          <p className="text-sm text-neutral-600">Vade Geçmiş</p>
          {stats && stats.totalCollections > 0 && (
            <p className="text-xs text-green-600 mt-2">
              Bu ay: {formatCurrency(stats.totalCollections)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Hızlı İşlemler</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-all text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Hızlı Fatura Kes</h3>
                      <FileText className="text-neutral-700" size={24} />
                    </div>
                    <p className="text-sm text-neutral-600">Yeni fatura oluştur</p>
                  </button>

                  <button className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-all text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Gelir Ekle</h3>
                      <TrendingUp className="text-neutral-700" size={24} />
                    </div>
                    <p className="text-sm text-neutral-600">Yeni gelir kaydı</p>
                  </button>

                  <button className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-all text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Gider Ekle</h3>
                      <TrendingDown className="text-neutral-700" size={24} />
                    </div>
                    <p className="text-sm text-neutral-600">Yeni gider kaydı</p>
                  </button>
                </div>
              </div>
            )}

            {/* Pre-Accounting Tab */}
            {activeTab === 'preaccounting' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Ön Muhasebe Yönetimi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="mr-2 text-neutral-700" size={20} />
                      Gelir-Gider Takibi
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Gelir Takibi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Gider Takibi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Gider Kategorileri</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Banka Mutabakatı</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Users className="mr-2 text-neutral-700" size={20} />
                      Cari Hesap Takibi
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Cari Hesap Ekstresi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>İşlem Geçmişi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Çek/Nakit Girişi</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Banknote className="mr-2 text-neutral-700" size={20} />
                      Nakit Yönetimi
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Kasa ve Banka</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Ödeme Hatırlatma</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Çek Takibi</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Muhasebe Raporları</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Tahsilat Raporları', icon: <Download size={20} />, color: 'blue' },
                    { name: 'Nakit Akışı', icon: <TrendingUp size={20} />, color: 'green' },
                    { name: 'Gelir-Gider', icon: <BarChart3 size={20} />, color: 'purple' },
                    { name: 'Kasa Banka', icon: <Building2 size={20} />, color: 'indigo' },
                    { name: 'Satışlar', icon: <Package size={20} />, color: 'pink' },
                    { name: 'KDV Raporu', icon: <FileText size={20} />, color: 'orange' },
                    { name: 'Giderler', icon: <TrendingDown size={20} />, color: 'red' },
                    { name: 'Ödemeler', icon: <CreditCard size={20} />, color: 'cyan' },
                  ].map((report) => (
                    <button key={report.name} className="bg-white rounded-2xl p-4 border border-neutral-200 hover:shadow-md transition-all text-left">
                      <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-3">
                        <div className="text-neutral-700">{report.icon}</div>
                      </div>
                      <h3 className="font-medium text-neutral-900 text-sm">{report.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Fatura Takibi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <Receipt className="text-neutral-700 mb-3" size={32} />
                    <h3 className="font-semibold mb-2">Fatura Şablonu</h3>
                    <p className="text-sm text-neutral-600">Hazır şablonlarla hızlı fatura</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <Upload className="text-neutral-700 mb-3" size={32} />
                    <h3 className="font-semibold mb-2">Toplu Yazdırma</h3>
                    <p className="text-sm text-neutral-600">Birden fazla faturayı yazdır</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <FileText className="text-neutral-700 mb-3" size={32} />
                    <h3 className="font-semibold mb-2">Hızlı Arama</h3>
                    <p className="text-sm text-neutral-600">Faturaları kolayca bul</p>
                  </div>
                </div>
              </div>
            )}

            {/* Offer Tab */}
            {activeTab === 'offer' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Teklif Yönetimi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Hızlı Teklif Oluştur</h3>
                    <p className="text-sm text-neutral-600 mb-4">Profesyonel teklifler hazırla</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Teklif Oluştur
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4">
                      <Receipt className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Faturaya Dönüştür</h3>
                    <p className="text-sm text-neutral-600 mb-4">Onaylanan teklifleri faturala</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Dönüştür
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Teklifleri İncele</h3>
                    <p className="text-sm text-neutral-600 mb-4">Filtreleyerek görüntüle</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Listele
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* e-Belge Tab */}
            {activeTab === 'ebelge' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">e-Belge Çözümleri</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'e-Fatura', desc: 'GİB uyumlu e-fatura sistemi' },
                    { name: 'e-Arşiv', desc: 'Dijital fatura kesme' },
                    { name: 'e-İrsaliye', desc: 'Dijital sevkiyat belgeleri' },
                    { name: 'e-SMM', desc: 'Serbest meslek makbuzu' },
                  ].map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                        <CreditCard className="text-neutral-600" size={24} />
                      </div>
                      <p className="text-sm text-neutral-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Tab */}
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Entegrasyonlar</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Banka Entegrasyonu', desc: 'Hesap hareketlerini otomatik aktar', icon: <Building2 size={24} /> },
                    { name: 'Online Tahsilat', desc: 'Müşterilerden online ödeme al', icon: <CreditCard size={24} /> },
                    { name: 'Stok Yönetimi', desc: 'Ürün hareketlerini izle', icon: <Package size={24} /> },
                  ].map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <div className="text-neutral-700">{item.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-neutral-600">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">İşletme Kolaylıkları</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Etiketleme', desc: 'Gelir-giderleri sınıflandır' },
                    { name: 'Hatırlatmalar', desc: 'Ödeme bildirimleri' },
                    { name: 'Ekstre Paylaşımı', desc: 'Müşterilere ekstre gönder' },
                    { name: 'Barkod Okuma', desc: 'Hızlı fatura oluştur' },
                  ].map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl p-6 border border-neutral-200">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-neutral-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advisor Tab */}
            {activeTab === 'advisor' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Mali Müşavirler İçin</h2>
                
                <div className="bg-white rounded-2xl p-8 border border-neutral-200">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">Veri Aktarımı</h3>
                      <p className="text-neutral-600 mb-4">
                        Mükelleflerin verilerini tek tıkla muhasebe programına aktarın.
                      </p>
                      <button className="bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
                        Hemen Başla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Yardım ve Destek</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <Calculator className="text-neutral-700 mb-4" size={32} />
                    <h3 className="font-semibold mb-2">Hesaplama Araçları</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>• Personel Maliyet Hesaplama</li>
                      <li>• Amortisman Hesaplama</li>
                      <li>• KDV Hesaplama</li>
                      <li>• Stopaj Hesaplama</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <Globe className="text-neutral-700 mb-4" size={32} />
                    <h3 className="font-semibold mb-2">Destek Merkezi</h3>
                    <p className="text-sm text-neutral-600 mb-4">7/24 destek ekibimiz hazır</p>
                    <div className="space-y-2">
                      <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                        Canlı Destek
                      </button>
                      <button className="w-full bg-neutral-100 text-neutral-700 py-2 rounded-xl hover:bg-neutral-200 transition-colors">
                        Dokümantasyon
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
