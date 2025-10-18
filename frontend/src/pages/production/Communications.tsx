import React from 'react';
import { MessageSquare, Plus, Send, Bell, Users } from 'lucide-react';

const Communications: React.FC = () => {
  const messages = [
    { id: 1, from: 'Ahmet Yılmaz', role: 'Yönetmen', message: 'Yarınki çekim saati 08:00 olarak güncellendi', time: '10 dk önce', unread: true },
    { id: 2, from: 'Mehmet Demir', role: 'Görüntü Yönetmeni', message: 'Yeni ekipman listesi paylaşıldı', time: '1 saat önce', unread: true },
    { id: 3, from: 'Ayşe Kaya', role: 'Prodüktör', message: 'Bütçe revizyonu onaylandı', time: '3 saat önce', unread: false },
  ];

  const announcements = [
    { id: 1, title: 'Önemli: Çekim Lokasyonu Değişikliği', content: 'Cumartesi günkü çekim Taksim yerine Kadıköy\'de yapılacak', date: '18 Eki 2024' },
    { id: 2, title: 'Haftalık Toplantı', content: 'Cuma günü saat 14:00\'te haftalık değerlendirme toplantısı', date: '17 Eki 2024' },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <MessageSquare size={32} className="text-neutral-900" />
              İletişim & Duyurular
            </h1>
            <p className="text-neutral-600 mt-1">Mesajlaşma, duyurular ve set notları</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Mesaj
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Mesaj</span>
              <MessageSquare size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">245</div>
            <div className="text-xs text-neutral-600 mt-1">Bu ay</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Okunmamış</span>
              <Bell size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">12</div>
            <div className="text-xs text-neutral-600 mt-1">Yeni bildirim</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Duyurular</span>
              <Bell size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">8</div>
            <div className="text-xs text-neutral-600 mt-1">Aktif duyuru</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Ekip Üyeleri</span>
              <Users size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">24</div>
            <div className="text-xs text-neutral-600 mt-1">Aktif kullanıcı</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-neutral-900">Mesajlar</h3>
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow ${msg.unread ? 'border-l-4 border-l-neutral-900' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-neutral-900">{msg.from}</h4>
                  <p className="text-xs text-neutral-600">{msg.role}</p>
                </div>
                <span className="text-xs text-neutral-600">{msg.time}</span>
              </div>
              <p className="text-sm text-neutral-700 mb-3">{msg.message}</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm">
                <Send size={14} />
                Yanıtla
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-neutral-900">Duyurular</h3>
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-neutral-900">{ann.title}</h4>
                <span className="text-xs text-neutral-600">{ann.date}</span>
              </div>
              <p className="text-sm text-neutral-700">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Communications;
