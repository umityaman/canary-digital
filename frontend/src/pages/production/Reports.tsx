import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Film, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const revenueData = [
    { month: 'Oca', revenue: 185000, cost: 95000 },
    { month: 'Şub', revenue: 205000, cost: 105000 },
    { month: 'Mar', revenue: 225000, cost: 115000 },
    { month: 'Nis', revenue: 245000, cost: 125000 },
    { month: 'May', revenue: 285000, cost: 135000 },
    { month: 'Haz', revenue: 315000, cost: 145000 },
  ];

  const projectData = [
    { category: 'Reklam', count: 15 },
    { category: 'Film', count: 8 },
    { category: 'Dizi', count: 5 },
    { category: 'Müzik Videosu', count: 12 },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <BarChart3 size={32} className="text-neutral-900" />
              Raporlama & Analiz
            </h1>
            <p className="text-neutral-600 mt-1">Kâr-zarar ve performans analizi</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Download size={20} />
            Excel İndir
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Gelir</span>
              <TrendingUp size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺1.46M</div>
            <div className="text-xs text-neutral-600 mt-1">+22% bu yıl</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Maliyet</span>
              <DollarSign size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺720K</div>
            <div className="text-xs text-neutral-600 mt-1">%49.3 marj</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Net Kâr</span>
              <TrendingUp size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">₺740K</div>
            <div className="text-xs text-neutral-600 mt-1">%50.7 marj</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Tamamlanan Proje</span>
              <Film size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">28</div>
            <div className="text-xs text-neutral-600 mt-1">18 devam ediyor</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Gelir-Gider Analizi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="month" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={3} name="Gelir" />
              <Line type="monotone" dataKey="cost" stroke="#737373" strokeWidth={3} name="Gider" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Proje Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="category" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#171717" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
