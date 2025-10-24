import { useState } from 'react'
import {
  Users, TrendingUp, DollarSign, GraduationCap, CheckCircle,
  Download, Calendar, BarChart3, PieChart, Activity
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function HRReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  // Turnover Data
  const turnoverData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: 'İşe Alınanlar',
        data: [12, 8, 15, 10, 12, 14],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Ayrılanlar',
        data: [3, 5, 2, 4, 3, 6],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  }

  // Department Distribution
  const departmentData = {
    labels: ['Teknoloji', 'Satış', 'Pazarlama', 'İK', 'Finans', 'Operasyon'],
    datasets: [
      {
        data: [85, 52, 38, 12, 28, 33],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
      },
    ],
  }

  // Salary Budget
  const salaryData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: 'Maaş Bütçesi (₺)',
        data: [486250, 492800, 501300, 515600, 523900, 538200],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İK Raporları ve Analizler</h2>
          <p className="text-neutral-600">
            Personel, performans ve bordro raporlarını görüntüleyin ve analiz edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bu Ay
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'quarter'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Çeyrek
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'year'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Yıllık
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600" size={20} />
            <TrendingUp className="text-green-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">248</h3>
          <p className="text-sm text-neutral-600">Toplam Çalışan</p>
          <p className="text-xs text-green-600 mt-1">+4.8% bu ay</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-purple-600" size={20} />
            <BarChart3 className="text-neutral-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">2.4%</h3>
          <p className="text-sm text-neutral-600">Turnover Oranı</p>
          <p className="text-xs text-green-600 mt-1">Sektör ortalamasının altında</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={20} />
            <Calendar className="text-neutral-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">₺538K</h3>
          <p className="text-sm text-neutral-600">Aylık Bordro</p>
          <p className="text-xs text-neutral-600 mt-1">Bu ay ödendi</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="text-orange-600" size={20} />
            <CheckCircle className="text-green-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">85%</h3>
          <p className="text-sm text-neutral-600">Eğitim Tamamlama</p>
          <p className="text-xs text-green-600 mt-1">Hedef: 80%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Chart */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">İşe Alım & Ayrılış Trendi</h3>
              <p className="text-sm text-neutral-600">Son 6 aylık veri</p>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Download size={20} className="text-neutral-600" />
            </button>
          </div>
          <div className="h-64">
            <Bar data={turnoverData} options={chartOptions} />
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Departman Dağılımı</h3>
              <p className="text-sm text-neutral-600">Personel sayısı</p>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Download size={20} className="text-neutral-600" />
            </button>
          </div>
          <div className="h-64">
            <Pie data={departmentData} options={chartOptions} />
          </div>
        </div>

        {/* Salary Budget Trend */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Maaş Bütçesi Trendi</h3>
              <p className="text-sm text-neutral-600">Aylık toplam</p>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Download size={20} className="text-neutral-600" />
            </button>
          </div>
          <div className="h-64">
            <Line data={salaryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personnel Report */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Personel Raporu</h3>
                <p className="text-sm text-neutral-600">Çalışan istatistikleri</p>
              </div>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="space-y-2 text-sm text-neutral-600 mb-4">
            <div className="flex items-center justify-between">
              <span>Toplam Çalışan:</span>
              <span className="font-medium text-neutral-900">248</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Yeni İşe Alımlar:</span>
              <span className="font-medium text-neutral-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ayrılanlar:</span>
              <span className="font-medium text-neutral-900">3</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
              Detaylı Rapor
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* Performance Report */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Performans Raporu</h3>
                <p className="text-sm text-neutral-600">Değerlendirme sonuçları</p>
              </div>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="space-y-2 text-sm text-neutral-600 mb-4">
            <div className="flex items-center justify-between">
              <span>Ortalama Puan:</span>
              <span className="font-medium text-neutral-900">4.2/5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tamamlanan:</span>
              <span className="font-medium text-neutral-900">186</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bekleyen:</span>
              <span className="font-medium text-neutral-900">62</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
              Detaylı Rapor
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Payroll Report */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-purple-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Bordro Raporu</h3>
                <p className="text-sm text-neutral-600">Maaş ödemeleri</p>
              </div>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="space-y-2 text-sm text-neutral-600 mb-4">
            <div className="flex items-center justify-between">
              <span>Bu Ay Toplam:</span>
              <span className="font-medium text-neutral-900">₺538.200</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ödenen:</span>
              <span className="font-medium text-neutral-900">₺538.200</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bekleyen:</span>
              <span className="font-medium text-neutral-900">₺0</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
              Detaylı Rapor
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* Training Report */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-orange-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Eğitim Raporu</h3>
                <p className="text-sm text-neutral-600">Tamamlanan eğitimler</p>
              </div>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="space-y-2 text-sm text-neutral-600 mb-4">
            <div className="flex items-center justify-between">
              <span>Toplam Eğitim:</span>
              <span className="font-medium text-neutral-900">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Katılımcı:</span>
              <span className="font-medium text-neutral-900">186</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tamamlanan:</span>
              <span className="font-medium text-neutral-900">142 (85%)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm">
              Detaylı Rapor
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
