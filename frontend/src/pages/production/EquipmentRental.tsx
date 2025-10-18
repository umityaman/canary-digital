import React from 'react';
import { Package, Plus, Search, CheckCircle2, XCircle, Calendar } from 'lucide-react';

const EquipmentRental: React.FC = () => {
  const equipment = [
    { id: 1, name: 'ARRI Alexa Mini LF', category: 'Kamera', status: 'available', rental: '₺8,000/gün', inUse: 0, total: 2 },
    { id: 2, name: 'Sony FX6', category: 'Kamera', status: 'rented', rental: '₺4,500/gün', inUse: 1, total: 3 },
    { id: 3, name: 'DJI Ronin 2', category: 'Stabilizer', status: 'available', rental: '₺2,500/gün', inUse: 0, total: 2 },
    { id: 4, name: 'ARRI SkyPanel S60-C', category: 'Işık', status: 'rented', rental: '₺1,800/gün', inUse: 2, total: 4 },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Package size={32} className="text-neutral-900" />
              Ekipman Kiralama
            </h1>
            <p className="text-neutral-600 mt-1">Prodüksiyon ekipman envanter ve kiralama</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Ekipman
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Ekipman</span>
              <Package size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">145</div>
            <div className="text-xs text-neutral-600 mt-1">12 kategoride</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Müsait</span>
              <CheckCircle2 size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">98</div>
            <div className="text-xs text-neutral-600 mt-1">%67.5 müsait</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Kiralanmış</span>
              <XCircle size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">47</div>
            <div className="text-xs text-neutral-600 mt-1">Aktif kiralar</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Günlük Gelir</span>
              <Calendar size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺65K</div>
            <div className="text-xs text-neutral-600 mt-1">Ortalama günlük</div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Ekipman ara..." className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Package size={24} className="text-neutral-700" />
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.status === 'available' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                  {item.status === 'available' ? 'Müsait' : 'Kiralanmış'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{item.name}</h3>
              <p className="text-sm text-neutral-600 mb-4">{item.category}</p>
              <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                <div className="text-xs text-neutral-600 mb-1">Kiralama Ücreti</div>
                <div className="text-xl font-bold text-neutral-900">{item.rental}</div>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-neutral-600">Kullanımda:</span>
                <span className="font-bold text-neutral-900">{item.inUse}/{item.total}</span>
              </div>
              <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium">Kirala</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentRental;
