import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Package, 
  Activity, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getApiUrl, getAuthHeaders } from '@/config/api';

interface EquipmentUtilizationData {
  equipmentId: number;
  name: string;
  category: string;
  utilizationRate: number;
  totalHours: number;
  rentedHours: number;
  maintenanceHours: number;
  idleHours: number;
  revenue: number;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  lastRental?: string;
  nextMaintenance?: string;
}

interface UtilizationMetrics {
  totalEquipment: number;
  averageUtilization: number;
  topPerformers: EquipmentUtilizationData[];
  underutilized: EquipmentUtilizationData[];
  byCategory: {
    category: string;
    count: number;
    avgUtilization: number;
    revenue: number;
  }[];
  utilizationTrend: {
    date: string;
    utilization: number;
    revenue: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

interface EquipmentUtilizationProps {
  companyId?: number;
  period?: '1d' | '7d' | '30d' | '90d' | '1y';
  showTrend?: boolean;
  height?: number;
}

const COLORS = {
  available: '#10B981', // Green
  rented: '#3B82F6',    // Blue  
  maintenance: '#F59E0B', // Yellow
  retired: '#EF4444'    // Red
};

const UTILIZATION_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#059669', '#047857'];

export const EquipmentUtilization: React.FC<EquipmentUtilizationProps> = ({
  period = '30d',
  showTrend = true,
  height = 400
}) => {
  const [data, setData] = useState<UtilizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchUtilizationData();
  }, [selectedPeriod]);

  const fetchUtilizationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`analytics/equipment?period=${selectedPeriod}`), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch equipment data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch equipment data');
      }
    } catch (err) {
      console.error('Equipment fetch error:', err);
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

  const getUtilizationColor = (rate: number) => {
    if (rate < 20) return UTILIZATION_COLORS[0]; // Red - Very low
    if (rate < 40) return UTILIZATION_COLORS[1]; // Yellow - Low
    if (rate < 60) return UTILIZATION_COLORS[2]; // Green - Good
    if (rate < 80) return UTILIZATION_COLORS[3]; // Dark green - Very good
    return UTILIZATION_COLORS[4]; // Darkest green - Excellent
  };

  const getUtilizationLabel = (rate: number) => {
    if (rate < 20) return 'Çok Düşük';
    if (rate < 40) return 'Düşük';
    if (rate < 60) return 'Orta';
    if (rate < 80) return 'İyi';
    return 'Mükemmel';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rented':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'retired':
        return <Clock className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Müsait';
      case 'rented': return 'Kiralanmış';
      case 'maintenance': return 'Bakımda';
      case 'retired': return 'Emekli';
      default: return status;
    }
  };

  const filteredTopPerformers = data?.topPerformers?.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const filteredUnderutilized = data?.underutilized?.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ekipman Kullanım Analizi
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
            <Package className="w-5 h-5" />
            Ekipman Kullanım Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUtilizationData} variant="outline">
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
      {/* Main utilization card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ekipman Kullanım Analizi
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Kategoriler</option>
                {data?.byCategory?.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>

              <Button variant="outline" size="sm" onClick={fetchUtilizationData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Summary metrics */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
                <p className="text-sm text-gray-600">Toplam Ekipman</p>
                <p className="text-lg font-semibold">{data.totalEquipment || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
                <p className="text-sm text-gray-600">Ortalama Kullanım</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{(data.averageUtilization || 0).toFixed(1)}%</p>
                  <Badge 
                    className={`text-xs px-2 py-1`}
                    style={{ backgroundColor: getUtilizationColor(data.averageUtilization || 0) }}
                  >
                    {getUtilizationLabel(data.averageUtilization || 0)}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
                <p className="text-sm text-gray-600">En Çok Kullanılan</p>
                <p className="text-lg font-semibold truncate" title={data.topPerformers?.[0]?.name || 'N/A'}>
                  {data.topPerformers?.[0]?.name || 'N/A'}
                </p>
                {data.topPerformers?.[0] && (
                  <p className="text-sm text-gray-500">%{(data.topPerformers[0].utilizationRate || 0).toFixed(1)}</p>
                )}
              </div>
              <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
                <p className="text-sm text-gray-600">Az Kullanılan</p>
                <p className="text-sm font-semibold text-orange-600">
                  {data.underutilized?.length || 0} Ekipman
                </p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Status distribution pie chart */}
          {data && data.statusDistribution && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="overflow-hidden">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Durum Dağılımı</h4>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: 300, height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${getStatusLabel(name)} (${(percentage || 0).toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, getStatusLabel(name as string)]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Category performance */}
              <div className="overflow-hidden">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Kategoriye Göre Performans</h4>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: 400, height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="category" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'avgUtilization' ? `${(value || 0).toFixed(1)}%` : value,
                            name === 'avgUtilization' ? 'Ortalama Kullanım' : 'Ekipman Sayısı'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" name="Ekipman Sayısı" />
                      <Bar dataKey="avgUtilization" fill="#10B981" name="Ortalama Kullanım (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* Utilization trend */}
          {showTrend && data && data.utilizationTrend && data.utilizationTrend.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Kullanım Trendi</h4>
              <div className="overflow-x-auto">
                <div style={{ minWidth: 600, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.utilizationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => format(parseISO(value), 'dd MMM', { locale: tr })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'utilization' ? `${(value || 0).toFixed(1)}%` : formatCurrency(value || 0),
                        name === 'utilization' ? 'Kullanım Oranı' : 'Gelir'
                      ]}
                      labelFormatter={(label) => format(parseISO(label), 'dd MMMM yyyy', { locale: tr })}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="utilization" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Kullanım Oranı (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      yAxisId="right"
                      name="Gelir"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top performers */}
      {filteredTopPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              En Çok Kullanılan Ekipmanlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTopPerformers.slice(0, 5).map((equipment) => (
                <div key={equipment.equipmentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(equipment.status)}
                    <div>
                      <p className="font-medium">{equipment.name}</p>
                      <p className="text-sm text-gray-600">{equipment.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{(equipment.utilizationRate || 0).toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">{formatCurrency(equipment.revenue || 0)}</p>
                    </div>
                    <div className="w-24">
                      <Progress value={equipment.utilizationRate || 0} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Underutilized equipment */}
      {filteredUnderutilized.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              Az Kullanılan Ekipmanlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUnderutilized.slice(0, 5).map((equipment) => (
                <div key={equipment.equipmentId} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(equipment.status)}
                    <div>
                      <p className="font-medium">{equipment.name}</p>
                      <p className="text-sm text-gray-600">{equipment.category}</p>
                      {equipment.lastRental && (
                        <p className="text-xs text-gray-500">
                          Son kiralama: {format(parseISO(equipment.lastRental), 'dd MMM yyyy', { locale: tr })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-orange-600">{(equipment.utilizationRate || 0).toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">{formatCurrency(equipment.revenue || 0)}</p>
                    </div>
                    <div className="w-24">
                      <Progress 
                        value={equipment.utilizationRate || 0} 
                        className="h-2"
                        style={{ backgroundColor: '#FED7AA' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentUtilization;