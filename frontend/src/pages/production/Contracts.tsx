import React from 'react';
import { FileText, Plus, Download, Eye, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const Contracts: React.FC = () => {
  const contracts = [
    { id: 1, name: 'Ana Oyuncu Sözleşmesi - Ahmet Yılmaz', type: 'Cast', status: 'signed', date: '15 Eki 2024', value: '₺50,000' },
    { id: 2, name: 'Lokasyon Kiralama - Taksim Meydanı', type: 'Location', status: 'pending', date: '18 Eki 2024', value: '₺15,000' },
    { id: 3, name: 'Ekipman Kiralama - ARRI Alexa Paketi', type: 'Equipment', status: 'signed', date: '10 Eki 2024', value: '₺35,000' },
    { id: 4, name: 'Müzik Lisansı - Jenerik Müziği', type: 'License', status: 'review', date: '20 Eki 2024', value: '₺8,000' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle2 size={16} className="text-neutral-900" />;
      case 'pending': return <Clock size={16} className="text-neutral-600" />;
      case 'review': return <AlertCircle size={16} className="text-neutral-700" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-neutral-900 text-white';
      case 'pending': return 'bg-neutral-200 text-neutral-700';
      case 'review': return 'bg-neutral-500 text-white';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <FileText size={32} className="text-neutral-900" />
              Sözleşme Yönetimi
            </h1>
            <p className="text-neutral-600 mt-1">Kontratlar, lisanslar ve belgeler</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Sözleşme
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Sözleşme</span>
              <FileText size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">24</div>
            <div className="text-xs text-neutral-600 mt-1">12 aktif</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">İmzalandı</span>
              <CheckCircle2 size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">18</div>
            <div className="text-xs text-neutral-600 mt-1">%75 tamamlandı</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Bekliyor</span>
              <Clock size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">4</div>
            <div className="text-xs text-neutral-600 mt-1">İmza bekleniyor</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Değer</span>
              <FileText size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺285K</div>
            <div className="text-xs text-neutral-600 mt-1">Sözleşme tutarı</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Sözleşme Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Tip</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Tarih</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">Tutar</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{contract.name}</td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{contract.type}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      {contract.status === 'signed' && 'İmzalandı'}
                      {contract.status === 'pending' && 'Bekliyor'}
                      {contract.status === 'review' && 'İncelemede'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{contract.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-900 text-right">{contract.value}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><Eye size={16} className="text-neutral-700" /></button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><Download size={16} className="text-neutral-700" /></button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><Edit size={16} className="text-neutral-700" /></button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><Trash2 size={16} className="text-neutral-700" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
