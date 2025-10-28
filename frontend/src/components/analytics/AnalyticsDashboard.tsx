import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Settings, FileText, Percent } from 'lucide-react';
import RevenueChart from './RevenueChart';
import EquipmentUtilization from './EquipmentUtilization';
import OrderAnalytics from './OrderAnalytics';

interface AnalyticsDashboardProps {
  companyId?: number;
  defaultPeriod?: '1d' | '7d' | '30d' | '90d' | '1y';
  compact?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    defaultPeriod = '30d',
    compact,
    companyId
  }) => {
    const [period, setPeriod] = useState(defaultPeriod);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const loadAnalyticsData = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        // Burada API'den veri çekme işlemleri olacak
        // Örnek:
        // const response = await api.get(`/analytics?period=${period}`);
        // setDashboardData(response.data);
        // setLastUpdated(new Date());
      } catch (error: any) {
        setErrorMessage('Veri yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    // Ana componentin JSX return bloğu
    return (
      <div className="space-y-6">
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
                </div>
                <Percent className="w-8 h-8 text-purple-600" />
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
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overview charts - Alt Alta */}
      <div className="space-y-6">
        <RevenueChart period={period} type="area" showComparison={true} height={350} />
        <EquipmentUtilization period={period} showTrend={true} height={350} />
      </div>

      {/* Quick order analytics */}
      <OrderAnalytics period={period} showDetailed={false} height={250} />

      {/* Quick insights footer */}
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
  );
};
export default AnalyticsDashboard;