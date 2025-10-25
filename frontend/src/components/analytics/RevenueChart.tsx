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
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getApiUrl, getAuthHeaders } from '@/config/api';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  growth?: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  dailyRevenue: RevenueData[];
  monthlyRevenue: RevenueData[];
  revenueByCategory: { category: string; revenue: number; percentage: number }[];
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

interface RevenueChartProps {
  companyId?: number;
  period?: '1d' | '7d' | '30d' | '90d' | '1y';
  type?: 'line' | 'area' | 'bar';
  showComparison?: boolean;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const RevenueChart: React.FC<RevenueChartProps> = ({
  period = '30d',
  type = 'line',
  showComparison = true,
  height = 400
}) => {
  const [data, setData] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [chartType, setChartType] = useState(type);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`analytics/revenue?period=${selectedPeriod}`), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch revenue data');
      }
    } catch (err) {
      console.error('Revenue fetch error:', err);
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

  const renderChart = () => {
    if (!data || !data.dailyRevenue) return null;

    const chartData = data.dailyRevenue.map(item => ({
      ...item,
      formattedDate: formatDate(item.date),
      revenue: item.revenue,
      orders: item.orders,
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
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Gelir' : 'Sipariş'
              ]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0088FE" 
              fill="#0088FE" 
              fillOpacity={0.6}
              name="Gelir"
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
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Gelir' : 'Sipariş'
              ]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#0088FE" name="Gelir" />
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
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'revenue' ? formatCurrency(value) : value,
                name === 'revenue' ? 'Gelir' : 'Sipariş'
              ]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0088FE" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Gelir"
            />
            {showComparison && (
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#00C49F" 
                strokeWidth={2}
                dot={{ r: 4 }}
                yAxisId="right"
                name="Sipariş"
              />
            )}
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Gelir Analizi
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
            <DollarSign className="w-5 h-5" />
            Gelir Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchRevenueData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yeniden Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Gelir Analizi
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Period selector */}
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

            {/* Chart type selector */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="line">Çizgi</option>
              <option value="area">Alan</option>
              <option value="bar">Çubuk</option>
            </select>

            <Button variant="outline" size="sm" onClick={fetchRevenueData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary metrics */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Toplam Gelir</p>
              <p className="text-lg font-semibold">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Günlük Büyüme</p>
              <div className="flex items-center gap-2">
                {getGrowthBadge(data.growth.daily)}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Haftalık Büyüme</p>
              <div className="flex items-center gap-2">
                {getGrowthBadge(data.growth.weekly)}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Aylık Büyüme</p>
              <div className="flex items-center gap-2">
                {getGrowthBadge(data.growth.monthly)}
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        {data && data.revenueByCategory && data.revenueByCategory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Kategoriye Göre Gelir</h4>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 min-w-max lg:min-w-0">
                {data.revenueByCategory.map((category, index) => (
                  <div key={category.category} className="bg-gray-50 p-2 rounded text-center min-w-[120px]">
                    <div 
                      className="w-4 h-4 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <p className="text-xs font-medium truncate">{category.category}</p>
                    <p className="text-xs text-gray-600">{formatCurrency(category.revenue)}</p>
                    <p className="text-xs text-gray-500">%{(category.percentage || 0).toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;