import { useState, useEffect } from 'react';
import { 
  Calculator, 
  Package, 
  Users, 
  Zap, 
  TrendingUp, 
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Calendar,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens';
import toast from 'react-hot-toast';

interface CostItem {
  id: string;
  name: string;
  category: 'material' | 'labor' | 'overhead' | 'other';
  amount: number;
  date: string;
  project?: string;
}

interface ProductCost {
  id: string;
  productName: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
}

export default function CostAccounting() {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);

  // Category mapping helper
  const mapCostCategory = (backendCategory: string): 'material' | 'labor' | 'overhead' | 'other' => {
    const categoryMap: Record<string, 'material' | 'labor' | 'overhead' | 'other'> = {
      'material': 'material',
      'hammadde': 'material',
      'malzeme': 'material',
      'labor': 'labor',
      'işçilik': 'labor',
      'personel': 'labor',
      'overhead': 'overhead',
      'genel': 'overhead',
      'other': 'other',
      'diğer': 'other',
    };
    return categoryMap[backendCategory?.toLowerCase()] || 'other';
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // 🔥 Gerçek API'den maliyet verilerini yükle
      const costResponse = await fetch(`${API_URL}/api/cost-accounting/reports/cost`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (costResponse.ok) {
        const costData = await costResponse.json();
        
        // Backend response'u frontend formatına dönüştür
        if (costData.success && costData.data) {
          const formattedCosts: CostItem[] = costData.data.costs?.map((cost: any) => ({
            id: cost.id?.toString() || '',
            name: cost.name || cost.description || 'İsimsiz Maliyet',
            category: mapCostCategory(cost.category || cost.type),
            amount: parseFloat(cost.amount || cost.totalAmount || 0),
            date: cost.date || cost.createdAt ? new Date(cost.date || cost.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            project: cost.project || cost.projectName,
          })) || [];

          const formattedProductCosts: ProductCost[] = costData.data.products?.map((product: any) => ({
            id: product.id?.toString() || '',
            productName: product.name || product.productName || 'İsimsiz Ürün',
            materialCost: parseFloat(product.materialCost || 0),
            laborCost: parseFloat(product.laborCost || 0),
            overheadCost: parseFloat(product.overheadCost || 0),
            totalCost: parseFloat(product.totalCost || 0),
            sellingPrice: parseFloat(product.sellingPrice || 0),
            profit: parseFloat(product.profit || 0),
            profitMargin: parseFloat(product.profitMargin || 0),
          })) || [];

          setCosts(formattedCosts);
          setProductCosts(formattedProductCosts);
        } else {
          // API'den veri gelmezse boş array
          setCosts([]);
          setProductCosts([]);
        }
      } else {
        throw new Error('Maliyet verileri yüklenemedi');
      }

      setLoading(false);
    } catch (error) {
      console.error('Maliyet verileri yüklenirken hata:', error);
      
      // Hata durumunda boş veri göster
      setCosts([]);
      setProductCosts([]);
      
      toast.error('Maliyet verileri yüklenemedi');
      setLoading(false);
    }
  };

  const totalMaterialCost = productCosts.reduce((sum, p) => sum + p.materialCost, 0);
  const totalLaborCost = productCosts.reduce((sum, p) => sum + p.laborCost, 0);
  const totalOverheadCost = productCosts.reduce((sum, p) => sum + p.overheadCost, 0);
  const totalCost = productCosts.reduce((sum, p) => sum + p.totalCost, 0);
  const totalRevenue = productCosts.reduce((sum, p) => sum + p.sellingPrice, 0);
  const totalProfit = productCosts.reduce((sum, p) => sum + p.profit, 0);
  const avgProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : '0.00';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      material: 'Hammadde',
      labor: 'İşçilik',
      overhead: 'Genel Gider',
      other: 'Diğer'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'primary' | 'success' | 'warning' | 'default'> = {
      material: 'primary',
      labor: 'success',
      overhead: 'warning',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${DESIGN_TOKENS?.typography?.h1} ${DESIGN_TOKENS?.colors?.text.primary} flex items-center gap-3`}>
            <Calculator className="w-8 h-8 text-blue-600" />
            Maliyet Muhasebesi
          </h1>
          <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
            Üretim maliyetlerini takip edin ve karlılık analizi yapın
          </p>
        </div>
        <button
          onClick={() => toast.success('Yeni maliyet kaydı ekleniyor...')}
          className={cx(button('md', 'primary', 'md'), 'gap-2')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Maliyet</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={cx(card('sm', 'md', 'default', 'lg'), 'min-w-0')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Maliyet</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCost)}</p>
              <p className="text-xs text-gray-500 mt-1">Bu dönem</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="text-white" size={24} />
            </div>
          </div>
        </div>

  <div className={card('md', 'lg', 'default', 'lg')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hammadde</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(totalMaterialCost)}</p>
              <p className="text-xs text-gray-500 mt-1">{((totalMaterialCost / totalCost) * 100).toFixed(1)}% oran</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

  <div className={cx(card('sm', 'md', 'default', 'lg'), 'min-w-0')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">İşçilik</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalLaborCost)}</p>
              <p className="text-xs text-gray-500 mt-1">{((totalLaborCost / totalCost) * 100).toFixed(1)}% oran</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

  <div className={cx(card('sm', 'md', 'default', 'lg'), 'min-w-0')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Genel Gider</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalOverheadCost)}</p>
              <p className="text-xs text-gray-500 mt-1">{((totalOverheadCost / totalCost) * 100).toFixed(1)}% oran</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Zap className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={cx(card('sm', 'md', 'default', 'lg'), 'min-w-0')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Gelir</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
        </div>

  <div className={cx(card('sm', 'md', 'default', 'lg'), 'min-w-0')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Kar</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
        </div>

  <div className={cx(card('sm', 'md', 'default', 'lg'), 'min-w-0')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ortalama Kar Marjı</p>
              <p className="text-xl font-bold text-purple-600">%{avgProfitMargin}</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
        </div>
      </div>

      {/* Filters */}
  <div className={cx(card('sm', 'md', 'default', 'lg'), 'max-w-full')}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={cx(DESIGN_TOKENS.typography.label.lg, DESIGN_TOKENS.colors.text.secondary, 'block mb-2')}>
              Dönem
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={input('md', 'default', undefined, 'md')}
            >
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={cx(DESIGN_TOKENS.typography.label.lg, DESIGN_TOKENS.colors.text.secondary, 'block mb-2')}>
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={input('md', 'default', undefined, 'md')}
            >
              <option value="all">Tümü</option>
              <option value="material">Hammadde</option>
              <option value="labor">İşçilik</option>
              <option value="overhead">Genel Gider</option>
              <option value="other">Diğer</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => toast.success('Rapor indiriliyor...')}
              className={cx(button('md', 'outline', 'md'), 'gap-2')}
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Product Cost Analysis Table */}
  <div className={cx(card('md', 'sm', 'default', 'lg'), 'p-0 overflow-hidden')}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary} flex items-center gap-2`}>
            <BarChart3 className="text-blue-600" size={20} />
            Ürün Bazlı Maliyet Analizi
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Ürün</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase hidden lg:table-cell">Hammadde</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase hidden md:table-cell">İşçilik</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase hidden xl:table-cell">G.Gider</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase">Maliyet</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase hidden md:table-cell">Fiyat</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase">Kar</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase hidden lg:table-cell">Marj</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-700 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productCosts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-sm">{product.productName}</div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-xs text-gray-600 hidden lg:table-cell">
                    {formatCurrency(product.materialCost)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-xs text-gray-600 hidden md:table-cell">
                    {formatCurrency(product.laborCost)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-xs text-gray-600 hidden xl:table-cell">
                    {formatCurrency(product.overheadCost)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right font-medium text-gray-900 text-sm">
                    {formatCurrency(product.totalCost)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-xs text-gray-600 hidden md:table-cell">
                    {formatCurrency(product.sellingPrice)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right">
                    <span className={`font-medium ${product.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(product.profit)}
                    </span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-center hidden lg:table-cell">
                    <span
                      className={cx(
                        'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                        product.profitMargin > 20
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      )}
                    >
                      %{product.profitMargin.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toast.success('Düzenleme açılıyor...')}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="text-gray-600" size={14} />
                      </button>
                      <button
                        onClick={() => toast.success('Detay görüntüleniyor...')}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Detay"
                      >
                        <FileText className="text-blue-600" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-3 py-3 text-gray-900 text-sm">TOPLAM</td>
                <td className="px-2 py-3 text-right text-gray-900 text-xs hidden lg:table-cell">{formatCurrency(totalMaterialCost)}</td>
                <td className="px-2 py-3 text-right text-gray-900 text-xs hidden md:table-cell">{formatCurrency(totalLaborCost)}</td>
                <td className="px-2 py-3 text-right text-gray-900 text-xs hidden xl:table-cell">{formatCurrency(totalOverheadCost)}</td>
                <td className="px-2 py-3 text-right text-gray-900 text-sm">{formatCurrency(totalCost)}</td>
                <td className="px-2 py-3 text-right text-gray-900 text-xs hidden md:table-cell">{formatCurrency(totalRevenue)}</td>
                <td className="px-2 py-3 text-right text-green-600 text-sm">{formatCurrency(totalProfit)}</td>
                <td className="px-2 py-3 text-center text-gray-900 text-xs hidden lg:table-cell">%{avgProfitMargin}</td>
                <td className="px-2 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={card('md', 'lg', 'default', 'lg')}>
          <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary} mb-4`}>
            Maliyet Dağılımı
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Hammadde</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totalMaterialCost)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(totalMaterialCost / totalCost) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">İşçilik</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totalLaborCost)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(totalLaborCost / totalCost) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Genel Gider</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totalOverheadCost)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${(totalOverheadCost / totalCost) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

  <div className={card('md', 'lg', 'default', 'lg')}>
          <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary} mb-4`}>
            Öneriler
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">Kar Marjı İyileştirme</p>
                <p className="text-xs text-blue-700 mt-1">Hammadde maliyetlerini %5 azaltarak kar marjınızı artırabilirsiniz.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Package className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-green-900">Stok Optimizasyonu</p>
                <p className="text-xs text-green-700 mt-1">Yüksek cirolu ürünlerin stokunu artırın.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <Zap className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-orange-900">Enerji Tasarrufu</p>
                <p className="text-xs text-orange-700 mt-1">Genel gider maliyetlerinde tasarruf fırsatı var.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
