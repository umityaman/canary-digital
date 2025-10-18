import React from 'react';
import { Briefcase, Plus, Mail, Phone, Star, DollarSign, Film } from 'lucide-react';

const Clients: React.FC = () => {
  const clients = [
    { id: 1, name: 'Acme Advertising', contact: 'John Smith', email: 'john@acme.com', phone: '+90 212 555 0101', projects: 8, revenue: '₺450K', rating: 4.8 },
    { id: 2, name: 'Brand Studio', contact: 'Sarah Johnson', email: 'sarah@brand.com', phone: '+90 212 555 0102', projects: 12, revenue: '₺680K', rating: 4.9 },
    { id: 3, name: 'Digital Agency', contact: 'Mike Brown', email: 'mike@digital.com', phone: '+90 212 555 0103', projects: 5, revenue: '₺285K', rating: 4.6 },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Briefcase size={32} className="text-neutral-900" />
              Müşteri & Ajans Yönetimi
            </h1>
            <p className="text-neutral-600 mt-1">CRM, teklif ve revizyon yönetimi</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Müşteri
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Müşteri</span>
              <Briefcase size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">45</div>
            <div className="text-xs text-neutral-600 mt-1">28 aktif</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Proje</span>
              <Film size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">125</div>
            <div className="text-xs text-neutral-600 mt-1">18 devam ediyor</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Gelir</span>
              <DollarSign size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺2.5M</div>
            <div className="text-xs text-neutral-600 mt-1">Lifetime value</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Ortalama Puan</span>
              <Star size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">4.7</div>
            <div className="text-xs text-neutral-600 mt-1">Müşteri memnuniyeti</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {client.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-neutral-900 text-neutral-900" />
                <span className="text-sm font-bold text-neutral-900">{client.rating}</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{client.name}</h3>
            <p className="text-sm text-neutral-600 mb-4">{client.contact}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Mail size={14} />
                {client.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Phone size={14} />
                {client.phone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="text-xs text-neutral-600 mb-1">Projeler</div>
                <div className="text-lg font-bold text-neutral-900">{client.projects}</div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="text-xs text-neutral-600 mb-1">Toplam Gelir</div>
                <div className="text-lg font-bold text-neutral-900">{client.revenue}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium">
                Detaylar
              </button>
              <button className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                İletişim
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
