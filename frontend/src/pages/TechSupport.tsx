import { useState } from 'react'
import { Book, MessageCircle, Phone, Mail, FileText, Video, ChevronRight, Bot, Headphones, HelpCircle, GraduationCap } from 'lucide-react'

type Tab = 'guides' | 'support' | 'videos' | 'faq'

export default function TechSupport() {
  const [activeTab, setActiveTab] = useState<Tab>('guides')
  
  const tabs = [
    { id: 'guides' as Tab, label: 'Kullanım Kılavuzu', icon: <Book size={18} />, description: 'Detaylı kullanım rehberleri' },
    { id: 'support' as Tab, label: 'Canlı Destek', icon: <Headphones size={18} />, description: 'Destek kanalları' },
    { id: 'videos' as Tab, label: 'Video Eğitimler', icon: <GraduationCap size={18} />, description: 'Görsel eğitimler' },
    { id: 'faq' as Tab, label: 'SSS', icon: <HelpCircle size={18} />, description: 'Sık sorulan sorular' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">12</h3>
          <p className="text-sm text-neutral-600">Açık Destek Talebi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <FileText className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Toplam</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">48</h3>
          <p className="text-sm text-neutral-600">Kılavuz Makalesi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Video className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Eğitim</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">24</h3>
          <p className="text-sm text-neutral-600">Video Eğitim</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Headphones className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">7/24</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">Online</h3>
          <p className="text-sm text-neutral-600">Canlı Destek</p>
        </div>
      </div>

      {/* Tab Navigation & Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-neutral-200 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p className={`text-xs ml-7 ${activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {tab.description}
                </p>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'guides' && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4 flex items-center gap-2">
                  <Book className="text-neutral-700" size={24} />
                  Kullanım Kılavuzu
                </h2>
          <div className="space-y-3">
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Başlangıç Rehberi</h3>
                  <p className="text-sm text-neutral-600">Sistemi kullanmaya başlayın</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Sipariş Yönetimi</h3>
                  <p className="text-sm text-neutral-600">Sipariş oluşturma ve takip</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Envanter Yönetimi</h3>
                  <p className="text-sm text-neutral-600">Ekipman ekleme ve düzenleme</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Müşteri Yönetimi</h3>
                  <p className="text-sm text-neutral-600">Müşteri kayıtları ve işlemleri</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Raporlama</h3>
                  <p className="text-sm text-neutral-600">Rapor alma ve analiz</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">İnsan Kaynakları</h3>
                  <p className="text-sm text-neutral-600">Çalışan ve personel yönetimi</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Muhasebe & Finans</h3>
                  <p className="text-sm text-neutral-600">Fatura ve ödeme işlemleri</p>
                </div>
                <ChevronRight className="text-neutral-400 group-hover:text-neutral-700" size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">Destek Kanalları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-6 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Bot className="text-neutral-700" size={24} />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">AI Asistan</h3>
            <p className="text-sm text-neutral-600 mb-4">7/24 yapay zeka destekli yardım</p>
            <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
              Sohbet Başlat
            </button>
          </div>
          
          <div className="text-center p-6 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="text-neutral-700" size={24} />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Canlı Sohbet</h3>
            <p className="text-sm text-neutral-600 mb-4">Teknik ekibimizle görüşün</p>
            <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
              Mesaj Gönder
            </button>
          </div>

          <div className="text-center p-6 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Phone className="text-neutral-700" size={24} />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Telefon</h3>
            <p className="text-sm text-neutral-600 mb-4">+90 (555) 123 45 67</p>
            <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
              Ara
            </button>
          </div>

          <div className="text-center p-6 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="text-neutral-700" size={24} />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">E-posta</h3>
            <p className="text-sm text-neutral-600 mb-4">destek@canary.com</p>
            <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
              Mail Gönder
            </button>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Video Eğitimler</h2>
            <button className="text-neutral-700 hover:text-neutral-900 text-sm font-medium">
              Tümünü Gör →
            </button>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-neutral-100 h-40 flex items-center justify-center">
              <Video className="text-neutral-400" size={48} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Sisteme Giriş ve İlk Adımlar</h3>
              <p className="text-sm text-neutral-600 mb-3">Süre: 8:24</p>
              <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                İzle
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-neutral-100 h-40 flex items-center justify-center">
              <Video className="text-neutral-400" size={48} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Sipariş Oluşturma ve Yönetimi</h3>
              <p className="text-sm text-neutral-600 mb-3">Süre: 12:15</p>
              <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                İzle
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-neutral-100 h-40 flex items-center justify-center">
              <Video className="text-neutral-400" size={48} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Envanter ve Ekipman Yönetimi</h3>
              <p className="text-sm text-neutral-600 mb-3">Süre: 10:42</p>
              <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                İzle
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-neutral-100 h-40 flex items-center justify-center">
              <Video className="text-neutral-400" size={48} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">Müşteri Yönetimi ve CRM</h3>
              <p className="text-sm text-neutral-600 mb-3">Süre: 9:30</p>
              <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                İzle
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4">Sıkça Sorulan Sorular</h2>
          <div className="space-y-3">
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">Şifremi nasıl değiştiririm?</h3>
              <p className="text-sm text-neutral-600">Profil → Güvenlik → Şifre Değiştir menüsünden şifrenizi güncelleyebilirsiniz.</p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">QR kod nasıl oluşturulur?</h3>
              <p className="text-sm text-neutral-600">Envanter sayfasından ekipman seçin ve "QR Kod Oluştur" butonuna tıklayın.</p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">Rapor nasıl alırım?</h3>
              <p className="text-sm text-neutral-600">Raporlar bölümünden istediğiniz rapor türünü seçip indirebilirsiniz.</p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">Toplu ekipman nasıl eklenir?</h3>
              <p className="text-sm text-neutral-600">Envanter → Toplu İşlem → Excel İçe Aktar ile birden fazla ekipman ekleyebilirsiniz.</p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">Müşteri eklerken hangi bilgiler gerekli?</h3>
              <p className="text-sm text-neutral-600">Ad, soyad, telefon ve e-posta bilgileri zorunludur. Diğer bilgileri isteğe bağlı ekleyebilirsiniz.</p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">Fatura nasıl oluşturulur?</h3>
              <p className="text-sm text-neutral-600">Siparişler sayfasından ilgili siparişi seçip "Fatura Oluştur" butonuna tıklayın.</p>
            </div>
            <div className="border border-neutral-200 rounded-xl p-4">
              <h3 className="font-medium text-neutral-900 mb-2">Yedekleme ne sıklıkla yapılıyor?</h3>
              <p className="text-sm text-neutral-600">Sistem otomatik olarak günlük yedekleme yapmaktadır. Manuel yedekleme için Araçlar → Yedekleme menüsünü kullanabilirsiniz.</p>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
