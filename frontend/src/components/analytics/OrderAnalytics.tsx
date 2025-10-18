import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderAnalyticsData {
  date: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  revenue: number;
  averageOrderValue: number;
}

interface OrderStatus {
  status: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface PopularEquipment {
  equipmentId: number;
  name: string;
  category: string;
  orderCount: number;
  revenue: number;
  averageRentalDuration: number;
}

interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  dailyOrders: OrderAnalyticsData[];
  ordersByStatus: OrderStatus[];
  popularEquipment: PopularEquipment[];
  orderTrends: {
    ordersGrowth: number;
    revenueGrowth: number;
    averageOrderValueGrowth: number;
  };
  peakHours: {
    hour: number;
    orderCount: number;
  }[];
  seasonalTrends: {
    month: string;
    orders: number;
    revenue: number;
  }[];
}

interface OrderAnalyticsProps {
  companyId?: number;
  period?: '7d' | '30d' | '90d' | '1y';
  showDetailed?: boolean;
  height?: number;
}

const STATUS_COLORS = {
  'completed': '#10B981',
  'pending': '#F59E0B', 
  'cancelled': '#EF4444',
  'draft': '#6B7280',
  'confirmed': '#3B82F6'
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({
  period = '30d',
  showDetailed = true,
  height = 400
}) => {
  const [data, setData] = useState<OrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  useEffect(() => {
    fetchOrderData();
  }, [selectedPeriod]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/orders?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch order data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM', { locale: tr });
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <ShoppingCart className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'Tamamlanmış';
      case 'pending': return 'Bekleyen';
      case 'cancelled': return 'İptal Edilmiş';
      case 'confirmed': return 'Onaylanmış';
      case 'draft': return 'Taslak';
      default: return status;
    }
  };

  const getGrowthBadge = (growth: number) => {
    const isPositive = growth >= 0;
    const icon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
    const colorClass = isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    
    return (
      <Badge className={`${colorClass} flex items-center gap-1`}>
        {icon}
        {Math.abs(growth).toFixed(1)}%
      </Badge>
    );
  };

  const renderMainChart = () => {
    if (!data || !data.dailyOrders) return null;

    const chartData = data.dailyOrders.map(item => ({
      ...item,
      formattedDate: formatDate(item.date),
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                value,
                name === 'totalOrders' ? 'Toplam Sipariş' :
                name === 'completedOrders' ? 'Tamamlanan' :
                name === 'pendingOrders' ? 'Bekleyen' :
                name === 'cancelledOrders' ? 'İptal Edilen' : name
              ]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="totalOrders" 
              stackId="1"
              stroke={CHART_COLORS[0]} 
              fill={CHART_COLORS[0]}
              name="Toplam Sipariş"
            />
            <Area 
              type="monotone" 
              dataKey="completedOrders" 
              stackId="2"
              stroke={CHART_COLORS[1]} 
              fill={CHART_COLORS[1]}
              name="Tamamlanan"
            />
            <Area 
              type="monotone" 
              dataKey="pendingOrders" 
              stackId="3"
              stroke={CHART_COLORS[2]} 
              fill={CHART_COLORS[2]}
              name="Bekleyen"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                value,
                name === 'totalOrders' ? 'Toplam Sipariş' :
                name === 'completedOrders' ? 'Tamamlanan' :
                name === 'pendingOrders' ? 'Bekleyen' :
                name === 'cancelledOrders' ? 'İptal Edilen' : name
              ]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Bar dataKey="completedOrders" fill={CHART_COLORS[1]} name="Tamamlanan" />
            <Bar dataKey="pendingOrders" fill={CHART_COLORS[2]} name="Bekleyen" />
            <Bar dataKey="cancelledOrders" fill={CHART_COLORS[3]} name="İptal Edilen" />
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                value,
                name === 'totalOrders' ? 'Toplam Sipariş' :
                name === 'completedOrders' ? 'Tamamlanan' :
                name === 'pendingOrders' ? 'Bekleyen' :
                name === 'cancelledOrders' ? 'İptal Edilen' : name
              ]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalOrders" 
              stroke={CHART_COLORS[0]} 
              strokeWidth={2}
              name="Toplam Sipariş"
            />
            <Line 
              type="monotone" 
              dataKey="completedOrders" 
              stroke={CHART_COLORS[1]} 
              strokeWidth={2}
              name="Tamamlanan"
            />
            <Line 
              type="monotone" 
              dataKey="pendingOrders" 
              stroke={CHART_COLORS[2]} 
              strokeWidth={2}
              name="Bekleyen"
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Sipariş Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
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
            <ShoppingCart className="w-5 h-5" />
            Sipariş Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOrderData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yeniden Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main analytics card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Sipariş Analizi
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

              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Çizgi</option>
                <option value="area">Alan</option>
                <option value="bar">Çubuk</option>
              </select>

              <Button variant="outline" size="sm" onClick={fetchOrderData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Summary metrics */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-lg font-semibold">{data.totalOrders.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthBadge(data.orderTrends.ordersGrowth)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Tamamlanma Oranı</p>
                <p className="text-lg font-semibold">{data.completionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">{data.completedOrders} tamamlandı</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Ortalama Sipariş Değeri</p>
                <p className="text-lg font-semibold">{formatCurrency(data.averageOrderValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthBadge(data.orderTrends.averageOrderValueGrowth)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">İptal Oranı</p>
                <p className="text-lg font-semibold text-red-600">{data.cancellationRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">{data.cancelledOrders} iptal</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Main chart */}
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderMainChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showDetailed && data && (
        <>
          {/* Status distribution and popular equipment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status distribution */}
            {data.ordersByStatus && data.ordersByStatus.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sipariş Durumu Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${getStatusLabel(status)} (${percentage.toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.ordersByStatus.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || CHART_COLORS[index]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [value, 'Sipariş Sayısı']}
                          labelFormatter={(label) => getStatusLabel(label)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status breakdown table */}
                  <div className="mt-4 space-y-2">
                    {data.ordersByStatus.map((status, index) => (
                      <div key={status.status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <span className="font-medium">{getStatusLabel(status.status)}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{status.count} sipariş</p>
                          <p className="text-sm text-gray-600">{formatCurrency(status.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popular equipment */}
            {data.popularEquipment && data.popularEquipment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popüler Ekipmanlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.popularEquipment.slice(0, 5).map((equipment, index) => (
                      <div key={equipment.equipmentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{equipment.name}</p>
                            <p className="text-sm text-gray-600">{equipment.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{equipment.orderCount} sipariş</p>
                          <p className="text-sm text-gray-600">{formatCurrency(equipment.revenue)}</p>
                          <p className="text-xs text-gray-500">
                            Ort. {equipment.averageRentalDuration} gün
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Peak hours chart */}
          {data.peakHours && data.peakHours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sipariş Yoğunluk Saatleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Sipariş Sayısı']}
                        labelFormatter={(label) => `Saat: ${label}:00`}
                      />
                      <Bar dataKey="orderCount" fill={CHART_COLORS[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seasonal trends */}
          {data.seasonalTrends && data.seasonalTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mevsimsel Trendler</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.seasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'orders' ? value : formatCurrency(value),
                          name === 'orders' ? 'Sipariş Sayısı' : 'Gelir'
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke={CHART_COLORS[0]} 
                        strokeWidth={2}
                        name="Sipariş Sayısı"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={CHART_COLORS[1]} 
                        strokeWidth={2}
                        yAxisId="right"
                        name="Gelir"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default OrderAnalytics;