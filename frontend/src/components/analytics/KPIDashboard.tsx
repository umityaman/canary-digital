import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Users,
  ShoppingCart,
  Activity,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface KPIData {
  id: string;
  title: string;
  value: number | string;
  change: number;
  period: string;
  format: 'currency' | 'number' | 'percentage';
  trend: 'up' | 'down' | 'neutral';
  target?: number;
  icon: string;
  description?: string;
  color?: string;
}

interface DashboardKPIs {
  revenue: {
    total: number;
    growth: number;
    target: number;
    monthly: number;
    weekly: number;
    daily: number;
  };
  orders: {
    total: number;
    growth: number;
    pending: number;
    completed: number;
    cancelled: number;
    averageValue: number;
  };
  equipment: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    utilizationRate: number;
    revenuePerUnit: number;
  };
  customers: {
    total: number;
    growth: number;
    active: number;
    new: number;
    retention: number;
    averageOrderValue: number;
  };
  financial: {
    profit: number;
    profitMargin: number;
    operatingCosts: number;
    roi: number;
    cashFlow: number;
  };
}

interface KPIDashboardProps {
  companyId?: number;
  period?: '7d' | '30d' | '90d' | '1y';
  compact?: boolean;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  period = '30d',
  compact = false
}) => {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    fetchKPIData();
  }, [selectedPeriod]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/kpis?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch KPI data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch KPI data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number | string, format: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('tr-TR').format(value);
      default:
        return value.toString();
    }
  };

  const getIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (iconName) {
      case 'DollarSign': return <DollarSign {...iconProps} />;
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />;
      case 'Package': return <Package {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Activity': return <Activity {...iconProps} />;
      case 'BarChart3': return <BarChart3 {...iconProps} />;
      case 'PieChart': return <PieChartIcon {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-600" />;
    return null;
  };

  const getChangeBadge = (change: number) => {
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    
    return (
      <Badge className={`${colorClass} flex items-center gap-1 text-xs`}>
        {getChangeIcon(change)}
        {Math.abs(change).toFixed(1)}%
      </Badge>
    );
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Son 7 Gün';
      case '30d': return 'Son 30 Gün';
      case '90d': return 'Son 90 Gün';
      case '1y': return 'Son 1 Yıl';
      default: return period;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Temel Performans Göstergeleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Veriler yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Temel Performans Göstergeleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchKPIData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yeniden Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Prepare KPI cards data
  const kpiCards: KPIData[] = [
    {
      id: 'total-revenue',
      title: 'Toplam Gelir',
      value: data.revenue.total,
      change: data.revenue.growth,
      period: getPeriodLabel(selectedPeriod),
      format: 'currency',
      trend: data.revenue.growth >= 0 ? 'up' : 'down',
      target: data.revenue.target,
      icon: 'DollarSign',
      description: `Hedef: ${formatValue(data.revenue.target, 'currency')}`,
      color: 'bg-blue-500'
    },
    {
      id: 'total-orders',
      title: 'Toplam Sipariş',
      value: data.orders.total,
      change: data.orders.growth,
      period: getPeriodLabel(selectedPeriod),
      format: 'number',
      trend: data.orders.growth >= 0 ? 'up' : 'down',
      icon: 'ShoppingCart',
      description: `Ortalama: ${formatValue(data.orders.averageValue, 'currency')}`,
      color: 'bg-green-500'
    },
    {
      id: 'equipment-utilization',
      title: 'Ekipman Kullanımı',
      value: data.equipment.utilizationRate,
      change: 0, // Could be calculated from trend data
      period: 'Anlık',
      format: 'percentage',
      trend: data.equipment.utilizationRate >= 70 ? 'up' : data.equipment.utilizationRate >= 40 ? 'neutral' : 'down',
      icon: 'Package',
      description: `${data.equipment.rented}/${data.equipment.total} ekipman kiralanmış`,
      color: 'bg-purple-500'
    },
    {
      id: 'active-customers',
      title: 'Aktif Müşteriler',
      value: data.customers.active,
      change: data.customers.growth,
      period: getPeriodLabel(selectedPeriod),
      format: 'number',
      trend: data.customers.growth >= 0 ? 'up' : 'down',
      icon: 'Users',
      description: `Yeni: ${data.customers.new} müşteri`,
      color: 'bg-orange-500'
    },
    {
      id: 'profit-margin',
      title: 'Kar Marjı',
      value: data.financial.profitMargin,
      change: 0, // Could be calculated from previous period
      period: getPeriodLabel(selectedPeriod),
      format: 'percentage',
      trend: data.financial.profitMargin >= 20 ? 'up' : data.financial.profitMargin >= 10 ? 'neutral' : 'down',
      icon: 'TrendingUp',
      description: `Toplam kar: ${formatValue(data.financial.profit, 'currency')}`,
      color: 'bg-indigo-500'
    },
    {
      id: 'customer-retention',
      title: 'Müşteri Bağlılığı',
      value: data.customers.retention,
      change: 0,
      period: getPeriodLabel(selectedPeriod),
      format: 'percentage',
      trend: data.customers.retention >= 80 ? 'up' : data.customers.retention >= 60 ? 'neutral' : 'down',
      icon: 'Activity',
      description: `AOV: ${formatValue(data.customers.averageOrderValue, 'currency')}`,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Temel Performans Göstergeleri
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
                <option value="1y">Son 1 Yıl</option>
              </select>

              <Button variant="outline" size="sm" onClick={fetchKPIData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards Grid */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {kpiCards.map((kpi) => (
          <Card key={kpi.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-2 rounded-lg ${kpi.color} text-white`}>
                      {getIcon(kpi.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <p className="text-xs text-gray-500">{kpi.period}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatValue(kpi.value, kpi.format)}
                    </p>
                    
                    {kpi.change !== 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {getChangeBadge(kpi.change)}
                        <span className="text-xs text-gray-500">vs önceki dönem</span>
                      </div>
                    )}
                  </div>

                  {kpi.target && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Hedefe göre</span>
                        <span>{((kpi.value as number / kpi.target) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={((kpi.value as number / kpi.target) * 100)} 
                        className="h-1"
                      />
                    </div>
                  )}

                  {kpi.description && (
                    <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdown */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gelir Detayı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aylık</span>
                <span className="font-medium">{formatValue(data.revenue.monthly, 'currency')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Haftalık</span>
                <span className="font-medium">{formatValue(data.revenue.weekly, 'currency')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Günlük</span>
                <span className="font-medium">{formatValue(data.revenue.daily, 'currency')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Orders Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sipariş Detayı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tamamlanan</span>
                <span className="font-medium text-green-600">{data.orders.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bekleyen</span>
                <span className="font-medium text-yellow-600">{data.orders.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">İptal Edilen</span>
                <span className="font-medium text-red-600">{data.orders.cancelled}</span>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ekipman Detayı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Müsait</span>
                <span className="font-medium text-green-600">{data.equipment.available}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kiralanmış</span>
                <span className="font-medium text-blue-600">{data.equipment.rented}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bakımda</span>
                <span className="font-medium text-yellow-600">{data.equipment.maintenance}</span>
              </div>
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Finansal Detay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">İşletme Maliyeti</span>
                <span className="font-medium">{formatValue(data.financial.operatingCosts, 'currency')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ROI</span>
                <span className="font-medium">{formatValue(data.financial.roi, 'percentage')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nakit Akışı</span>
                <span className={`font-medium ${data.financial.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatValue(data.financial.cashFlow, 'currency')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KPIDashboard;