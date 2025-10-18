import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
} from 'lucide-react';

interface BudgetItem {
  id: number;
  category: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  approvalStatus: string;
  invoiceNumber?: string;
}

const BudgetManagement: React.FC = () => {
  const [budgetItems] = useState<BudgetItem[]>([
    {
      id: 1,
      category: 'equipment',
      name: 'Kamera Kiralama',
      plannedAmount: 50000,
      actualAmount: 48000,
      approvalStatus: 'approved',
      invoiceNumber: 'INV-2025-001',
    },
    {
      id: 2,
      category: 'location',
      name: 'Set Kirası',
      plannedAmount: 35000,
      actualAmount: 35000,
      approvalStatus: 'approved',
      invoiceNumber: 'INV-2025-002',
    },
    {
      id: 3,
      category: 'talent',
      name: 'Oyuncu Ücretleri',
      plannedAmount: 75000,
      actualAmount: 0,
      approvalStatus: 'pending',
    },
    {
      id: 4,
      category: 'food',
      name: 'Catering Hizmetleri',
      plannedAmount: 15000,
      actualAmount: 12000,
      approvalStatus: 'approved',
    },
  ]);

  const getCategoryLabel = (category: string) => {
    const labels = {
      equipment: '📦 Ekipman',
      location: '📍 Mekan',
      talent: '🎭 Oyuncu',
      food: '🍽️ Yemek',
      transport: '🚗 Ulaşım',
      'post-production': '🎬 Post Prodüksiyon',
      misc: '📌 Diğer',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const totalPlanned = budgetItems.reduce((acc, item) => acc + item.plannedAmount, 0);
  const totalActual = budgetItems.reduce((acc, item) => acc + item.actualAmount, 0);
  const variance = totalPlanned - totalActual;
  const variancePercentage = ((variance / totalPlanned) * 100).toFixed(1);

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <DollarSign size={32} className="text-neutral-900" />
          Bütçe Yönetimi
        </h1>
        <p className="text-neutral-600 mt-1">Proje maliyetlerinizi takip edin</p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Planlanan Bütçe</span>
            <DollarSign size={20} className="text-neutral-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            ₺{totalPlanned.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Gerçekleşen</span>
            <TrendingUp size={20} className="text-neutral-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            ₺{totalActual.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Varyans</span>
            {variance >= 0 ? (
              <TrendingDown size={20} className="text-neutral-700" />
            ) : (
              <TrendingUp size={20} className="text-neutral-700" />
            )}
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {variance >= 0 ? '+' : ''}₺{variance.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {variance >= 0 ? '+' : ''}
            {variancePercentage}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600 text-sm">Kullanım Oranı</span>
            <FileText size={20} className="text-neutral-700" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {((totalActual / totalPlanned) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Bütçe Kalemleri</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2">
              <Download size={16} />
              Dışa Aktar
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2">
              <Plus size={16} />
              Yeni Kalem
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Kalem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Planlanan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Gerçekleşen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Fark
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Fatura
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {budgetItems.map((item) => {
                const difference = item.plannedAmount - item.actualAmount;
                return (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getCategoryLabel(item.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-neutral-900">
                      ₺{item.plannedAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-neutral-900">
                      ₺{item.actualAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span
                        className={`font-medium ${
                          difference > 0 ? 'text-neutral-900' : 'text-neutral-600'
                        }`}
                      >
                        {difference >= 0 ? '+' : ''}₺{difference.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.approvalStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 text-white">
                          <CheckCircle2 size={14} />
                          Onaylandı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-neutral-200 text-neutral-900">
                          <AlertCircle size={14} />
                          Beklemede
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.invoiceNumber ? (
                        <button className="text-neutral-700 hover:text-neutral-900 font-medium text-sm">
                          {item.invoiceNumber}
                        </button>
                      ) : (
                        <span className="text-neutral-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-neutral-50 border-t border-neutral-200">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-bold text-neutral-900">
                  TOPLAM
                </td>
                <td className="px-6 py-4 text-sm font-bold text-neutral-900 text-right">
                  ₺{totalPlanned.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-neutral-900 text-right">
                  ₺{totalActual.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-neutral-900 text-right">
                  {variance >= 0 ? '+' : ''}₺{variance.toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagement;
