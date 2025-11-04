import React, { useState } from 'react'
import { 
  ShoppingCart, Store, Package, Truck, Link2, CheckCircle, 
  XCircle, Clock, Settings, RefreshCw, ExternalLink, Shield,
  Lock, Key, Database, TrendingUp, BarChart3, Users, Search
} from 'lucide-react'

interface Marketplace {
  id: string
  name: string
  logo: string
  category: 'pazaryeri' | 'e-ticaret-altyapisi' | 'kargo' | 'odeme'
  status: 'active' | 'coming-soon' | 'inactive'
  features: string[]
  apiType?: 'official' | 'partner' | 'manual'
  connected: boolean
  lastSync?: string
  commission?: string
}

interface MarketplaceConnection {
  marketplaceId: string
  storeName: string
  apiKey: string
  lastSync: string
  ordersCount: number
  revenue: number
  autoSync: boolean
}

const ECommerceIntegrations: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [connections, setConnections] = useState<MarketplaceConnection[]>([
    {
      marketplaceId: 'trendyol',
      storeName: 'Canary Mağazam',
      apiKey: '••••••••••••',
      lastSync: '2025-11-04 15:30',
      ordersCount: 156,
      revenue: 45600,
      autoSync: true
    },
    {
      marketplaceId: 'hepsiburada',
      storeName: 'Canary Store',
      apiKey: '••••••••••••',
      lastSync: '2025-11-04 15:25',
      ordersCount: 89,
      revenue: 28900,
      autoSync: true
    }
  ])
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null)

  const marketplaces: Marketplace[] = [
    // PAZARYERI - Türkiye'nin En Büyük Platformları
    {
      id: 'trendyol',
      name: 'Trendyol',
      logo: '🛍️',
      category: 'pazaryeri',
      status: 'active',
      features: ['Sipariş Yönetimi', 'Ürün Senkronizasyonu', 'Stok Takibi', 'Fatura Oluşturma', 'Kargo Entegrasyonu'],
      apiType: 'official',
      connected: true,
      lastSync: '2025-11-04 15:30',
      commission: '%8-15'
    },
    {
      id: 'hepsiburada',
      name: 'Hepsiburada',
      logo: '🏪',
      category: 'pazaryeri',
      status: 'active',
      features: ['Sipariş Yönetimi', 'Ürün Yönetimi', 'Stok Senkronizasyonu', 'Fatura Entegrasyonu', 'Kargo Takibi'],
      apiType: 'official',
      connected: true,
      lastSync: '2025-11-04 15:25',
      commission: '%10-18'
    },
    {
      id: 'n11',
      name: 'n11.com',
      logo: '🛒',
      category: 'pazaryeri',
      status: 'active',
      features: ['Sipariş Aktarımı', 'Ürün Listesi', 'Stok Yönetimi', 'Otomatik Faturalama', 'Kargo API'],
      apiType: 'official',
      connected: false,
      commission: '%6-12'
    },
    {
      id: 'ciceksepeti',
      name: 'Çiçeksepeti',
      logo: '🌸',
      category: 'pazaryeri',
      status: 'active',
      features: ['Sipariş Entegrasyonu', 'Ürün Yönetimi', 'Stok Kontrolü', 'Fatura Sistemi'],
      apiType: 'official',
      connected: false,
      commission: '%8-15'
    },
    {
      id: 'gittigidiyor',
      name: 'GittiGidiyor',
      logo: '🎯',
      category: 'pazaryeri',
      status: 'active',
      features: ['Açık Artırma', 'Hemen Al', 'Stok Takibi', 'Sipariş Yönetimi'],
      apiType: 'official',
      connected: false,
      commission: '%4-10'
    },
    {
      id: 'amazon-tr',
      name: 'Amazon.com.tr',
      logo: '📦',
      category: 'pazaryeri',
      status: 'active',
      features: ['FBA Entegrasyonu', 'Ürün Kataloğu', 'Stok Yönetimi', 'Prime Shipping', 'Fatura API'],
      apiType: 'official',
      connected: false,
      commission: '%8-15'
    },
    {
      id: 'pttavm',
      name: 'PTT AVM',
      logo: '📮',
      category: 'pazaryeri',
      status: 'active',
      features: ['Sipariş Yönetimi', 'Ürün Listesi', 'PTT Kargo', 'Fatura Sistemi'],
      apiType: 'official',
      connected: false,
      commission: '%5-12'
    },
    {
      id: 'pazarama',
      name: 'Pazarama',
      logo: '🏬',
      category: 'pazaryeri',
      status: 'active',
      features: ['Sipariş Entegrasyonu', 'Ürün Yönetimi', 'Stok Takibi', 'Kargo API'],
      apiType: 'partner',
      connected: false,
      commission: '%7-14'
    },
    {
      id: 'modanisa',
      name: 'Modanisa',
      logo: '👗',
      category: 'pazaryeri',
      status: 'coming-soon',
      features: ['Sipariş Yönetimi', 'Ürün Kataloğu', 'Stok Senkronizasyonu'],
      apiType: 'partner',
      connected: false,
      commission: '%12-20'
    },
    {
      id: 'defacto',
      name: 'DeFacto',
      logo: '👔',
      category: 'pazaryeri',
      status: 'coming-soon',
      features: ['Sipariş API', 'Ürün Yönetimi', 'Stok Takibi'],
      apiType: 'partner',
      connected: false,
      commission: '%10-18'
    },

    // E-TİCARET ALTYAPILARI
    {
      id: 'shopify',
      name: 'Shopify',
      logo: '🏪',
      category: 'e-ticaret-altyapisi',
      status: 'active',
      features: ['Mağaza Entegrasyonu', 'Ürün Senkronizasyonu', 'Sipariş Aktarımı', 'Webhook Desteği', 'Stok Yönetimi'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'ticimax',
      name: 'Ticimax',
      logo: '🛍️',
      category: 'e-ticaret-altyapisi',
      status: 'active',
      features: ['API Entegrasyonu', 'Ürün Yönetimi', 'Sipariş Sistemi', 'Stok Takibi', 'Fatura Oluşturma'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'ideasoft',
      name: 'IdeaSoft',
      logo: '💡',
      category: 'e-ticaret-altyapisi',
      status: 'active',
      features: ['Mağaza API', 'Ürün Entegrasyonu', 'Sipariş Yönetimi', 'Stok Senkronizasyonu'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      logo: '🔌',
      category: 'e-ticaret-altyapisi',
      status: 'active',
      features: ['REST API', 'Ürün Senkronizasyonu', 'Sipariş Webhook', 'Stok Yönetimi', 'Fatura Plugin'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'opencart',
      name: 'OpenCart',
      logo: '🛒',
      category: 'e-ticaret-altyapisi',
      status: 'active',
      features: ['API Modülü', 'Ürün İmport/Export', 'Sipariş Entegrasyonu', 'Stok Kontrolü'],
      apiType: 'partner',
      connected: false
    },
    {
      id: 'magento',
      name: 'Magento',
      logo: '🎨',
      category: 'e-ticaret-altyapisi',
      status: 'active',
      features: ['REST/SOAP API', 'Ürün Kataloğu', 'Sipariş Yönetimi', 'Multi-Store', 'Stok Takibi'],
      apiType: 'partner',
      connected: false
    },
    {
      id: 'prestashop',
      name: 'PrestaShop',
      logo: '🛍️',
      category: 'e-ticaret-altyapisi',
      status: 'coming-soon',
      features: ['Web Service API', 'Ürün Yönetimi', 'Sipariş Entegrasyonu'],
      apiType: 'partner',
      connected: false
    },

    // KARGO FİRMALARI
    {
      id: 'yurtici',
      name: 'Yurtiçi Kargo',
      logo: '🚚',
      category: 'kargo',
      status: 'active',
      features: ['Kargo Takibi', 'Gönderi Oluşturma', 'Barkod Yazdırma', 'Fiyat Sorgulama', 'Toplu Gönderim'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'aras',
      name: 'Aras Kargo',
      logo: '📦',
      category: 'kargo',
      status: 'active',
      features: ['Kargo API', 'Gönderi Takibi', 'Etiket Yazdırma', 'Fiyat Hesaplama', 'Toplu İşlem'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'mng',
      name: 'MNG Kargo',
      logo: '🚛',
      category: 'kargo',
      status: 'active',
      features: ['Kargo Entegrasyonu', 'Gönderi Oluşturma', 'Takip Sistemi', 'Fiyat API', 'Çoklu Gönderim'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'ptt',
      name: 'PTT Kargo',
      logo: '📮',
      category: 'kargo',
      status: 'active',
      features: ['Kargo Takibi', 'Gönderi API', 'Etiket Sistemi', 'Fiyat Hesaplama'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'ups',
      name: 'UPS',
      logo: '🌍',
      category: 'kargo',
      status: 'active',
      features: ['Uluslararası Kargo', 'Gönderi Takibi', 'Etiket Yazdırma', 'Fiyat Hesaplama', 'API Entegrasyonu'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'dhl',
      name: 'DHL Express',
      logo: '✈️',
      category: 'kargo',
      status: 'active',
      features: ['Express Kargo', 'Uluslararası Gönderi', 'Takip Sistemi', 'Gümrük Desteği'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'fedex',
      name: 'FedEx',
      logo: '📬',
      category: 'kargo',
      status: 'coming-soon',
      features: ['Uluslararası Kargo', 'Express Gönderi', 'Takip API'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'sendeo',
      name: 'Sendeo',
      logo: '📮',
      category: 'kargo',
      status: 'active',
      features: ['Kargo Karşılaştırma', 'Çoklu Kargo API', 'Fiyat Optimizasyonu', 'Toplu Gönderim'],
      apiType: 'partner',
      connected: false
    },

    // ÖDEME ALTYAPILARI
    {
      id: 'iyzico',
      name: 'İyzico',
      logo: '💳',
      category: 'odeme',
      status: 'active',
      features: ['Ödeme Linki', 'Sanal POS', 'Taksit', 'Marketplace Ödemesi', 'API Entegrasyonu'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'paytr',
      name: 'PayTR',
      logo: '💰',
      category: 'odeme',
      status: 'active',
      features: ['Ödeme API', 'Sanal POS', 'QR Ödeme', 'Taksit Sistemi', 'Tahsilat Takibi'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'param',
      name: 'Param',
      logo: '🏦',
      category: 'odeme',
      status: 'active',
      features: ['Ödeme Gateway', 'Sanal POS', 'Taksit API', 'Güvenli Ödeme', 'Fatura Entegrasyonu'],
      apiType: 'official',
      connected: false
    },
    {
      id: 'sipay',
      name: 'Sipay',
      logo: '💎',
      category: 'odeme',
      status: 'active',
      features: ['Ödeme Sistemi', 'Sanal POS', 'Taksit', 'Link ile Ödeme'],
      apiType: 'partner',
      connected: false
    }
  ]

  const categories = [
    { id: 'all', label: 'Tümü', count: marketplaces.length, icon: Store },
    { id: 'pazaryeri', label: 'Pazaryerleri', count: marketplaces.filter(m => m.category === 'pazaryeri').length, icon: ShoppingCart },
    { id: 'e-ticaret-altyapisi', label: 'E-Ticaret Altyapısı', count: marketplaces.filter(m => m.category === 'e-ticaret-altyapisi').length, icon: Store },
    { id: 'kargo', label: 'Kargo Firmaları', count: marketplaces.filter(m => m.category === 'kargo').length, icon: Truck },
    { id: 'odeme', label: 'Ödeme Sistemleri', count: marketplaces.filter(m => m.category === 'odeme').length, icon: Package }
  ]

  const filteredMarketplaces = marketplaces.filter(marketplace => {
    const matchesCategory = activeCategory === 'all' || marketplace.category === activeCategory
    const matchesSearch = marketplace.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && !marketplace.connected
  })

  const connectedMarketplaces = marketplaces.filter(m => m.connected)

  const handleConnect = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace)
    setShowConnectionModal(true)
  }

  const handleDisconnect = (marketplaceId: string) => {
    if (window.confirm('Bu entegrasyonu kaldırmak istediğinize emin misiniz?')) {
      setConnections(connections.filter(c => c.marketplaceId !== marketplaceId))
      // Update marketplace connected status
      const marketplace = marketplaces.find(m => m.id === marketplaceId)
      if (marketplace) {
        marketplace.connected = false
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'coming-soon': { label: 'Yakında', color: 'bg-blue-100 text-blue-800', icon: Clock },
      inactive: { label: 'Pasif', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'pazaryeri': '🛍️',
      'e-ticaret-altyapisi': '🏪',
      'kargo': '🚚',
      'odeme': '💳'
    }
    return icons[category as keyof typeof icons] || '🔧'
  }

  const totalRevenue = connections.reduce((sum, conn) => sum + conn.revenue, 0)
  const totalOrders = connections.reduce((sum, conn) => sum + conn.ordersCount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-8 h-8 text-indigo-600" />
                E-Ticaret Entegrasyonları
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Pazaryerleri, e-ticaret altyapıları, kargo ve ödeme sistemleri ile entegre olun
              </p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Yeni Entegrasyon
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Toplam Platform</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">{marketplaces.length}+</p>
                </div>
                <Store className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Aktif Entegrasyon</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{connectedMarketplaces.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{totalOrders}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Toplam Ciro</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">₺{totalRevenue.toLocaleString('tr-TR')}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-amber-600 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Connected Marketplaces */}
        {connectedMarketplaces.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Bağlı Platformlar ({connectedMarketplaces.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedMarketplaces.map(marketplace => {
                const connection = connections.find(c => c.marketplaceId === marketplace.id)
                return (
                  <div key={marketplace.id} className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{marketplace.logo}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{marketplace.name}</h3>
                          <p className="text-xs text-gray-600">{connection?.storeName}</p>
                        </div>
                      </div>
                      {getStatusBadge(marketplace.status)}
                    </div>

                    {connection && (
                      <div className="space-y-2 mb-3 bg-white rounded p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sipariş:</span>
                          <span className="font-semibold">{connection.ordersCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ciro:</span>
                          <span className="font-semibold text-green-600">₺{connection.revenue.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Son Senkr:</span>
                          <span className="text-xs text-gray-500">{connection.lastSync}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Senkronize Et
                      </button>
                      <button 
                        onClick={() => handleDisconnect(marketplace.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-700'
                  }`}>
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Platform ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Marketplace Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplaces.map(marketplace => (
              <div key={marketplace.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all hover:border-indigo-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{marketplace.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{marketplace.name}</h3>
                      <p className="text-xs text-gray-500">{getCategoryIcon(marketplace.category)} {marketplace.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(marketplace.status)}
                </div>

                {marketplace.commission && (
                  <div className="mb-3 text-sm">
                    <span className="text-gray-600">Komisyon: </span>
                    <span className="font-semibold text-indigo-600">{marketplace.commission}</span>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Özellikler:</p>
                  <div className="flex flex-wrap gap-1">
                    {marketplace.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                    {marketplace.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{marketplace.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    marketplace.apiType === 'official' ? 'bg-blue-100 text-blue-700' :
                    marketplace.apiType === 'partner' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {marketplace.apiType === 'official' ? '🔗 Resmi API' : 
                     marketplace.apiType === 'partner' ? '🤝 Partner API' : '📝 Manuel'}
                  </span>
                  
                  <button
                    onClick={() => handleConnect(marketplace)}
                    disabled={marketplace.status !== 'active'}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      marketplace.status === 'active'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                    Bağlan
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMarketplaces.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hiç platform bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Güvenlik ve Gizlilik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">SSL 256-bit Şifreleme</p>
                <p className="text-xs text-gray-600">Tüm verileriniz şifrelenir</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">OAuth 2.0</p>
                <p className="text-xs text-gray-600">Güvenli yetkilendirme</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">KVKK Uyumlu</p>
                <p className="text-xs text-gray-600">Veri güvenliği garantisi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && selectedMarketplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedMarketplace.logo}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedMarketplace.name}</h3>
                <p className="text-sm text-gray-600">Entegrasyon Kurulumu</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Anahtarı</label>
                <input
                  type="text"
                  placeholder="API Key giriniz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mağaza Adı</label>
                <input
                  type="text"
                  placeholder="Mağaza adınız"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Not:</strong> API bilgilerinizi {selectedMarketplace.name} yönetim panelinden alabilirsiniz.
                </p>
                <a 
                  href="#" 
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                >
                  Nasıl alırım? <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setShowConnectionModal(false)
                  // Handle connection logic here
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Bağlan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ECommerceIntegrations
