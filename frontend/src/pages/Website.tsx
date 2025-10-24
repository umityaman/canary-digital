import { useState } from 'react'import React, { useState } from 'react';

import {import {

  Globe, Layout, FileText, ShoppingBag, Code, Package,  Globe,

  Search, TrendingUp, Plus, Eye, Users, Calendar,  Layout,

  BarChart3, Palette, Zap, ExternalLink, Monitor,  FileText,

  Activity, ArrowUpRight  ShoppingBag,

} from 'lucide-react'  Code,

  Package,

type Tab = 'sites' | 'builder' | 'cms' | 'shop' | 'embed' | 'apps' | 'seo' | 'analytics'  Search,

  TrendingUp,

export default function Website() {  Plus,

  const [activeTab, setActiveTab] = useState<Tab>('sites')  Eye,

  Users,

  const tabs = [  Clock,

    { id: 'sites' as const, label: 'Web Siteleri', icon: <Globe size={18} />, description: 'Aktif web siteleri ve yönetim' },  Bell,

    { id: 'builder' as const, label: 'Site Oluşturucu', icon: <Layout size={18} />, description: 'Sürükle-bırak editör' },  Award,

    { id: 'cms' as const, label: 'İçerik Yönetimi', icon: <FileText size={18} />, description: 'Blog ve sayfa yönetimi' },  Star,

    { id: 'shop' as const, label: 'Online Mağaza', icon: <ShoppingBag size={18} />, description: 'E-ticaret yönetimi' },  BarChart3,

    { id: 'embed' as const, label: 'Embed & Entegrasyon', icon: <Code size={18} />, description: 'Widget ve API entegrasyonları' },  Palette,

    { id: 'apps' as const, label: 'Uygulamalar', icon: <Package size={18} />, description: 'Eklentiler ve uzantılar' },  FileEdit,

    { id: 'seo' as const, label: 'SEO & Pazarlama', icon: <Search size={18} />, description: 'Arama motoru optimizasyonu' },  Zap,

    { id: 'analytics' as const, label: 'İstatistikler', icon: <TrendingUp size={18} />, description: 'Ziyaretçi ve performans' },  Check,

  ]  ExternalLink,

  Sparkles,

  return (  Monitor,

    <div className="space-y-6">  Smartphone,

      {/* Quick Stats */}  Settings,

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">  Image,

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">  Video,

          <div className="flex items-center justify-between mb-4">  File,

            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">  Trash2,

              <Globe className="text-neutral-700" size={24} />  Edit,

            </div>  MoreVertical,

            <span className="text-xs text-neutral-600 font-medium">+2 Bu Ay</span>  Calendar,

          </div>  Tag,

          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>  DollarSign,

          <p className="text-sm text-neutral-600">Aktif Web Sitesi</p>  Box,

        </div>  AlertCircle,

  CheckCircle,

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">  XCircle,

          <div className="flex items-center justify-between mb-4">  Copy,

            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">  Link2,

              <Users className="text-neutral-700" size={24} />  BookOpen,

            </div>  Plug,

            <span className="text-xs text-neutral-600 font-medium">+15.2%</span>  CreditCard,

          </div>  Mail,

          <h3 className="text-2xl font-bold text-neutral-900 mb-1">24.5K</h3>  Share2,

          <p className="text-sm text-neutral-600">Toplam Ziyaretçi</p>  PenTool,

        </div>  Download,

  Target,

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">  Megaphone,

          <div className="flex items-center justify-between mb-4">  Shield,

            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">  Activity,

              <ShoppingBag className="text-neutral-700" size={24} />  FileCode,

            </div>  Rocket,

            <span className="text-xs text-neutral-600 font-medium">Bu Ay</span>  ArrowUpRight,

          </div>  ArrowDownRight,

          <h3 className="text-2xl font-bold text-neutral-900 mb-1">156</h3>  FileDown,

          <p className="text-sm text-neutral-600">Online Satış</p>} from 'lucide-react';

        </div>import {

  LineChart,

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">  Line,

          <div className="flex items-center justify-between mb-4">  AreaChart,

            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">  Area,

              <Activity className="text-neutral-700" size={24} />  BarChart,

            </div>  Bar,

            <span className="text-xs text-neutral-600 font-medium">Ortalama</span>  PieChart,

          </div>  Pie,

          <h3 className="text-2xl font-bold text-neutral-900 mb-1">98%</h3>  Cell,

          <p className="text-sm text-neutral-600">Uptime Oranı</p>  XAxis,

        </div>  YAxis,

      </div>  CartesianGrid,

  Tooltip,

      {/* Tabs - Vertical Layout */}  Legend,

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">  ResponsiveContainer,

        <div className="flex">} from 'recharts';

          {/* Sidebar Tabs */}

          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">type Tab = 'dashboard' | 'builder' | 'cms' | 'shop' | 'embed' | 'apps' | 'seo' | 'analytics';

            {tabs.map((tab) => (

              <buttonconst Website: React.FC = () => {

                key={tab.id}  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

                onClick={() => setActiveTab(tab.id)}

                className={`w-full flex items-start gap-3 px-4 py-4 text-sm transition-colors ${  const tabs = [

                  activeTab === tab.id    { id: 'dashboard' as const, label: 'Dashboard', icon: <BarChart3 size={18} /> },

                    ? 'bg-neutral-900 text-white'    { id: 'builder' as const, label: 'Site Oluşturucu', icon: <Layout size={18} /> },

                    : 'text-neutral-700 hover:bg-neutral-50'    { id: 'cms' as const, label: 'İçerik Yönetimi', icon: <FileText size={18} /> },

                }`}    { id: 'shop' as const, label: 'Online Mağaza', icon: <ShoppingBag size={18} /> },

              >    { id: 'embed' as const, label: 'Embed & Entegrasyon', icon: <Code size={18} /> },

                <div className="mt-0.5">{tab.icon}</div>    { id: 'apps' as const, label: 'Uygulamalar', icon: <Package size={18} /> },

                <div className="text-left">    { id: 'seo' as const, label: 'SEO & Pazarlama', icon: <Search size={18} /> },

                  <div className="font-medium">{tab.label}</div>    { id: 'analytics' as const, label: 'İstatistikler', icon: <TrendingUp size={18} /> },

                  <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'}`}>  ];

                    {tab.description}

                  </div>  const renderTabContent = () => {

                </div>    switch (activeTab) {

              </button>      case 'dashboard':

            ))}        return renderDashboard();

          </nav>      case 'builder':

        return renderSiteBuilder();

          {/* Content Area */}      case 'cms':

          <div className="flex-1 p-6">        return renderCMS();

            {/* Sites Tab */}      case 'shop':

            {activeTab === 'sites' && (        return renderShop();

              <div className="space-y-6">      case 'embed':

                <div>        return renderEmbed();

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Web Siteleri</h2>      case 'apps':

                  <p className="text-neutral-600 mb-6">        return renderApps();

                    Tüm web sitelerinizi tek yerden yönetin, düzenleyin ve performanslarını takip edin.      case 'seo':

                  </p>        return renderSEO();

                </div>      case 'analytics':

        return renderAnalytics();

                <div className="flex justify-end">      default:

                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">        return null;

                    <Plus size={18} />    }

                    <span>Yeni Web Sitesi</span>  };

                  </button>

                </div>  const renderPlaceholder = (title: string, description: string) => (

    <div className="flex items-center justify-center h-96">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">      <div className="text-center">

                  {/* Site 1 - Corporate */}        <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">          <FileEdit className="text-neutral-400" size={48} />

                    <div className="flex items-center justify-between mb-4">        </div>

                      <div className="flex items-center gap-3">        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h3>

                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">        <p className="text-neutral-600 max-w-md mx-auto">{description}</p>

                          <Globe className="text-white" size={24} />        <button className="mt-6 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">

                        </div>          Yakında

                        <div>        </button>

                          <h3 className="font-semibold text-neutral-900">Canary Kurumsal</h3>      </div>

                          <p className="text-sm text-neutral-600">canary.com.tr</p>    </div>

                        </div>  );

                      </div>

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">  const renderSiteBuilder = () => {

                        Aktif    const themes = [

                      </span>      {

                    </div>        id: 1,

                    <div className="space-y-2 text-sm text-neutral-600 mb-4">        name: 'Modern Dark',

                      <div className="flex items-center justify-between">        category: 'Profesyonel',

                        <span>Ziyaretçi (Aylık):</span>        image: '🎨',

                        <span className="font-medium text-neutral-900">12.5K</span>        color: 'from-neutral-900 to-neutral-800',

                      </div>        isActive: true,

                      <div className="flex items-center justify-between">        features: ['Responsive', 'SEO Ready', 'Fast Loading'],

                        <span>Sayfa:</span>      },

                        <span className="font-medium text-neutral-900">24</span>      {

                      </div>        id: 2,

                      <div className="flex items-center justify-between">        name: 'Minimal White',

                        <span>Son Güncelleme:</span>        category: 'Minimalist',

                        <span className="font-medium text-neutral-900">2 gün önce</span>        image: '✨',

                      </div>        color: 'from-neutral-100 to-white',

                    </div>        isActive: false,

                    <div className="grid grid-cols-2 gap-2">        features: ['Clean Design', 'Typography', 'Animations'],

                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">      },

                        <Layout size={16} />      {

                        <span>Düzenle</span>        id: 3,

                      </button>        name: 'Creative Studio',

                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">        category: 'Yaratıcı',

                        <Eye size={16} />        image: '🎭',

                        <span>Görüntüle</span>        color: 'from-purple-500 to-pink-500',

                      </button>        isActive: false,

                    </div>        features: ['Portfolio', 'Gallery', 'Video Support'],

                  </div>      },

      {

                  {/* Site 2 - E-commerce */}        id: 4,

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">        name: 'E-commerce Pro',

                    <div className="flex items-center justify-between mb-4">        category: 'E-ticaret',

                      <div className="flex items-center gap-3">        image: '🛒',

                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">        color: 'from-blue-500 to-cyan-500',

                          <ShoppingBag className="text-white" size={24} />        isActive: false,

                        </div>        features: ['Product Grid', 'Cart', 'Checkout'],

                        <div>      },

                          <h3 className="font-semibold text-neutral-900">Canary Shop</h3>      {

                          <p className="text-sm text-neutral-600">shop.canary.com.tr</p>        id: 5,

                        </div>        name: 'Business Elite',

                      </div>        category: 'Kurumsal',

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">        image: '💼',

                        Aktif        color: 'from-neutral-700 to-neutral-600',

                      </span>        isActive: false,

                    </div>        features: ['Corporate', 'Trust Elements', 'CTA'],

                    <div className="space-y-2 text-sm text-neutral-600 mb-4">      },

                      <div className="flex items-center justify-between">      {

                        <span>Satış (Aylık):</span>        id: 6,

                        <span className="font-medium text-neutral-900">₺48.5K</span>        name: 'Rental Focus',

                      </div>        category: 'Kiralama',

                      <div className="flex items-center justify-between">        image: '📦',

                        <span>Ürün:</span>        color: 'from-green-500 to-emerald-500',

                        <span className="font-medium text-neutral-900">148</span>        isActive: false,

                      </div>        features: ['Booking', 'Availability', 'Calendar'],

                      <div className="flex items-center justify-between">      },

                        <span>Sipariş:</span>    ];

                        <span className="font-medium text-neutral-900">156</span>

                      </div>    return (

                    </div>      <div className="space-y-6">

                    <div className="grid grid-cols-2 gap-2">        {/* Active Site Info */}

                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 rounded-2xl text-white">

                        <Layout size={16} />          <div className="flex items-center justify-between">

                        <span>Düzenle</span>            <div className="flex items-center gap-4">

                      </button>              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">

                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">                <Globe size={32} />

                        <Eye size={16} />              </div>

                        <span>Görüntüle</span>              <div>

                      </button>                <div className="flex items-center gap-2 mb-1">

                    </div>                  <h3 className="text-xl font-bold">canary-rental.com</h3>

                  </div>                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">

                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>

                  {/* Site 3 - Blog */}                    Yayında

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">                  </span>

                    <div className="flex items-center justify-between mb-4">                </div>

                      <div className="flex items-center gap-3">                <p className="text-sm text-white/70">Modern Dark - Profesyonel Tema</p>

                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">              </div>

                          <FileText className="text-white" size={24} />            </div>

                        </div>            <div className="flex items-center gap-3">

                        <div>              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">

                          <h3 className="font-semibold text-neutral-900">Canary Blog</h3>                <Monitor size={16} />

                          <p className="text-sm text-neutral-600">blog.canary.com.tr</p>                Önizle

                        </div>              </button>

                      </div>              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">                <Settings size={16} />

                        Aktif                Özelleştir

                      </span>              </button>

                    </div>              <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-900 hover:bg-white/90 rounded-xl transition-colors text-sm font-medium">

                    <div className="space-y-2 text-sm text-neutral-600 mb-4">                <ExternalLink size={16} />

                      <div className="flex items-center justify-between">                Siteyi Aç

                        <span>Okuyucu (Aylık):</span>              </button>

                        <span className="font-medium text-neutral-900">8.2K</span>            </div>

                      </div>          </div>

                      <div className="flex items-center justify-between">

                        <span>Makale:</span>          {/* Quick Stats */}

                        <span className="font-medium text-neutral-900">86</span>          <div className="grid grid-cols-4 gap-4 mt-6">

                      </div>            <div className="bg-white/5 p-4 rounded-xl">

                      <div className="flex items-center justify-between">              <p className="text-sm text-white/70 mb-1">Sayfa Sayısı</p>

                        <span>Yorum:</span>              <p className="text-2xl font-bold">12</p>

                        <span className="font-medium text-neutral-900">342</span>            </div>

                      </div>            <div className="bg-white/5 p-4 rounded-xl">

                    </div>              <p className="text-sm text-white/70 mb-1">Son Güncelleme</p>

                    <div className="grid grid-cols-2 gap-2">              <p className="text-2xl font-bold">2 saat önce</p>

                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">            </div>

                        <Layout size={16} />            <div className="bg-white/5 p-4 rounded-xl">

                        <span>Düzenle</span>              <p className="text-sm text-white/70 mb-1">Performans</p>

                      </button>              <p className="text-2xl font-bold text-green-400">98/100</p>

                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">            </div>

                        <Eye size={16} />            <div className="bg-white/5 p-4 rounded-xl">

                        <span>Görüntüle</span>              <p className="text-sm text-white/70 mb-1">SEO Skoru</p>

                      </button>              <p className="text-2xl font-bold text-blue-400">92/100</p>

                    </div>            </div>

                  </div>          </div>

        </div>

                  {/* Site 4 - Landing Page */}

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">        {/* Theme Gallery */}

                    <div className="flex items-center justify-between mb-4">        <div>

                      <div className="flex items-center gap-3">          <div className="flex items-center justify-between mb-4">

                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">            <div>

                          <Zap className="text-white" size={24} />              <h3 className="text-xl font-bold text-neutral-900">Tema Galerisi</h3>

                        </div>              <p className="text-sm text-neutral-600 mt-1">60+ profesyonel tema arasından seçim yapın</p>

                        <div>            </div>

                          <h3 className="font-semibold text-neutral-900">Kampanya Sayfası</h3>            <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors text-sm font-medium text-neutral-900">

                          <p className="text-sm text-neutral-600">promo.canary.com.tr</p>              <Sparkles size={16} />

                        </div>              Tüm Temalar

                      </div>            </button>

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">          </div>

                        Aktif

                      </span>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    </div>            {themes.map((theme) => (

                    <div className="space-y-2 text-sm text-neutral-600 mb-4">              <div

                      <div className="flex items-center justify-between">                key={theme.id}

                        <span>Dönüşüm Oranı:</span>                className={`bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden ${

                        <span className="font-medium text-neutral-900">8.4%</span>                  theme.isActive 

                      </div>                    ? 'border-neutral-900 shadow-xl' 

                      <div className="flex items-center justify-between">                    : 'border-neutral-200 hover:border-neutral-300'

                        <span>Form Gönderimi:</span>                }`}

                        <span className="font-medium text-neutral-900">124</span>              >

                      </div>                {/* Theme Preview */}

                      <div className="flex items-center justify-between">                <div className={`bg-gradient-to-br ${theme.color} h-40 flex items-center justify-center text-6xl relative`}>

                        <span>Kampanya Süresi:</span>                  {theme.image}

                        <span className="font-medium text-neutral-900">15 gün</span>                  {theme.isActive && (

                      </div>                    <div className="absolute top-3 right-3 bg-neutral-900 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">

                    </div>                      <Check size={14} />

                    <div className="grid grid-cols-2 gap-2">                      Aktif

                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">                    </div>

                        <Layout size={16} />                  )}

                        <span>Düzenle</span>                </div>

                      </button>

                      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">                {/* Theme Info */}

                        <Eye size={16} />                <div className="p-5">

                        <span>Görüntüle</span>                  <div className="flex items-center justify-between mb-2">

                      </button>                    <h4 className="font-bold text-neutral-900">{theme.name}</h4>

                    </div>                    <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full">

                  </div>                      {theme.category}

                </div>                    </span>

              </div>                  </div>

            )}

                  {/* Features */}

            {/* Builder Tab */}                  <div className="flex flex-wrap gap-2 mb-4">

            {activeTab === 'builder' && (                    {theme.features.map((feature, idx) => (

              <div className="space-y-6">                      <span key={idx} className="text-xs px-2 py-1 bg-neutral-50 text-neutral-600 rounded-md">

                <div>                        {feature}

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Site Oluşturucu</h2>                      </span>

                  <p className="text-neutral-600 mb-6">                    ))}

                    Sürükle-bırak editör ile web sitenizi kolayca oluşturun ve özelleştirin.                  </div>

                  </p>

                </div>                  {/* Actions */}

                  <div className="flex gap-2">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">                    {theme.isActive ? (

                  {/* Template Cards */}                      <button className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">                        <Settings size={16} />

                    <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-4 flex items-center justify-center">                        Özelleştir

                      <Monitor className="text-blue-600" size={48} />                      </button>

                    </div>                    ) : (

                    <h3 className="font-semibold text-neutral-900 mb-2">Kurumsal Template</h3>                      <>

                    <p className="text-sm text-neutral-600 mb-4">Modern ve profesyonel kurumsal web sitesi şablonu</p>                        <button className="flex-1 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors">

                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">                          Kullan

                      Kullan                        </button>

                    </button>                        <button className="px-4 py-2.5 border border-neutral-300 hover:border-neutral-400 text-neutral-700 rounded-xl text-sm font-medium transition-colors">

                  </div>                          <Eye size={16} />

                        </button>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">                      </>

                    <div className="w-full h-40 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mb-4 flex items-center justify-center">                    )}

                      <ShoppingBag className="text-green-600" size={48} />                  </div>

                    </div>                </div>

                    <h3 className="font-semibold text-neutral-900 mb-2">E-ticaret Template</h3>              </div>

                    <p className="text-sm text-neutral-600 mb-4">Online mağaza için optimize edilmiş şablon</p>            ))}

                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">          </div>

                      Kullan        </div>

                    </button>

                  </div>        {/* Customization Options */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">

                    <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mb-4 flex items-center justify-center">            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">

                      <FileText className="text-purple-600" size={48} />              <Palette className="mr-2 text-neutral-700" size={20} />

                    </div>              Renk & Stil

                    <h3 className="font-semibold text-neutral-900 mb-2">Blog Template</h3>            </h3>

                    <p className="text-sm text-neutral-600 mb-4">İçerik odaklı blog ve dergi şablonu</p>            <div className="space-y-4">

                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">              <div>

                      Kullan                <label className="text-sm font-medium text-neutral-700 mb-2 block">Ana Renk</label>

                    </button>                <div className="flex gap-2">

                  </div>                  {['#0f172a', '#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c'].map((color, idx) => (

                </div>                    <button

              </div>                      key={idx}

            )}                      className={`w-10 h-10 rounded-xl border-2 transition-all ${

                        idx === 0 ? 'border-neutral-900 scale-110' : 'border-neutral-200 hover:scale-105'

            {/* CMS Tab */}                      }`}

            {activeTab === 'cms' && (                      style={{ backgroundColor: color }}

              <div className="space-y-6">                    ></button>

                <div>                  ))}

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İçerik Yönetimi</h2>                </div>

                  <p className="text-neutral-600 mb-6">              </div>

                    Sayfa, blog ve medya içeriklerinizi yönetin.              <div>

                  </p>                <label className="text-sm font-medium text-neutral-700 mb-2 block">Yazı Tipi</label>

                </div>                <select className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900">

                  <option>Inter (Mevcut)</option>

                <div className="flex justify-end">                  <option>Roboto</option>

                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">                  <option>Open Sans</option>

                    <Plus size={18} />                  <option>Lato</option>

                    <span>Yeni İçerik</span>                  <option>Montserrat</option>

                  </button>                </select>

                </div>              </div>

              <button className="w-full py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium">

                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">                Değişiklikleri Kaydet

                  <table className="w-full">              </button>

                    <thead className="bg-neutral-50 border-b border-neutral-200">            </div>

                      <tr>          </div>

                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Başlık</th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Tür</th>          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">

                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Yazar</th>            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">

                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Tarih</th>              <Smartphone className="mr-2 text-neutral-700" size={20} />

                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Durum</th>              Cihaz Önizlemesi

                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">İşlemler</th>            </h3>

                      </tr>            <div className="space-y-3">

                    </thead>              <button className="w-full flex items-center justify-between p-4 bg-neutral-900 text-white rounded-xl">

                    <tbody className="divide-y divide-neutral-200">                <div className="flex items-center gap-3">

                      <tr className="hover:bg-neutral-50">                  <Monitor size={20} />

                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">Yeni Ürün Lansmanı</td>                  <div className="text-left">

                        <td className="px-6 py-4 text-sm text-neutral-600">Blog</td>                    <p className="font-medium">Masaüstü</p>

                        <td className="px-6 py-4 text-sm text-neutral-600">Ahmet Yılmaz</td>                    <p className="text-xs text-white/70">1920x1080 ve üzeri</p>

                        <td className="px-6 py-4 text-sm text-neutral-600">24 Eki 2024</td>                  </div>

                        <td className="px-6 py-4">                </div>

                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">Yayında</span>                <Check size={20} />

                        </td>              </button>

                        <td className="px-6 py-4 text-right">              <button className="w-full flex items-center justify-between p-4 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors">

                          <button className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-xs">                <div className="flex items-center gap-3">

                            Düzenle                  <Monitor size={20} className="text-neutral-700" />

                          </button>                  <div className="text-left">

                        </td>                    <p className="font-medium text-neutral-900">Tablet</p>

                      </tr>                    <p className="text-xs text-neutral-600">768x1024</p>

                      <tr className="hover:bg-neutral-50">                  </div>

                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">Hakkımızda Sayfası</td>                </div>

                        <td className="px-6 py-4 text-sm text-neutral-600">Sayfa</td>              </button>

                        <td className="px-6 py-4 text-sm text-neutral-600">Ayşe Kaya</td>              <button className="w-full flex items-center justify-between p-4 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors">

                        <td className="px-6 py-4 text-sm text-neutral-600">22 Eki 2024</td>                <div className="flex items-center gap-3">

                        <td className="px-6 py-4">                  <Smartphone size={20} className="text-neutral-700" />

                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">Yayında</span>                  <div className="text-left">

                        </td>                    <p className="font-medium text-neutral-900">Mobil</p>

                        <td className="px-6 py-4 text-right">                    <p className="text-xs text-neutral-600">375x667</p>

                          <button className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-xs">                  </div>

                            Düzenle                </div>

                          </button>              </button>

                        </td>            </div>

                      </tr>          </div>

                      <tr className="hover:bg-neutral-50">        </div>

                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">Kampanya Detayları</td>      </div>

                        <td className="px-6 py-4 text-sm text-neutral-600">Blog</td>    );

                        <td className="px-6 py-4 text-sm text-neutral-600">Mehmet Demir</td>  };

                        <td className="px-6 py-4 text-sm text-neutral-600">20 Eki 2024</td>

                        <td className="px-6 py-4">  const renderDashboard = () => (

                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-lg">Taslak</span>    <div className="space-y-6">

                        </td>      {/* Quick Stats */}

                        <td className="px-6 py-4 text-right">      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                          <button className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-xs">        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">

                            Düzenle          <div className="flex items-center justify-between mb-4">

                          </button>            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">

                        </td>              <Eye className="text-neutral-700" size={24} />

                      </tr>            </div>

                    </tbody>            <span className="text-xs text-neutral-700 font-medium">Bu Ay</span>

                  </table>          </div>

                </div>          <h3 className="text-2xl font-bold text-neutral-900 mb-1">12.5K</h3>

              </div>          <p className="text-sm text-neutral-600">Toplam Ziyaretçi</p>

            )}          <div className="flex items-center gap-1 text-xs text-green-600 mt-2">

            <TrendingUp size={14} />

            {/* Shop Tab */}            <span>+15%</span>

            {activeTab === 'shop' && (          </div>

              <div className="space-y-6">        </div>

                <div>

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Online Mağaza</h2>        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">

                  <p className="text-neutral-600 mb-6">          <div className="flex items-center justify-between mb-4">

                    Ürün, sipariş ve stok yönetimi.            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">

                  </p>              <Users className="text-neutral-700" size={24} />

                </div>            </div>

            <span className="text-xs text-neutral-700 font-medium">Aktif</span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">          </div>

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">          <h3 className="text-2xl font-bold text-neutral-900 mb-1">234</h3>

                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">          <p className="text-sm text-neutral-600">Kullanıcılar</p>

                      <ShoppingBag className="text-blue-700" size={20} />          <div className="flex items-center gap-1 text-xs text-green-600 mt-2">

                    </div>            <TrendingUp size={14} />

                    <h3 className="text-2xl font-bold text-neutral-900">148</h3>            <span>+8%</span>

                    <p className="text-sm text-neutral-600">Ürün</p>          </div>

                  </div>        </div>

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">

                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">

                      <Package className="text-green-700" size={20} />          <div className="flex items-center justify-between mb-4">

                    </div>            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">

                    <h3 className="text-2xl font-bold text-neutral-900">156</h3>              <Clock className="text-neutral-700" size={24} />

                    <p className="text-sm text-neutral-600">Sipariş</p>            </div>

                  </div>            <span className="text-xs text-neutral-700 font-medium">Ortalama</span>

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">          </div>

                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">          <h3 className="text-2xl font-bold text-neutral-900 mb-1">3:45</h3>

                      <Users className="text-purple-700" size={20} />          <p className="text-sm text-neutral-600">Oturum Süresi</p>

                    </div>          <p className="text-xs text-neutral-500 mt-2">dakika</p>

                    <h3 className="text-2xl font-bold text-neutral-900">2.4K</h3>        </div>

                    <p className="text-sm text-neutral-600">Müşteri</p>

                  </div>        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">          <div className="flex items-center justify-between mb-4">

                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-2">            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">

                      <TrendingUp className="text-orange-700" size={20} />              <TrendingUp className="text-neutral-700" size={24} />

                    </div>            </div>

                    <h3 className="text-2xl font-bold text-neutral-900">₺48.5K</h3>            <span className="text-xs text-neutral-700 font-medium">Oran</span>

                    <p className="text-sm text-neutral-600">Satış</p>          </div>

                  </div>          <h3 className="text-2xl font-bold text-neutral-900 mb-1">4.2%</h3>

                </div>          <p className="text-sm text-neutral-600">Dönüşüm</p>

              </div>          <p className="text-xs text-neutral-500 mt-2">rezervasyon/ziyaret</p>

            )}        </div>

      </div>

            {/* Embed Tab */}

            {activeTab === 'embed' && (      {/* Quick Actions */}

              <div className="space-y-6">      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group">

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Embed & Entegrasyon</h2>          <div className="flex items-center justify-between mb-4">

                  <p className="text-neutral-600 mb-6">            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">

                    Widget'lar ve üçüncü parti entegrasyonlar.              <Palette size={24} />

                  </p>            </div>

                </div>            <span className="text-sm opacity-75">Eylem 1</span>

          </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">          <h3 className="text-lg font-bold mb-2">Yeni Site Oluştur</h3>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">          <p className="text-sm opacity-75 mb-4">Hazır şablonlardan seçim yapın</p>

                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">

                      <Code className="text-blue-700" size={24} />            Başla →

                    </div>          </button>

                    <h3 className="font-semibold text-neutral-900 mb-2">İletişim Formu Widget</h3>        </div>

                    <p className="text-sm text-neutral-600 mb-4">Herhangi bir siteye eklenebilir iletişim formu</p>

                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">        <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group">

                      Embed Kodu Al          <div className="flex items-center justify-between mb-4">

                    </button>            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">

                  </div>              <FileEdit size={24} />

            </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">            <span className="text-sm opacity-75">Eylem 2</span>

                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">          </div>

                      <BarChart3 className="text-green-700" size={24} />          <h3 className="text-lg font-bold mb-2">Sayfa Ekle</h3>

                    </div>          <p className="text-sm opacity-75 mb-4">Yeni içerik sayfası oluşturun</p>

                    <h3 className="font-semibold text-neutral-900 mb-2">Analytics Widget</h3>          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">

                    <p className="text-sm text-neutral-600 mb-4">Gerçek zamanlı ziyaretçi istatistikleri</p>            Oluştur →

                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">          </button>

                      Embed Kodu Al        </div>

                    </button>

                  </div>        <div className="bg-gradient-to-br from-neutral-700 to-neutral-600 p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group">

                </div>          <div className="flex items-center justify-between mb-4">

              </div>            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">

            )}              <Zap size={24} />

            </div>

            {/* Apps Tab */}            <span className="text-sm opacity-75">Eylem 3</span>

            {activeTab === 'apps' && (          </div>

              <div className="space-y-6">          <h3 className="text-lg font-bold mb-2">Ürün Ekle</h3>

                <div>          <p className="text-sm opacity-75 mb-4">Yeni kiralama ürünü ekleyin</p>

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Uygulamalar</h2>          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">

                  <p className="text-neutral-600 mb-6">            Ekle →

                    Web sitenize ekleyebileceğiniz eklentiler ve uzantılar.          </button>

                  </p>        </div>

                </div>      </div>



                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">      {/* Activity & Popular Pages */}

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">

                      <Package className="text-purple-700" size={24} />          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">

                    </div>            <Bell className="mr-2 text-neutral-700" size={20} />

                    <h3 className="font-semibold text-neutral-900 mb-2">Canlı Destek</h3>            Son Aktiviteler

                    <p className="text-sm text-neutral-600 mb-4">Ziyaretçilerinizle anlık sohbet</p>          </h3>

                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">          <div className="space-y-3">

                      Yükle            {[

                    </button>              { action: 'Yeni sayfa oluşturuldu', page: 'Ürünlerimiz', time: '5 dk önce', color: 'bg-green-500' },

                  </div>              { action: 'Blog yazısı yayınlandı', page: 'Kiralama İpuçları', time: '1 saat önce', color: 'bg-blue-500' },

              { action: 'SEO ayarları güncellendi', page: 'Ana Sayfa', time: '2 saat önce', color: 'bg-yellow-500' },

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">              { action: 'Yeni rezervasyon', page: 'Sony A7 IV', time: '3 saat önce', color: 'bg-green-500' },

                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">            ].map((activity, idx) => (

                      <Calendar className="text-orange-700" size={24} />              <div key={idx} className="flex items-start">

                    </div>                <span className={`w-2 h-2 ${activity.color} rounded-full mr-3 mt-2`}></span>

                    <h3 className="font-semibold text-neutral-900 mb-2">Randevu Sistemi</h3>                <div className="flex-1">

                    <p className="text-sm text-neutral-600 mb-4">Online randevu ve rezervasyon</p>                  <p className="text-sm font-medium text-neutral-900">{activity.action}</p>

                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">                  <p className="text-xs text-neutral-600">{activity.page} • {activity.time}</p>

                      Yükle                </div>

                    </button>              </div>

                  </div>            ))}

          </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">        </div>

                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">

                      <Palette className="text-pink-700" size={24} />        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">

                    </div>          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">

                    <h3 className="font-semibold text-neutral-900 mb-2">Galeri Widget</h3>            <Award className="mr-2 text-neutral-700" size={20} />

                    <p className="text-sm text-neutral-600 mb-4">Gelişmiş fotoğraf galerisi</p>            Popüler Sayfalar

                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">          </h3>

                      Yükle          <div className="space-y-3">

                    </button>            {[

                  </div>              { page: 'Ana Sayfa', views: '3.5K', rate: '+12%' },

                </div>              { page: 'Ürünler', views: '2.1K', rate: '+8%' },

              </div>              { page: 'Blog', views: '1.8K', rate: '+15%' },

            )}              { page: 'İletişim', views: '890', rate: '+5%' },

            ].map((page, idx) => (

            {/* SEO Tab */}              <div key={idx} className="flex items-center justify-between border-b border-neutral-100 pb-2">

            {activeTab === 'seo' && (                <div className="flex items-center space-x-3">

              <div className="space-y-6">                  <span className="text-lg">⭐</span>

                <div>                  <div>

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">SEO & Pazarlama</h2>                    <p className="text-sm font-medium text-neutral-900">{page.page}</p>

                  <p className="text-neutral-600 mb-6">                    <p className="text-xs text-neutral-600">{page.views} görüntülenme</p>

                    Arama motoru optimizasyonu ve dijital pazarlama araçları.                  </div>

                  </p>                </div>

                </div>                <div className="flex items-center space-x-1">

                  <Star className="text-yellow-500 fill-yellow-500" size={14} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                  <span className="text-sm font-medium text-green-600">{page.rate}</span>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">                </div>

                    <div className="flex items-start justify-between mb-4">              </div>

                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">            ))}

                        <Search className="text-blue-700" size={24} />          </div>

                      </div>        </div>

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">      </div>

                        <ArrowUpRight size={12} />    </div>

                        +12%  );

                      </span>

                    </div>  const renderCMS = () => {

                    <h3 className="font-semibold text-neutral-900 mb-2">SEO Skoru</h3>    const pages = [

                    <div className="text-3xl font-bold text-neutral-900 mb-2">85/100</div>      { id: 1, title: 'Ana Sayfa', slug: '/home', status: 'published', views: 3500, lastUpdated: '2 saat önce', author: 'Admin', type: 'page' },

                    <p className="text-sm text-neutral-600">Çok İyi</p>      { id: 2, title: 'Hakkımızda', slug: '/about', status: 'published', views: 1200, lastUpdated: '1 gün önce', author: 'Admin', type: 'page' },

                  </div>      { id: 3, title: 'Ürünlerimiz', slug: '/products', status: 'published', views: 2100, lastUpdated: '3 saat önce', author: 'Admin', type: 'page' },

      { id: 4, title: 'İletişim', slug: '/contact', status: 'published', views: 890, lastUpdated: '5 gün önce', author: 'Admin', type: 'page' },

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">      { id: 5, title: '10 Kiralama İpucu', slug: '/blog/rental-tips', status: 'draft', views: 0, lastUpdated: '1 saat önce', author: 'Editör', type: 'blog' },

                    <div className="flex items-start justify-between mb-4">    ];

                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">

                        <TrendingUp className="text-green-700" size={24} />    const mediaItems = [

                      </div>      { id: 1, name: 'hero-image.jpg', type: 'image', size: '2.4 MB', date: '19 Eki 2025' },

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">      { id: 2, name: 'product-demo.mp4', type: 'video', size: '45.2 MB', date: '18 Eki 2025' },

                        <ArrowUpRight size={12} />      { id: 3, name: 'logo-dark.svg', type: 'image', size: '12 KB', date: '17 Eki 2025' },

                        +24%      { id: 4, name: 'brochure.pdf', type: 'file', size: '1.8 MB', date: '16 Eki 2025' },

                      </span>    ];

                    </div>

                    <h3 className="font-semibold text-neutral-900 mb-2">Organik Trafik</h3>    return (

                    <div className="text-3xl font-bold text-neutral-900 mb-2">18.5K</div>      <div className="space-y-6">

                    <p className="text-sm text-neutral-600">Bu Ay</p>        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                  </div>          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">

                </div>            <div className="flex items-center justify-between mb-3">

              </div>              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><FileText className="text-blue-600" size={20} /></div>

            )}              <span className="text-xs text-neutral-600 font-medium">Toplam</span>

            </div>

            {/* Analytics Tab */}            <h3 className="text-2xl font-bold text-neutral-900">45</h3>

            {activeTab === 'analytics' && (            <p className="text-sm text-neutral-600">Sayfa</p>

              <div className="space-y-6">          </div>

                <div>          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">

                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İstatistikler</h2>            <div className="flex items-center justify-between mb-3">

                  <p className="text-neutral-600 mb-6">              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><FileEdit className="text-purple-600" size={20} /></div>

                    Detaylı ziyaretçi ve performans analizi.              <span className="text-xs text-neutral-600 font-medium">Blog</span>

                  </p>            </div>

                </div>            <h3 className="text-2xl font-bold text-neutral-900">23</h3>

            <p className="text-sm text-neutral-600">Yazı</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">          </div>

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">

                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">            <div className="flex items-center justify-between mb-3">

                      <Eye className="text-blue-700" size={20} />              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Image className="text-green-600" size={20} /></div>

                    </div>              <span className="text-xs text-neutral-600 font-medium">Medya</span>

                    <h3 className="text-2xl font-bold text-neutral-900">24.5K</h3>            </div>

                    <p className="text-sm text-neutral-600">Sayfa Görüntüleme</p>            <h3 className="text-2xl font-bold text-neutral-900">156</h3>

                  </div>            <p className="text-sm text-neutral-600">Dosya</p>

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">          </div>

                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">

                      <Users className="text-green-700" size={20} />            <div className="flex items-center justify-between mb-3">

                    </div>              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Clock className="text-orange-600" size={20} /></div>

                    <h3 className="text-2xl font-bold text-neutral-900">8.2K</h3>              <span className="text-xs text-neutral-600 font-medium">Taslak</span>

                    <p className="text-sm text-neutral-600">Tekil Ziyaretçi</p>            </div>

                  </div>            <h3 className="text-2xl font-bold text-neutral-900">8</h3>

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">            <p className="text-sm text-neutral-600">Bekliyor</p>

                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">          </div>

                      <Clock className="text-purple-700" size={20} />        </div>

                    </div>

                    <h3 className="text-2xl font-bold text-neutral-900">3:42</h3>        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">

                    <p className="text-sm text-neutral-600">Ort. Süre</p>          <div className="p-6 border-b border-neutral-200">

                  </div>            <div className="flex items-center justify-between">

                  <div className="bg-white rounded-2xl p-4 border border-neutral-200">              <div>

                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-2">                <h3 className="text-lg font-bold text-neutral-900">Sayfalar & Blog</h3>

                      <TrendingUp className="text-orange-700" size={20} />                <p className="text-sm text-neutral-600 mt-1">İçeriklerinizi yönetin ve düzenleyin</p>

                    </div>              </div>

                    <h3 className="text-2xl font-bold text-neutral-900">68%</h3>              <div className="flex items-center gap-3">

                    <p className="text-sm text-neutral-600">Geri Dönüş</p>                <div className="relative">

                  </div>                  <input type="text" placeholder="Ara..." className="pl-4 pr-10 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 text-sm" />

                </div>                  <Search className="absolute right-3 top-2.5 text-neutral-400" size={16} />

              </div>                </div>

            )}                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"><Plus size={16} />Yeni İçerik</button>

          </div>              </div>

        </div>            </div>

      </div>          </div>

    </div>          <div className="overflow-x-auto">

  )            <table className="w-full">

}              <thead>

                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Başlık</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Tür</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Durum</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Görüntülenme</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Yazar</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Son Güncelleme</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4"><div><p className="font-medium text-neutral-900">{page.title}</p><p className="text-xs text-neutral-500">{page.slug}</p></div></td>
                    <td className="p-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${page.type === 'page' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{page.type === 'page' ? <FileText size={12} /> : <FileEdit size={12} />}{page.type === 'page' ? 'Sayfa' : 'Blog'}</span></td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{page.status === 'published' ? '✓ Yayında' : '⏳ Taslak'}</span></td>
                    <td className="p-4"><div className="flex items-center gap-1 text-neutral-700"><Eye size={14} /><span className="text-sm font-medium">{page.views.toLocaleString()}</span></div></td>
                    <td className="p-4"><span className="text-sm text-neutral-700">{page.author}</span></td>
                    <td className="p-4"><div className="flex items-center gap-1 text-neutral-600"><Calendar size={14} /><span className="text-sm">{page.lastUpdated}</span></div></td>
                    <td className="p-4"><div className="flex items-center gap-2"><button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Düzenle"><Edit size={16} className="text-neutral-700" /></button><button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Önizle"><Eye size={16} className="text-neutral-700" /></button><button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Sil"><Trash2 size={16} className="text-red-600" /></button><button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><MoreVertical size={16} className="text-neutral-700" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">5 içerikten 1-5 arası gösteriliyor</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Önceki</button>
              <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Sonraki</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div><h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><Image size={20} />Medya Kütüphanesi</h3><p className="text-sm text-neutral-600 mt-1">Görsel, video ve dosyalarınızı yönetin</p></div>
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"><Plus size={16} />Dosya Yükle</button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 transition-all cursor-pointer group">
                  <div className="flex items-center justify-center h-32 mb-3 bg-white rounded-lg">
                    {item.type === 'image' && <Image size={40} className="text-neutral-400" />}
                    {item.type === 'video' && <Video size={40} className="text-neutral-400" />}
                    {item.type === 'file' && <File size={40} className="text-neutral-400" />}
                  </div>
                  <div className="space-y-1"><p className="text-sm font-medium text-neutral-900 truncate" title={item.name}>{item.name}</p><div className="flex items-center justify-between"><span className="text-xs text-neutral-600">{item.size}</span><span className="text-xs text-neutral-500">{item.date}</span></div></div>
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"><button className="flex-1 py-1.5 bg-neutral-900 text-white rounded-lg text-xs hover:bg-neutral-800">Seç</button><button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button></div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center"><button className="px-6 py-2.5 border border-neutral-300 hover:border-neutral-400 rounded-xl text-sm font-medium transition-colors">Daha Fazla Yükle</button></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"><FileText size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Yeni Sayfa</h3><p className="text-sm text-white/80 mb-4">Boş sayfa oluştur</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Oluştur →</button></div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"><FileEdit size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Yeni Blog Yazısı</h3><p className="text-sm text-white/80 mb-4">Blog içeriği ekle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Yaz →</button></div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"><Image size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Medya Yükle</h3><p className="text-sm text-white/80 mb-4">Görsel/video ekle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Yükle →</button></div>
        </div>
      </div>
    );
  };

  const renderShop = () => {
    const products = [
      { id: 1, name: 'Sony A7 IV Kamera', category: 'Kamera', price: 500, stock: 5, status: 'available', sales: 42, image: '📷' },
      { id: 2, name: 'Canon 24-70mm Lens', category: 'Lens', price: 150, stock: 3, status: 'available', sales: 28, image: '🔭' },
      { id: 3, name: 'DJI Ronin RS3 Gimbal', category: 'Stabilizasyon', price: 300, stock: 2, status: 'low', sales: 15, image: '🎥' },
      { id: 4, name: 'Aputure 300D II Işık', category: 'Işık', price: 200, stock: 4, status: 'available', sales: 31, image: '💡' },
      { id: 5, name: 'Rode Wireless GO II', category: 'Ses', price: 100, stock: 0, status: 'out', sales: 56, image: '🎤' },
    ];

    return (
      <div className="space-y-6">
        {/* Shop Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><ShoppingBag className="text-blue-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Toplam</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">67</h3>
            <p className="text-sm text-neutral-600">Ürün</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="text-green-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Müsait</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">52</h3>
            <p className="text-sm text-neutral-600">Stokta</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><AlertCircle className="text-orange-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Düşük</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">8</h3>
            <p className="text-sm text-neutral-600">Stok Azaldı</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><XCircle className="text-red-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Tükendi</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">7</h3>
            <p className="text-sm text-neutral-600">Stok Yok</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Ürün Yönetimi</h3>
                <p className="text-sm text-neutral-600 mt-1">Kiralama ürünlerinizi ve stoklarınızı yönetin</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input type="text" placeholder="Ürün ara..." className="pl-4 pr-10 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 text-sm" />
                  <Search className="absolute right-3 top-2.5 text-neutral-400" size={16} />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium"><Plus size={16} />Yeni Ürün</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Ürün</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Kategori</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Fiyat</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Stok</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Durum</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">Satışlar</th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">{product.image}</div>
                        <div><p className="font-medium text-neutral-900">{product.name}</p></div>
                      </div>
                    </td>
                    <td className="p-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"><Tag size={12} />{product.category}</span></td>
                    <td className="p-4"><div className="flex items-center gap-1 text-neutral-900"><DollarSign size={14} /><span className="font-semibold">₺{product.price}</span><span className="text-xs text-neutral-500">/gün</span></div></td>
                    <td className="p-4"><div className="flex items-center gap-1"><Box size={14} className="text-neutral-600" /><span className="font-medium text-neutral-900">{product.stock}</span></div></td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === 'available' ? 'bg-green-100 text-green-700' : product.status === 'low' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {product.status === 'available' ? '✓ Müsait' : product.status === 'low' ? '⚠️ Düşük' : '✕ Tükendi'}
                      </span>
                    </td>
                    <td className="p-4"><span className="text-sm font-medium text-neutral-700">{product.sales} kiralama</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Düzenle"><Edit size={16} className="text-neutral-700" /></button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Önizle"><Eye size={16} className="text-neutral-700" /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Sil"><Trash2 size={16} className="text-red-600" /></button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><MoreVertical size={16} className="text-neutral-700" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">5 üründen 1-5 arası gösteriliyor</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Önceki</button>
              <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Sonraki</button>
            </div>
          </div>
        </div>

        {/* Revenue & Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center"><DollarSign className="mr-2 text-green-600" size={20} />Gelir Özeti</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div><p className="text-sm text-neutral-600">Bu Ay</p><p className="text-2xl font-bold text-neutral-900">₺32,450</p></div>
                <div className="text-right"><span className="text-sm text-green-600 font-medium">+18%</span><p className="text-xs text-neutral-500 mt-1">geçen aya göre</p></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div><p className="text-sm text-neutral-600">Geçen Ay</p><p className="text-xl font-bold text-neutral-900">₺27,500</p></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div><p className="text-sm text-neutral-600">Toplam (Yıl)</p><p className="text-xl font-bold text-neutral-900">₺285,600</p></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center"><Calendar className="mr-2 text-blue-600" size={20} />Rezervasyon Durumu</h3>
            <div className="space-y-3">
              {[
                { title: 'Sony A7 IV - Emirhan Y.', date: '20-22 Eki', status: 'active', color: 'bg-blue-500' },
                { title: 'DJI Ronin - Zeynep K.', date: '21-25 Eki', status: 'pending', color: 'bg-yellow-500' },
                { title: 'Canon Lens - Mehmet A.', date: '23-24 Eki', status: 'active', color: 'bg-blue-500' },
                { title: 'Aputure Işık - Ayşe D.', date: '25-27 Eki', status: 'confirmed', color: 'bg-green-500' },
              ].map((reservation, idx) => (
                <div key={idx} className="flex items-start border-l-4 pl-3 py-2" style={{ borderColor: reservation.color.replace('bg-', '#').replace('500', '') }}>
                  <span className={`w-2 h-2 ${reservation.color} rounded-full mr-3 mt-2`}></span>
                  <div className="flex-1"><p className="text-sm font-medium text-neutral-900">{reservation.title}</p><p className="text-xs text-neutral-600">{reservation.date}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"><ShoppingBag size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Yeni Ürün</h3><p className="text-sm text-white/80 mb-4">Kiralama ürünü ekle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Ekle →</button></div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"><Box size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Stok Yönetimi</h3><p className="text-sm text-white/80 mb-4">Stok güncelle</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Yönet →</button></div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white"><Calendar size={32} className="mb-3" /><h3 className="text-lg font-bold mb-2">Rezervasyonlar</h3><p className="text-sm text-white/80 mb-4">Tüm rezervasyonları gör</p><button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Görüntüle →</button></div>
        </div>
      </div>
    );
  };

  const renderEmbed = () => {
    const platforms = [
      { id: 1, name: 'WordPress', icon: '📝', description: 'Plugin ile tam entegrasyon', status: 'active', color: 'from-blue-500 to-blue-600', users: '2.5M+' },
      { id: 2, name: 'Shopify', icon: '🛍️', description: 'E-ticaret mağazanıza ekleyin', status: 'inactive', color: 'from-green-500 to-green-600', users: '1.8M+' },
      { id: 3, name: 'Squarespace', icon: '🎨', description: 'Embed kod ile entegrasyon', status: 'inactive', color: 'from-purple-500 to-purple-600', users: '850K+' },
      { id: 4, name: 'WooCommerce', icon: '🛒', description: 'WordPress e-ticaret eklentisi', status: 'inactive', color: 'from-indigo-500 to-indigo-600', users: '1.2M+' },
      { id: 5, name: 'Webflow', icon: '🌊', description: 'Custom kod entegrasyonu', status: 'inactive', color: 'from-cyan-500 to-cyan-600', users: '450K+' },
      { id: 6, name: 'Custom HTML', icon: '💻', description: 'Kendi sitenize embed edin', status: 'inactive', color: 'from-neutral-700 to-neutral-800', users: 'Sınırsız' },
    ];

    const embedCode = `<!-- Canary Rental Widget -->
<script src="https://canary-rental.com/embed.js"></script>
<div id="canary-widget" 
     data-site-id="YOUR_SITE_ID"
     data-theme="modern"
     data-language="tr">
</div>
<style>
  #canary-widget {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>`;

    return (
      <div className="space-y-6">
        {/* Integration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Plug className="text-green-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Aktif</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">1</h3>
            <p className="text-sm text-neutral-600">Entegrasyon</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Globe className="text-blue-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Toplam</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">6</h3>
            <p className="text-sm text-neutral-600">Platform</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Code className="text-purple-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Kullanım</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">1.2K</h3>
            <p className="text-sm text-neutral-600">API Çağrısı</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><TrendingUp className="text-orange-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Haftalık</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">+24%</h3>
            <p className="text-sm text-neutral-600">Artış</p>
          </div>
        </div>

        {/* Platform Cards */}
        <div>
          <h3 className="text-xl font-bold text-neutral-900 mb-4">Platform Entegrasyonları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div key={platform.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${platform.status === 'active' ? 'border-green-500' : 'border-neutral-200 hover:border-neutral-300'}`}>
                <div className={`bg-gradient-to-br ${platform.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">{platform.icon}</span>
                    {platform.status === 'active' && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        Aktif
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold mb-1">{platform.name}</h4>
                  <p className="text-sm text-white/80">{platform.description}</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Users size={14} />
                      <span>{platform.users} kullanıcı</span>
                    </div>
                    {platform.status === 'active' ? (
                      <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                        <CheckCircle size={14} />
                        Bağlı
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-sm">Bağlı değil</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {platform.status === 'active' ? (
                      <>
                        <button className="flex-1 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">Ayarlar</button>
                        <button className="px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors">Kaldır</button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">Bağlan</button>
                        <button className="px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors" title="Dokümantasyon">
                          <BookOpen size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embed Code Generator */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2"><Code size={20} />Embed Kod Üretici</h3>
                <p className="text-sm text-neutral-600 mt-1">Sitenize eklemek için hazır kod</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium">
                <Copy size={16} />
                Kodu Kopyala
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-neutral-900 rounded-xl p-6 text-neutral-100 font-mono text-sm overflow-x-auto">
              <pre>{embedCode}</pre>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-600 mb-2">Tema</p>
                <select className="w-full p-2 border border-neutral-300 rounded-lg text-sm">
                  <option>Modern</option>
                  <option>Classic</option>
                  <option>Minimal</option>
                </select>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-600 mb-2">Dil</p>
                <select className="w-full p-2 border border-neutral-300 rounded-lg text-sm">
                  <option>Türkçe</option>
                  <option>English</option>
                  <option>Deutsch</option>
                </select>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-600 mb-2">Genişlik</p>
                <select className="w-full p-2 border border-neutral-300 rounded-lg text-sm">
                  <option>1200px</option>
                  <option>100%</option>
                  <option>800px</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <BookOpen size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-2">API Dokümantasyonu</h3>
            <p className="text-sm text-white/80 mb-4">Detaylı API referansı ve örnekler</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              Dokümantasyonu Görüntüle
              <ExternalLink size={14} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <Link2 size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-2">Webhook Ayarları</h3>
            <p className="text-sm text-white/80 mb-4">Real-time bildirimler ve senkronizasyon</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              Webhook Kurulumu
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">🚀 Hızlı Başlangıç</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-neutral-900">Platformunuzu Seçin</p>
                <p className="text-sm text-neutral-600">WordPress, Shopify veya Custom HTML</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-neutral-900">Bağlantıyı Kurun</p>
                <p className="text-sm text-neutral-600">API anahtarınızı oluşturun ve ayarlayın</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-neutral-900">Kodu Yerleştirin</p>
                <p className="text-sm text-neutral-600">Embed kodunu sitenize ekleyin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={16} />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Test Edin ve Yayınlayın</p>
                <p className="text-sm text-neutral-600">Entegrasyonu test edin ve canlıya alın</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApps = () => {
    const categories = [
      { id: 'payments', name: 'Ödeme', icon: <CreditCard size={18} />, count: 8, color: 'bg-green-100 text-green-700' },
      { id: 'email', name: 'E-posta', icon: <Mail size={18} />, count: 12, color: 'bg-blue-100 text-blue-700' },
      { id: 'analytics', name: 'Analitik', icon: <BarChart3 size={18} />, count: 6, color: 'bg-purple-100 text-purple-700' },
      { id: 'design', name: 'Tasarım', icon: <PenTool size={18} />, count: 15, color: 'bg-pink-100 text-pink-700' },
      { id: 'notifications', name: 'Bildirim', icon: <Bell size={18} />, count: 9, color: 'bg-orange-100 text-orange-700' },
      { id: 'social', name: 'Sosyal Medya', icon: <Share2 size={18} />, count: 11, color: 'bg-cyan-100 text-cyan-700' },
    ];

    const apps = [
      { id: 1, name: 'Stripe', category: 'Ödeme', description: 'Online ödeme altyapısı', icon: '💳', rating: 4.9, reviews: 12500, installed: true, popular: true },
      { id: 2, name: 'PayPal', category: 'Ödeme', description: 'Güvenli ödeme sistemi', icon: '💰', rating: 4.7, reviews: 8900, installed: true, popular: true },
      { id: 3, name: 'Google Analytics', category: 'Analitik', description: 'Web analiz araçları', icon: '📊', rating: 4.8, reviews: 15200, installed: true, popular: true },
      { id: 4, name: 'Mailchimp', category: 'E-posta', description: 'E-posta pazarlama platformu', icon: '📧', rating: 4.6, reviews: 6700, installed: false, popular: true },
      { id: 5, name: 'Zapier', category: 'Otomasyon', description: 'İş akışı otomasyonu', icon: '⚡', rating: 4.8, reviews: 9300, installed: false, popular: true },
      { id: 6, name: 'Intercom', category: 'İletişim', description: 'Müşteri destek platformu', icon: '💬', rating: 4.7, reviews: 5400, installed: false, popular: false },
      { id: 7, name: 'Hotjar', category: 'Analitik', description: 'Kullanıcı davranış analizi', icon: '🔥', rating: 4.5, reviews: 4200, installed: false, popular: false },
      { id: 8, name: 'Calendly', category: 'Randevu', description: 'Randevu planlama aracı', icon: '📅', rating: 4.9, reviews: 7800, installed: false, popular: false },
    ];

    return (
      <div className="space-y-6">
        {/* App Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="text-green-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Kurulu</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">3</h3>
            <p className="text-sm text-neutral-600">Uygulama</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Package className="text-blue-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Mevcut</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">61</h3>
            <p className="text-sm text-neutral-600">Market'te</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Star className="text-purple-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Ortalama</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">4.7</h3>
            <p className="text-sm text-neutral-600">Puan</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Download className="text-orange-600" size={20} /></div>
              <span className="text-xs text-neutral-600 font-medium">Bu Ay</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">+8</h3>
            <p className="text-sm text-neutral-600">Yeni Kurulum</p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Kategoriler</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button key={cat.id} className={`p-4 ${cat.color} rounded-xl hover:shadow-md transition-all`}>
                <div className="flex flex-col items-center text-center">
                  {cat.icon}
                  <p className="text-sm font-semibold mt-2">{cat.name}</p>
                  <p className="text-xs mt-1">{cat.count} uygulama</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Installed Apps */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Kurulu Uygulamalar</h3>
              <p className="text-sm text-neutral-600 mt-1">Aktif olarak kullandığınız uygulamalar</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">3 Aktif</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {apps.filter(app => app.installed).map((app) => (
              <div key={app.id} className="p-4 border-2 border-green-500 rounded-xl bg-green-50/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">{app.icon}</div>
                  <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                    <Check size={12} />
                    Aktif
                  </span>
                </div>
                <h4 className="font-bold text-neutral-900 mb-1">{app.name}</h4>
                <p className="text-xs text-neutral-600 mb-3">{app.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-yellow-500" size={12} />
                    <span className="text-xs font-medium">{app.rating}</span>
                  </div>
                  <span className="text-xs text-neutral-500">({app.reviews.toLocaleString()})</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800">Ayarlar</button>
                  <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs hover:bg-neutral-50">Kaldır</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Marketplace */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Uygulama Marketi</h3>
                <p className="text-sm text-neutral-600 mt-1">Yeni uygulamalar keşfedin ve kurun</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input type="text" placeholder="Uygulama ara..." className="pl-4 pr-10 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 text-sm" />
                  <Search className="absolute right-3 top-2.5 text-neutral-400" size={16} />
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apps.filter(app => !app.installed).map((app) => (
                <div key={app.id} className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-md transition-all">
                  {app.popular && (
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles size={12} className="text-yellow-500" />
                      <span className="text-xs text-yellow-600 font-medium">Popüler</span>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl mb-3">{app.icon}</div>
                  <h4 className="font-bold text-neutral-900 mb-1">{app.name}</h4>
                  <p className="text-xs text-neutral-600 mb-2">{app.category}</p>
                  <p className="text-xs text-neutral-600 mb-3">{app.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={12} />
                      <span className="text-xs font-medium">{app.rating}</span>
                    </div>
                    <span className="text-xs text-neutral-500">({app.reviews.toLocaleString()})</span>
                  </div>
                  <button className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors">
                    Kur
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Apps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-lg font-bold mb-2">Stripe Connect</h3>
            <p className="text-sm text-white/80 mb-4">Küresel ödeme altyapısı - Ücretsiz başlayın</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Şimdi Kur →</button>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-2">Google Analytics 4</h3>
            <p className="text-sm text-white/80 mb-4">Gelişmiş web analizi - Ücretsiz</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Şimdi Kur →</button>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-lg font-bold mb-2">Mailchimp Pro</h3>
            <p className="text-sm text-white/80 mb-4">E-posta pazarlama - 14 gün deneme</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Şimdi Kur →</button>
          </div>
        </div>
      </div>
    );
  };

  const renderSEO = () => {
    return (
      <div className="space-y-6">
        {/* SEO Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Target className="text-green-600" size={20} /></div>
              <span className="text-xs text-green-600 font-medium">Mükemmel</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">87/100</h3>
            <p className="text-sm text-neutral-600">SEO Skoru</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Activity className="text-blue-600" size={20} /></div>
              <span className="text-xs text-blue-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">95/100</h3>
            <p className="text-sm text-neutral-600">Sayfa Hızı</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Shield className="text-purple-600" size={20} /></div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check size={12} />Aktif</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">SSL</h3>
            <p className="text-sm text-neutral-600">Sertifika</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Megaphone className="text-orange-600" size={20} /></div>
              <span className="text-xs text-orange-600 font-medium">+24%</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">3</h3>
            <p className="text-sm text-neutral-600">Aktif Kampanya</p>
          </div>
        </div>

        {/* SEO Score Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">SEO Skor Analizi</h3>
              <p className="text-sm text-neutral-600 mt-1">Web sitenizin SEO performansı</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-3xl font-bold text-neutral-900">87</div>
                <div className="text-xs text-neutral-600">/ 100</div>
              </div>
              <div className="w-20 h-20 relative">
                <svg className="transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${87}, 100`} strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">Meta Etiketler</span>
                <span className="text-sm font-bold text-green-600">95/100</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">İçerik Kalitesi</span>
                <span className="text-sm font-bold text-green-600">88/100</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">Teknik SEO</span>
                <span className="text-sm font-bold text-yellow-600">75/100</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">Backlink Profili</span>
                <span className="text-sm font-bold text-green-600">92/100</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Tags Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileCode className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Meta Etiketler</h3>
                <p className="text-xs text-neutral-600">SEO için önemli meta bilgiler</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Site Başlığı</label>
                <input type="text" defaultValue="Canary Rental - Profesyonel Ekipman Kiralama" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 text-sm" />
                <p className="text-xs text-neutral-500 mt-1">48/60 karakter</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Meta Açıklama</label>
                <textarea rows={3} defaultValue="Fotoğraf ve video çekimleriniz için profesyonel ekipman kiralama hizmeti. Kamera, lens, ışık ve ses ekipmanları." className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 text-sm" />
                <p className="text-xs text-neutral-500 mt-1">142/160 karakter</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Anahtar Kelimeler</label>
                <input type="text" defaultValue="ekipman kiralama, kamera kiralama, video ekipmanı" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 text-sm" />
              </div>
              <button className="w-full py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Sitemap & Robots</h3>
                <p className="text-xs text-neutral-600">Arama motorları için yapılandırma</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-neutral-900">Sitemap.xml</span>
                  </div>
                  <span className="text-xs text-green-600">Aktif</span>
                </div>
                <p className="text-xs text-neutral-600 mb-3">Son güncelleme: 2 saat önce</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs hover:bg-neutral-50">Görüntüle</button>
                  <button className="flex-1 py-1.5 bg-neutral-900 text-white rounded-lg text-xs hover:bg-neutral-800">Yenile</button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Check className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-neutral-900">Robots.txt</span>
                  </div>
                  <span className="text-xs text-blue-600">Yapılandırıldı</span>
                </div>
                <p className="text-xs text-neutral-600 mb-3">Tüm arama motorlarına açık</p>
                <button className="w-full py-1.5 bg-white border border-neutral-300 rounded-lg text-xs hover:bg-neutral-50">Düzenle</button>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="text-purple-600" size={16} />
                    <span className="text-sm font-medium text-neutral-900">SSL Sertifikası</span>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1"><Check size={12} />Güvenli</span>
                </div>
                <p className="text-xs text-neutral-600 mb-1">Sertifika: Let's Encrypt</p>
                <p className="text-xs text-neutral-500">Geçerlilik: 89 gün</p>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Integrations */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900">Pazarlama Entegrasyonları</h3>
            <p className="text-sm text-neutral-600 mt-1">Reklam platformları ve analitik araçları</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">📊</div>
                  <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                    <Check size={12} />
                    Aktif
                  </span>
                </div>
                <h4 className="font-bold text-neutral-900 mb-1">Google Analytics</h4>
                <p className="text-xs text-neutral-600 mb-3">Tracking ID: G-XXXXXXXXXX</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800">Ayarlar</button>
                  <button className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs hover:bg-white">Kaldır</button>
                </div>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300">
                <div className="text-2xl mb-3">📢</div>
                <h4 className="font-bold text-neutral-900 mb-1">Google Ads</h4>
                <p className="text-xs text-neutral-600 mb-3">Conversion tracking & remarketing</p>
                <button className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800">
                  Bağla
                </button>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300">
                <div className="text-2xl mb-3">👤</div>
                <h4 className="font-bold text-neutral-900 mb-1">Facebook Pixel</h4>
                <p className="text-xs text-neutral-600 mb-3">Retargeting & conversion tracking</p>
                <button className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800">
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Speed Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Sayfa Hızı Analizi</h3>
              <p className="text-sm text-neutral-600 mt-1">Core Web Vitals ve performans metrikleri</p>
            </div>
            <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <Activity size={16} />
              Yeniden Test Et
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-xs text-neutral-600 mb-2">First Contentful Paint</div>
              <div className="text-2xl font-bold text-green-600 mb-1">0.8s</div>
              <div className="flex items-center gap-1">
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-xs text-neutral-600 mb-2">Largest Contentful Paint</div>
              <div className="text-2xl font-bold text-green-600 mb-1">1.2s</div>
              <div className="flex items-center gap-1">
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="text-xs text-neutral-600 mb-2">Cumulative Layout Shift</div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">0.15</div>
              <div className="flex items-center gap-1">
                <div className="w-full bg-yellow-200 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-xs text-neutral-600 mb-2">Time to Interactive</div>
              <div className="text-2xl font-bold text-green-600 mb-1">1.8s</div>
              <div className="flex items-center gap-1">
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">SEO Optimizasyonu</h3>
            <p className="text-sm text-white/80 mb-4">Meta etiketlerini ve içeriği optimize edin</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Optimize Et →</button>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Megaphone size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Kampanya Oluştur</h3>
            <p className="text-sm text-white/80 mb-4">Yeni pazarlama kampanyası başlatın</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Oluştur →</button>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Raporları Görüntüle</h3>
            <p className="text-sm text-white/80 mb-4">Detaylı SEO ve trafik raporları</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Raporlar →</button>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    // Visitor trend data (30 days)
    const visitorData = [
      { date: '1 Eki', visitors: 420, users: 340 },
      { date: '3 Eki', visitors: 510, users: 410 },
      { date: '5 Eki', visitors: 680, users: 520 },
      { date: '7 Eki', visitors: 590, users: 480 },
      { date: '9 Eki', visitors: 720, users: 580 },
      { date: '11 Eki', visitors: 650, users: 530 },
      { date: '13 Eki', visitors: 880, users: 690 },
      { date: '15 Eki', visitors: 920, users: 740 },
      { date: '17 Eki', visitors: 1050, users: 850 },
      { date: '19 Eki', visitors: 980, users: 790 },
    ];

    // Traffic sources data
    const trafficData = [
      { name: 'Direkt', value: 35, color: '#3b82f6' },
      { name: 'Organik', value: 28, color: '#22c55e' },
      { name: 'Sosyal Medya', value: 22, color: '#a855f7' },
      { name: 'Referans', value: 15, color: '#f97316' },
    ];

    // Popular pages data
    const pagesData = [
      { page: 'Ana Sayfa', views: 12500 },
      { page: 'Ürünler', views: 8900 },
      { page: 'Hakkımızda', views: 6200 },
      { page: 'İletişim', views: 4800 },
      { page: 'Blog', views: 3600 },
    ];

    // Conversion funnel data
    const funnelData = [
      { stage: 'Ziyaret', count: 10000, percentage: 100 },
      { stage: 'Ürün İnceleme', count: 6500, percentage: 65 },
      { stage: 'Sepete Ekleme', count: 2800, percentage: 28 },
      { stage: 'Ödeme', count: 1200, percentage: 12 },
    ];

    return (
      <div className="space-y-6">
        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users className="text-blue-600" size={20} /></div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1"><ArrowUpRight size={12} />+24%</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">42.5K</h3>
            <p className="text-sm text-neutral-600">Toplam Ziyaretçi</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Eye className="text-green-600" size={20} /></div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1"><ArrowUpRight size={12} />+18%</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">128K</h3>
            <p className="text-sm text-neutral-600">Sayfa Görüntüleme</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Clock className="text-purple-600" size={20} /></div>
              <span className="text-xs text-red-600 font-medium flex items-center gap-1"><ArrowDownRight size={12} />-5%</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">3:24</h3>
            <p className="text-sm text-neutral-600">Ort. Oturum Süresi</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Target className="text-orange-600" size={20} /></div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1"><ArrowUpRight size={12} />+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">12%</h3>
            <p className="text-sm text-neutral-600">Dönüşüm Oranı</p>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Canlı İstatistikler</h3>
              <p className="text-sm text-neutral-600 mt-1">Son 30 dakika</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-900">147 Aktif Kullanıcı</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-neutral-600 mb-1">Sayfa Görüntüleme</div>
              <div className="text-2xl font-bold text-blue-600">234</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-sm text-neutral-600 mb-1">Yeni Oturumlar</div>
              <div className="text-2xl font-bold text-green-600">89</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-sm text-neutral-600 mb-1">Dönüşümler</div>
              <div className="text-2xl font-bold text-purple-600">12</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="text-sm text-neutral-600 mb-1">Ortalama Süre</div>
              <div className="text-2xl font-bold text-orange-600">2:45</div>
            </div>
          </div>
        </div>

        {/* Visitor Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Ziyaretçi Trendi</h3>
              <p className="text-sm text-neutral-600 mt-1">Son 30 günlük ziyaretçi istatistikleri</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">7 Gün</button>
              <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm font-medium">30 Gün</button>
              <button className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium">90 Gün</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={visitorData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" name="Ziyaretçiler" />
              <Area type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="Kullanıcılar" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources & Popular Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traffic Sources Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-neutral-900">Trafik Kaynakları</h3>
              <p className="text-sm text-neutral-600 mt-1">Ziyaretçi dağılımı</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {trafficData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{item.name}</div>
                    <div className="text-xs text-neutral-600">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Pages Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-neutral-900">Popüler Sayfalar</h3>
              <p className="text-sm text-neutral-600 mt-1">En çok görüntülenen sayfalar</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pagesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis dataKey="page" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="views" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Görüntülenme" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Dönüşüm Hunisi</h3>
              <p className="text-sm text-neutral-600 mt-1">Kullanıcı yolculuğu analizi</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">%12 Dönüşüm</span>
          </div>
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === 1 ? 'bg-green-100 text-green-600' :
                      index === 2 ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-neutral-900">{stage.count.toLocaleString()}</span>
                    <span className="text-sm text-neutral-600">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <FileDown size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">PDF Raporu</h3>
            <p className="text-sm text-white/80 mb-4">Detaylı analitik rapor oluştur ve indir</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">PDF İndir →</button>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <FileDown size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Excel Export</h3>
            <p className="text-sm text-white/80 mb-4">Ham verileri Excel formatında dışa aktar</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Excel İndir →</button>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Otomatik Rapor</h3>
            <p className="text-sm text-white/80 mb-4">Haftalık raporu e-posta ile al</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Planla →</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">Web Sitesi</h1>
              <p className="text-xs text-neutral-600">Yönetim Paneli</p>
            </div>
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm font-medium">
            <Plus size={16} />
            Yeni Site
          </button>
        </div>


        {/* Tabs Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-lg'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-neutral-600'}>
                  {tab.icon}
                </span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 text-center">
            <p>Canary Digital</p>
            <p className="mt-1">Web Platform v2.0</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-neutral-600">
              {activeTab === 'dashboard' && 'Web sitenizin genel durumunu ve performansını görüntüleyin'}
              {activeTab === 'builder' && 'Site tasarımınızı oluşturun ve özelleştirin'}
              {activeTab === 'cms' && 'İçeriklerinizi oluşturun ve yönetin'}
              {activeTab === 'shop' && 'Ürünlerinizi ve rezervasyonlarınızı yönetin'}
              {activeTab === 'embed' && 'Sitenizi farklı platformlara entegre edin'}
              {activeTab === 'apps' && 'Üçüncü parti uygulamaları kurun ve yönetin'}
              {activeTab === 'seo' && 'SEO ve pazarlama araçlarınızı yönetin'}
              {activeTab === 'analytics' && 'Detaylı istatistikleri ve raporları görüntüleyin'}
            </p>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Website;