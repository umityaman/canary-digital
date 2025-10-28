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
  Settings,
  DollarSign,
  CreditCard,
  FileText,
  Percent
} from 'lucide-react';
import api from '../../utils/api';

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

  // Analytics data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);
  const [profitLossData, setProfitLossData] = useState<any>(null);
  const [offersData, setOffersData] = useState<any>(null);

  // Hata mesajı state'i
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = period === '1y' ? 'period=ytd' : `period=${period}`;

      // Load all analytics endpoints
      const [dashboard, revenue, expenses, profitLoss, offers] = await Promise.all([
        api.get(`/analytics/dashboard?${params}`),
        api.get(`/analytics/revenue?${params}`),
        api.get(`/analytics/expenses?${params}`),
        api.get(`/analytics/profit-loss?${params}`),
        api.get(`/analytics/offers-conversion?${params}`)
      if (compact) {
        return (
          <div className="space-y-4">
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
            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{errorMessage}</div>
            )}
            {dashboardData && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Gelir</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                          ₺{dashboardData.revenue?.totalRevenue?.toLocaleString() || 0}
                        </h3>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                {/* ...diğer kartlar... */}
              </div>
            )}
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
            </Button>
          </div>
        </div>

        {/* Hata mesajı göster */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {/* KPI Cards from real data */}
        {dashboardData && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Kar</p>
                    <h3 className={`text-2xl font-bold mt-1 ${dashboardData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₺{dashboardData.profit?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Kar Marjı</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      %{dashboardData.profitMargin?.toFixed(1) || 0}
                    </h3>
                  return (
                    <div className="space-y-6">
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
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" onClick={() => exportData('pdf')} className="text-xs">
                                  <Download className="w-3 h-3 mr-1" /> PDF
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => exportData('excel')} className="text-xs">
                                  <Download className="w-3 h-3 mr-1" /> Excel
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => exportData('csv')} className="text-xs">
                                  <Download className="w-3 h-3 mr-1" /> CSV
                                </Button>
                              </div>
                              <Button variant="outline" size="sm" onClick={refreshAllData} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}</span>
                              <Badge variant="secondary" className="text-xs">Canlı Veri</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Eye className="w-4 h-4" />
                              <span>Gerçek zamanlı analiz</span>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                      {errorMessage && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{errorMessage}</div>
                      )}
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                          <TabsTrigger value="revenue">Gelir Analizi</TabsTrigger>
                          <TabsTrigger value="equipment">Ekipman Analizi</TabsTrigger>
                          <TabsTrigger value="orders">Sipariş Analizi</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-6">
                          <div>
                            {dashboardData && (
                              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Toplam Gelir</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                          ₺{dashboardData.revenue?.totalRevenue?.toLocaleString() || 0}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {dashboardData.revenue?.invoiceCount || 0} fatura
                                        </p>
                                      </div>
                                      <div className="p-3 bg-green-100 rounded-full">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                {/* ...diğer kartlar... */}
                              </div>
                            )}
                            <div className="space-y-6">
                              <RevenueChart period={period} type="area" showComparison={true} height={350} />
                              <EquipmentUtilization period={period} showTrend={true} height={350} />
                            </div>
                            <OrderAnalytics period={period} showDetailed={false} height={250} />
                          </div>
                        </TabsContent>
                        <TabsContent value="revenue" className="space-y-6">
                          <div>
                            <RevenueChart period={period} type="line" showComparison={true} height={500} />
                          </div>
                        </TabsContent>
                        <TabsContent value="equipment" className="space-y-6">
                          <div>
                            <EquipmentUtilization period={period} showTrend={true} height={500} />
                          </div>
                        </TabsContent>
                        <TabsContent value="orders" className="space-y-6">
                          <div>
                            <OrderAnalytics period={period} showDetailed={true} height={500} />
                          </div>
                        </TabsContent>
                      </Tabs>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                              <h4 className="font-semibold text-blue-900">Performans Artışı</h4>
                              <p className="text-sm text-blue-700">Verilerinizi analiz ederek iş performansınızı artırın</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <h4 className="font-semibold text-green-900">Gerçek Zamanlı İzleme</h4>
                              <p className="text-sm text-green-700">Anlık verilerle işinizi yakından takip edin</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                              <h4 className="font-semibold text-purple-900">Özelleştirilebilir</h4>
                              <p className="text-sm text-purple-700">Raporları ihtiyaçlarınıza göre özelleştirin</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Teklif Dönüşümü</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        %{dashboardData.offers?.conversionRate?.toFixed(1) || 0}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {dashboardData.offers?.convertedOffers || 0}/{dashboardData.offers?.totalOffers || 0} teklif
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
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