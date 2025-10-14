import React, { useState } from 'react';
import { BarChart3, TrendingUp, Package, Users, PieChart, FileText } from 'lucide-react';
import DashboardWidget from '../components/reports/DashboardWidget';

type ReportView = 'dashboard' | 'revenue' | 'equipment' | 'customers' | 'categories';

const Reports: React.FC = () => {
  const [currentView, setCurrentView] = useState<ReportView>('dashboard');

  // Get companyId from localStorage (should be from auth context in production)
  const companyId = 1;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardWidget companyId={companyId} />;
      case 'revenue':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Gelir Raporu</h3>
            <p className="text-gray-500">Gelir raporlama grafikleri yakında eklenecek...</p>
          </div>
        );
      case 'equipment':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ekipman Performans Raporu</h3>
            <p className="text-gray-500">Ekipman analizi yakında eklenecek...</p>
          </div>
        );
      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Müşteri Raporu</h3>
            <p className="text-gray-500">Müşteri analizi yakında eklenecek...</p>
          </div>
        );
      case 'categories':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Kategori Raporu</h3>
            <p className="text-gray-500">Kategori analizi yakında eklenecek...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Raporlar ve Analizler
          </h1>
          <p className="text-gray-600 mt-1">
            İşletmenizin performansını analiz edin ve raporlayın
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('revenue')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                currentView === 'revenue'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Gelir Raporu
            </button>
            <button
              onClick={() => setCurrentView('equipment')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                currentView === 'equipment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package className="w-5 h-5" />
              Ekipman Analizi
            </button>
            <button
              onClick={() => setCurrentView('customers')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                currentView === 'customers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-5 h-5" />
              Müşteri Analizi
            </button>
            <button
              onClick={() => setCurrentView('categories')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                currentView === 'categories'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <PieChart className="w-5 h-5" />
              Kategori Analizi
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Reports;
