import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  FileCheck
} from 'lucide-react';
import axios from 'axios';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  dataSource: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  _count?: {
    generatedReports: number;
    schedules: number;
  };
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'templates'>('analytics');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/test-reports/templates`);
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (templateId: number, format: string) => {
    try {
      setGeneratingId(templateId);
      
      const response = await axios.get(
        `${API_URL}/api/test-reports/generate/${templateId}?format=${format}`,
        {
          responseType: format === 'json' ? 'json' : 'blob',
        }
      );

      if (format === 'json') {
        // Show JSON in console or modal
        console.log('Report Data:', response.data);
        alert(`Report generated! Check console for data. Rows: ${response.data.report.rowCount}`);
      } else {
        // Download file
        const template = templates.find(t => t.id === templateId);
        const filename = `${template?.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Check console for details.');
    } finally {
      setGeneratingId(null);
    }
  };

  const getIcon = (dataSource: string) => {
    switch (dataSource) {
      case 'orders':
        return <FileText className="w-5 h-5" />;
      case 'equipment':
        return <Package className="w-5 h-5" />;
      case 'customers':
        return <Users className="w-5 h-5" />;
      case 'payments':
        return <DollarSign className="w-5 h-5" />;
      case 'reservations':
        return <Calendar className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getDataSourceBadge = (dataSource: string) => {
    const colors: Record<string, string> = {
      orders: 'bg-blue-100 text-blue-800',
      equipment: 'bg-green-100 text-green-800',
      customers: 'bg-purple-100 text-purple-800',
      payments: 'bg-yellow-100 text-yellow-800',
      reservations: 'bg-pink-100 text-pink-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[dataSource] || 'bg-gray-100 text-gray-800'}`}>
        {dataSource.charAt(0).toUpperCase() + dataSource.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading report templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              Raporlar & Analiz
            </h1>
            <p className="text-gray-600 mt-2">
              Canlı analiz ve rapor şablonlarına tek yerden erişin
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Canlı Analiz
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileCheck className="w-5 h-5" />
            Rapor Şablonları
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <AnalyticsDashboard />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Şablon</p>
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Şablonlar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {templates.filter(t => t.isActive).length}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Varsayılan Şablonlar</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {templates.filter(t => t.isDefault).length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Veri Kaynakları</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(templates.map(t => t.dataSource)).size}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

      {/* Format Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Export Format
        </label>
        <div className="flex gap-2">
          {(['excel', 'pdf', 'csv'] as const).map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFormat === format
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  {getIcon(template.dataSource)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  {template.isDefault && (
                    <span className="text-xs text-gray-500">Default Template</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {template.description}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              {getDataSourceBadge(template.dataSource)}
              {template.isActive ? (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </div>

            {/* Stats */}
            {template._count && (
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <span>📊 {template._count.generatedReports} reports</span>
                <span>⏰ {template._count.schedules} schedules</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => generateReport(template.id, selectedFormat)}
                disabled={generatingId === template.id}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  generatingId === template.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {generatingId === template.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
              <button
                onClick={() => generateReport(template.id, 'json')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Preview data"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Şablon bulunamadı</h3>
          <p className="text-gray-600">Başlamak için ilk rapor şablonunuzu oluşturun</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default Reports;
