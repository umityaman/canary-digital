import { useState } from 'react'
import {
  Users, TrendingUp, Megaphone, DollarSign, Headphones,
  MessageSquare, BarChart3, UserPlus, Target, Mail, Phone,
  Calendar, FileText, AlertCircle, Settings, Clock, Award
} from 'lucide-react'

type Tab = 'crm' | 'sales' | 'marketing' | 'finance' | 'support' | 'interaction' | 'reporting'

export default function CustomerService() {
  const [activeTab, setActiveTab] = useState<Tab>('crm')

  const tabs = [
    { id: 'crm' as const, label: 'Temel CRM', icon: <Users size={18} />, description: 'Müşteri kartları ve iletişim yönetimi' },
    { id: 'sales' as const, label: 'Satış Yönetimi', icon: <TrendingUp size={18} />, description: 'Fırsatlar, teklifler ve hedefler' },
    { id: 'marketing' as const, label: 'Pazarlama Yönetimi', icon: <Megaphone size={18} />, description: 'Kampanyalar ve lead takibi' },
    { id: 'finance' as const, label: 'Finans ve Faturalama', icon: <DollarSign size={18} />, description: 'Fatura ve tahsilat yönetimi' },
    { id: 'support' as const, label: 'Destek / Teknik Servis', icon: <Headphones size={18} />, description: 'Ticket ve servis takibi' },
    { id: 'interaction' as const, label: 'Müşteri Etkileşimi', icon: <MessageSquare size={18} />, description: 'İletişim kanalları yönetimi' },
    { id: 'reporting' as const, label: 'Raporlama ve Analitik', icon: <BarChart3 size={18} />, description: 'Performans ve KPI raporları' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">1,234</h3>
          <p className="text-sm text-gray-600">Toplam Müşteri</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">₺125,450</h3>
          <p className="text-sm text-gray-600">Satış Tutarı</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Headphones className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Bekleyen</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">23</h3>
          <p className="text-sm text-gray-600">Destek Talebi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Target className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Pipeline</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">42</h3>
          <p className="text-sm text-gray-600">Aktif Fırsat</p>
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-72 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start space-x-3 px-4 py-4 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-gray-700 hover:bg-neutral-50 hover:text-gray-900'
                }`}
              >
                <div className="mt-0.5">{tab.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-neutral-300' : 'text-gray-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* CRM Tab */}
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Temel CRM</h2>
                  <p className="text-gray-600 mb-6">Müşteri kartları, iletişim geçmişi ve görev yönetimi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Users className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Müşteri Kartları</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Detaylı müşteri profilleri ve bilgileri</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Müşterileri Görüntüle
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <MessageSquare className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">İletişim Geçmişi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Tüm müşteri etkileşimlerini kaydedin</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Geçmiş İncele
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Görev & Hatırlatma</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Görevlerinizi planlayın ve takip edin</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Görevleri Yönet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Satış Yönetimi</h2>
                  <p className="text-gray-600 mb-6">Satış fırsatları, teklif takibi ve hedef yönetimi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Target className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Satış Fırsatları</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Pipeline yönetimi ve fırsat takibi</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Pipeline Görüntüle
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Teklif & Sipariş</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Teklif oluşturma ve sipariş takibi</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Teklifleri Yönet
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <TrendingUp className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Satış Tahmini</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Hedef belirleme ve tahmin raporları</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Tahminleri Gör
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Marketing Tab */}
            {activeTab === 'marketing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Pazarlama Yönetimi</h2>
                  <p className="text-gray-600 mb-6">Kampanya yönetimi, e-posta/SMS pazarlama ve lead takibi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Megaphone className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Kampanya Yönetimi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Pazarlama kampanyaları oluşturun ve yönetin</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Kampanya Oluştur
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Mail className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">E-posta / SMS</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Toplu e-posta ve SMS gönderimi</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Mesaj Gönder
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <UserPlus className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Lead Takibi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Potansiyel müşterileri yönetin</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Lead Listesi
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Users className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Segmentasyon</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Müşteri grupları oluşturun</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Segment Yönet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Finance Tab */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Finans ve Faturalama</h2>
                  <p className="text-gray-600 mb-6">Tekliften faturaya, tahsilat ve ödeme takibi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Fatura Yönetimi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Tekliften faturaya otomatik geçiş</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Fatura Oluştur
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Tahsilat Takibi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Ödeme ve tahsilat yönetimi</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Tahsilatlar
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Finansal Raporlar</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Gelir-gider ve kâr raporları</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Raporları Gör
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Destek / Teknik Servis</h2>
                  <p className="text-gray-600 mb-6">Destek talepleri, servis kayıtları ve SLA takibi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <AlertCircle className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Destek Talepleri</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Ticket sistemi yönetimi</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">23</span>
                      <span className="text-sm text-gray-600 ml-2">Açık ticket</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Talepleri Görüntüle
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Settings className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Servis Kayıtları</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Bakım ve onarım takibi</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">8</span>
                      <span className="text-sm text-gray-600 ml-2">Devam eden</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Servis Listesi
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Clock className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">SLA Takibi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Hizmet seviyesi anlaşmaları</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">98%</span>
                      <span className="text-sm text-gray-600 ml-2">Uyum oranı</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      SLA Raporları
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interaction Tab */}
            {activeTab === 'interaction' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Müşteri Etkileşimi</h2>
                  <p className="text-gray-600 mb-6">E-posta, telefon, WhatsApp entegrasyonu ve randevu yönetimi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Mail className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">E-posta</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">E-posta entegrasyonu ve takip</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      E-posta Gelen Kutusu
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Phone className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Telefon</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Çağrı merkezi yönetimi</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Çağrı Geçmişi
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <MessageSquare className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">WhatsApp Business entegrasyonu</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Mesajlar
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Randevu</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Randevu ve toplantı planlama</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Takvim
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <Headphones className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Çağrı Merkezi</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Çağrı yönetimi ve raporlama</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Merkez Paneli
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                        <MessageSquare className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-gray-900">Canlı Sohbet</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Web sitesi canlı destek</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Sohbet Başlat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reporting Tab */}
            {activeTab === 'reporting' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Raporlama ve Analitik</h2>
                  <p className="text-gray-600 mb-6">Satış, performans raporları ve KPI takibi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Satış Performansı</h3>
                      <BarChart3 className="text-neutral-700" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">₺125K</p>
                    <p className="text-sm text-green-600">+15% bu ay</p>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Müşteri Memnuniyeti</h3>
                      <Award className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">4.8/5</p>
                    <p className="text-sm text-green-600">+0.3 puan</p>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Yanıt Süresi</h3>
                      <Clock className="text-purple-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">2.3h</p>
                    <p className="text-sm text-green-600">-15% daha hızlı</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">Satış Raporları</h3>
                    <p className="text-sm text-gray-600 mb-4">Detaylı satış analizi ve tahmin raporları</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Rapor Oluştur
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">Gerçek Zamanlı Panel</h3>
                    <p className="text-sm text-gray-600 mb-4">Canlı metrikler ve performans göstergeleri</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Dashboard Aç
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">KPI Yönetimi</h3>
                    <p className="text-sm text-gray-600 mb-4">Performans göstergeleri takibi</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      KPI Görüntüle
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">Özel Raporlar</h3>
                    <p className="text-sm text-gray-600 mb-4">Kişiselleştirilmiş rapor şablonları</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Rapor Tasarla
                    </button>
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