import { useState } from 'react'
import {
  Calendar, BarChart3, MessageCircle, Megaphone, 
  Ear, Image, Users, Clock, TrendingUp, Target,
  Send, CheckCircle, Edit3, Zap
} from 'lucide-react'

type Tab = 'planning' | 'analytics' | 'community' | 'ads' | 'listening' | 'design' | 'team'

export default function Social() {
  const [activeTab, setActiveTab] = useState<Tab>('planning')

  const tabs = [
    { id: 'planning' as const, label: 'Planlama ve Otomasyon', icon: <Calendar size={18} />, description: 'Gönderileri planla ve otomatikleştir' },
    { id: 'analytics' as const, label: 'Analiz ve Raporlama', icon: <BarChart3 size={18} />, description: 'Performans ve etkileşim analizi' },
    { id: 'community' as const, label: 'Topluluk Yönetimi', icon: <MessageCircle size={18} />, description: 'Etkileşim ve mesaj yönetimi' },
    { id: 'ads' as const, label: 'Reklam Yönetimi', icon: <Megaphone size={18} />, description: 'Kampanya oluştur ve yönet' },
    { id: 'listening' as const, label: 'Sosyal Dinleme', icon: <Ear size={18} />, description: 'Marka takibi ve analizi' },
    { id: 'design' as const, label: 'İçerik Üretimi', icon: <Image size={18} />, description: 'Görsel ve video tasarımı' },
    { id: 'team' as const, label: 'Ekip Çalışması', icon: <Users size={18} />, description: 'İşbirliği ve onay süreçleri' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Bu Hafta</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">24</h3>
          <p className="text-sm text-neutral-600">Planlanan Gönderi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">+15.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">45.2K</h3>
          <p className="text-sm text-neutral-600">Toplam Etkileşim</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Bekleyen</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">18</h3>
          <p className="text-sm text-neutral-600">Yanıtlanacak Mesaj</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Target className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-600 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">5</h3>
          <p className="text-sm text-neutral-600">Reklam Kampanyası</p>
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 px-4 py-4 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="mt-0.5">{tab.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Planning Tab */}
            {activeTab === 'planning' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Planlama ve Otomasyon Araçları</h2>
                  <p className="text-neutral-600 mb-6">
                    Sosyal medya gönderilerinizi önceden planlayın, sıraya alın ve belirli zamanlarda otomatik olarak paylaşın.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">İçerik Takvimi</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Gönderilerinizi görsel takvim üzerinde planlayın ve düzenleyin
                    </p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Takvimi Aç
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Clock className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Otomatik Paylaşım</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Belirlediğiniz saatlerde gönderileri otomatik olarak paylaşın
                    </p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Zamanlayıcı Ayarla
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Send className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Toplu Gönderi</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Tek seferde birden fazla platforma gönderi planlayın
                    </p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Gönderi Oluştur
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Zap className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Hızlı Gönderi</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Anlık gönderi oluşturun ve tüm hesaplara dağıtın
                    </p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Hemen Paylaş
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Analiz ve Raporlama Araçları</h2>
                  <p className="text-neutral-600 mb-6">
                    Gönderi performanslarını, etkileşim oranlarını ve takipçi davranışlarını ölçün.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Etkileşim Oranı</h3>
                      <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-2">4.8%</p>
                    <p className="text-sm text-green-600">+0.8% geçen aya göre</p>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Takipçi Artışı</h3>
                      <Users className="text-neutral-700" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-2">+1,234</p>
                    <p className="text-sm text-neutral-600">Bu ay</p>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">En İyi Gönderi</h3>
                      <Target className="text-neutral-700" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 mb-2">12.4K</p>
                    <p className="text-sm text-neutral-600">Toplam erişim</p>
                  </div>
                </div>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Topluluk ve Etkileşim Yönetimi</h2>
                  <p className="text-neutral-600 mb-6">
                    Yorumlara, mesajlara ve kullanıcı etkileşimlerine tek panelden yanıt vererek topluluk yönetimini kolaylaştırın.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <MessageCircle className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Mesaj Kutusu</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">Tüm platformlardan gelen mesajlar</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-neutral-900">18</span>
                      <span className="text-sm text-red-600 font-medium">Bekleyen</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Mesajları Görüntüle
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Edit3 className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Yorum Yönetimi</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">Gönderi yorumlarını yönetin</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-neutral-900">42</span>
                      <span className="text-sm text-orange-600 font-medium">Yeni</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Yorumları İncele
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ads Tab */}
            {activeTab === 'ads' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Reklam Yönetimi Araçları</h2>
                  <p className="text-neutral-600 mb-6">
                    Sosyal medya reklam kampanyalarını oluşturun, yönetin ve performanslarını analiz edin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-2">Kampanya Oluştur</h3>
                    <p className="text-sm text-neutral-600 mb-4">Yeni reklam kampanyası başlatın</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Kampanya Başlat
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-2">Hedef Kitle</h3>
                    <p className="text-sm text-neutral-600 mb-4">Detaylı hedef kitle oluşturun</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Kitle Tanımla
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-2">Bütçe Yönetimi</h3>
                    <p className="text-sm text-neutral-600 mb-4">Reklam bütçenizi optimize edin</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Bütçe Ayarla
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Listening Tab */}
            {activeTab === 'listening' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Sosyal Dinleme ve Marka Takip</h2>
                  <p className="text-neutral-600 mb-6">
                    Marka itibarı, rakipler veya belirli anahtar kelimeler hakkında sosyal medyadaki paylaşımları izleyin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Ear className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Marka Bahsedilmeleri</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">Markanızdan bahsedenleri izleyin</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-neutral-900">342</span>
                      <span className="text-sm text-neutral-600 ml-2">Bu hafta</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Bahsedilmeleri Gör
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Target className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Anahtar Kelime Takibi</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">Önemli kelimeleri izleyin</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-neutral-900">12</span>
                      <span className="text-sm text-neutral-600 ml-2">Aktif kelime</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Kelime Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Tasarım ve İçerik Üretim Araçları</h2>
                  <p className="text-neutral-600 mb-6">
                    Görsel, video veya animasyon gibi sosyal medya içeriklerini hızlı ve profesyonel biçimde üretin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                        <Image className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Görsel Tasarım</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">Profesyonel görseller oluşturun</p>
                    <button className="w-full bg-violet-600 text-white py-2 rounded-xl hover:bg-violet-700 transition-colors">
                      Tasarım Başlat
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                        <Image className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Video Editörü</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">Sosyal medya videoları düzenleyin</p>
                    <button className="w-full bg-rose-600 text-white py-2 rounded-xl hover:bg-rose-700 transition-colors">
                      Video Oluştur
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Zap className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Şablon Galerisi</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">Hazır şablonlardan seçim yapın</p>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Şablonlar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Ekip Çalışması ve Onay Süreci</h2>
                  <p className="text-neutral-600 mb-6">
                    Birden fazla kişinin çalıştığı sosyal medya ekiplerinde görev paylaşımı, onay ve işbirliği süreçlerini yönetin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Users className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Ekip Üyeleri</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">Ekip üyelerini ve rollerini yönetin</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-neutral-900">8</span>
                      <span className="text-sm text-neutral-600 ml-2">Aktif üye</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Üye Yönetimi
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Onay Bekleyenler</h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">Onayınızı bekleyen içerikler</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-neutral-900">5</span>
                      <span className="text-sm text-neutral-600 ml-2">Bekleyen</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      Onay Listesi
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
