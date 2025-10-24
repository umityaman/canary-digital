import { useState } from 'react';
import { MessageCircle, Users, Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Archive, Settings } from 'lucide-react';

type Tab = 'chats' | 'groups' | 'archived' | 'settings';

export default function Messaging(){
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>('Genel');

  const tabs = [
    { id: 'chats' as const, label: 'Sohbetler', icon: <MessageCircle size={18} />, description: 'Birebir konuşmalar' },
    { id: 'groups' as const, label: 'Gruplar', icon: <Users size={18} />, description: 'Grup sohbetleri' },
    { id: 'archived' as const, label: 'Arşiv', icon: <Archive size={18} />, description: 'Arşivlenmiş mesajlar' },
    { id: 'settings' as const, label: 'Ayarlar', icon: <Settings size={18} />, description: 'Mesajlaşma ayarları' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Sohbet</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Toplam</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">5</h3>
          <p className="text-sm text-neutral-600">Grup</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Send className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bugün</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">127</h3>
          <p className="text-sm text-neutral-600">Mesaj</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Archive className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Arşiv</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">12</h3>
          <p className="text-sm text-neutral-600">Sohbet</p>
        </div>
      </div>

      {/* Tab Navigation + Content */}
      <div className="flex gap-6">
        {/* Vertical Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p
                  className={`text-xs ml-7 ${
                    activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'chats' && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="grid grid-cols-3 h-[600px]">
                {/* Chat List */}
                <div className="border-r border-neutral-200">
                  <div className="p-4 border-b border-neutral-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        placeholder="Ara..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto h-[calc(600px-73px)]">
                    {['Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Zeynep Şahin', 'Ali Çelik'].map((name, idx) => (
                      <div
                        key={name}
                        onClick={() => setSelectedChat(name)}
                        className={`p-4 border-b border-neutral-200 cursor-pointer transition-colors ${
                          selectedChat === name ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white font-medium">
                            {name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-neutral-900 truncate">{name}</h3>
                              <span className="text-xs text-neutral-500">10:30</span>
                            </div>
                            <p className="text-sm text-neutral-600 truncate">
                              {idx === 0 ? 'Ekipman hazır mı?' : 'Mesaj içeriği...'}
                            </p>
                          </div>
                          {idx === 0 && (
                            <div className="w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center text-white text-xs">
                              2
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="col-span-2 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedChat?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">{selectedChat}</h3>
                        <p className="text-xs text-green-600">Çevrimiçi</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                        <Phone size={18} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                        <Video size={18} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-neutral-50">
                    <div className="space-y-4">
                      {/* Received Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white text-sm">
                          {selectedChat?.charAt(0)}
                        </div>
                        <div>
                          <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-md">
                            <p className="text-sm text-neutral-900">Merhaba! Ekipman kiralama için görüşebilir miyiz?</p>
                          </div>
                          <span className="text-xs text-neutral-500 mt-1 block">10:30</span>
                        </div>
                      </div>

                      {/* Sent Message */}
                      <div className="flex items-start gap-3 justify-end">
                        <div>
                          <div className="bg-neutral-900 text-white rounded-2xl rounded-tr-none p-3 shadow-sm max-w-md">
                            <p className="text-sm">Tabii ki! Hangi ekipmanlar ilginizi çekiyor?</p>
                          </div>
                          <span className="text-xs text-neutral-500 mt-1 block text-right">10:32</span>
                        </div>
                      </div>

                      {/* Received Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white text-sm">
                          {selectedChat?.charAt(0)}
                        </div>
                        <div>
                          <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-md">
                            <p className="text-sm text-neutral-900">Sony A7S III kamera ve Ronin gimbal'a ihtiyacım var.</p>
                          </div>
                          <span className="text-xs text-neutral-500 mt-1 block">10:35</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-neutral-200 bg-white">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                        <Paperclip size={18} />
                      </button>
                      <input
                        type="text"
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                        <Smile size={18} />
                      </button>
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4">Sohbet Grupları</h2>
              <div className="space-y-3">
                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Genel</h3>
                      <p className="text-sm text-neutral-600">12 üye • 48 mesaj</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">Şirket geneli duyurular ve genel konuşmalar</p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Operasyon Ekibi</h3>
                      <p className="text-sm text-neutral-600">5 üye • 156 mesaj</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">Günlük operasyonlar ve ekipman takibi</p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Müşteri Hizmetleri</h3>
                      <p className="text-sm text-neutral-600">3 üye • 89 mesaj</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">Müşteri talepleri ve destek</p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Prodüksiyon</h3>
                      <p className="text-sm text-neutral-600">8 üye • 234 mesaj</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">Film ve proje ekibi koordinasyonu</p>
                </div>

                <button className="w-full mt-4 px-4 py-3 border-2 border-dashed border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                  <Users size={18} />
                  Yeni Grup Oluştur
                </button>
              </div>
            </div>
          )}

          {activeTab === 'archived' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Arşivlenmiş Sohbetler</h2>
              <div className="text-center py-12">
                <Archive className="mx-auto text-neutral-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Henüz arşivlenmiş sohbet yok</h3>
                <p className="text-neutral-600">
                  Arşivlediğiniz sohbetler burada görünecek
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Mesajlaşma Ayarları</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Bildirimler</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">Masaüstü Bildirimleri</span>
                        <p className="text-sm text-neutral-600">Yeni mesaj geldiğinde bildirim göster</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">Ses Bildirimleri</span>
                        <p className="text-sm text-neutral-600">Mesaj sesi çal</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Görünüm</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">Kompakt Mod</span>
                        <p className="text-sm text-neutral-600">Mesajları daha sıkışık göster</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Gizlilik</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">Okundu Bilgisi</span>
                        <p className="text-sm text-neutral-600">Mesajları okuduğunuzu göster</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">Çevrimiçi Durumu</span>
                        <p className="text-sm text-neutral-600">Online/offline durumunu göster</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}