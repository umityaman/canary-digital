import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { getApiUrl, getAuthHeaders } from '@/config/api';

// Import analytics components
import RevenueChart from './RevenueChart';
import EquipmentUtilization from './EquipmentUtilization';
import OrderAnalytics from './OrderAnalytics';
import KPIDashboard from './KPIDashboard';

interface AnalyticsDashboardProps {
  companyId?: number;
  defaultPeriod?: '1d' | '7d' | '30d' | '90d' | '1y';
  compact?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  defaultPeriod = '30d',
  compact = false
}) => {
  const [period, setPeriod] = useState(defaultPeriod);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Refresh all data
  const refreshAllData = () => {
    setLoading(true);
    setLastUpdated(new Date());
    // This will trigger useEffect in child components through period change
    setPeriod(prev => prev); // Force re-render
    setTimeout(() => setLoading(false), 1000);
  };

  // Export data function
  const exportData = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(getApiUrl(`analytics/export?period=${period}&format=${format}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          period,
          format,
          sections: ['kpis', 'revenue', 'equipment', 'orders'],
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `canary-analytics-${period}-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Rapor dışa aktarılırken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1d': return 'Bugün';
      case '7d': return 'Son 7 Gün';
      case '30d': return 'Son 30 Gün';
      case '90d': return 'Son 90 Gün';
      case '1y': return 'Son 1 Yıl';
      default: return period;
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Analiz Özeti</h2>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Bugün</option>
              <option value="7d">7 Gün</option>
              <option value="30d">30 Gün</option>
              <option value="90d">90 Gün</option>
              <option value="1y">1 Yıl</option>
            </select>
            <Button variant="outline" size="sm" onClick={refreshAllData}>
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Compact KPI Dashboard */}
        <KPIDashboard period={period} compact={true} />
        
        {/* Compact charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64">
            <RevenueChart period={period} height={220} />
          </div>
          <div className="h-64">
            <EquipmentUtilization period={period} height={220} showTrend={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Analiz Dashboard'u
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {getPeriodLabel(period)} dönemi için kapsamlı iş analizi
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1d">Bugün</option>
                  <option value="7d">Son 7 Gün</option>
                  <option value="30d">Son 30 Gün</option>
                  <option value="90d">Son 90 Gün</option>
                  <option value="1y">Son 1 Yıl</option>
                </select>
              </div>

              {/* Export buttons */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('pdf')}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('excel')}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportData('csv')}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
              </div>

              {/* Refresh button */}
              <Button variant="outline" size="sm" onClick={refreshAllData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}</span>
              <Badge variant="secondary" className="text-xs">
                Canlı Veri
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>Gerçek zamanlı analiz</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main analytics tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="revenue">Gelir Analizi</TabsTrigger>
          <TabsTrigger value="equipment">Ekipman Analizi</TabsTrigger>
          <TabsTrigger value="orders">Sipariş Analizi</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Dashboard */}
          <KPIDashboard period={period} />
          
          {/* Overview charts - Alt Alta */}
          <div className="space-y-6">
            <RevenueChart 
              period={period} 
              type="area" 
              showComparison={true}
              height={350}
            />
            <EquipmentUtilization 
              period={period} 
              showTrend={true}
              height={350}
            />
          </div>

          {/* Quick order analytics */}
          <OrderAnalytics 
            period={period} 
            showDetailed={false}
            height={250}
          />
        </TabsContent>

        {/* Revenue Analysis Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueChart 
            period={period} 
            type="line" 
            showComparison={true}
            height={500}
          />
        </TabsContent>

        {/* Equipment Analysis Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <EquipmentUtilization 
            period={period} 
            showTrend={true}
            height={500}
          />
        </TabsContent>

        {/* Order Analysis Tab */}
        <TabsContent value="orders" className="space-y-6">
          <OrderAnalytics 
            period={period} 
            showDetailed={true}
            height={500}
          />
        </TabsContent>
      </Tabs>

      {/* Quick insights footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">Performans Artışı</h4>
              <p className="text-sm text-blue-700">
                Verilerinizi analiz ederek iş performansınızı artırın
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Gerçek Zamanlı İzleme</h4>
              <p className="text-sm text-green-700">
                Anlık verilerle işinizi yakından takip edin
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Özelleştirilebilir</h4>
              <p className="text-sm text-purple-700">
                Raporları ihtiyaçlarınıza göre özelleştirin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;