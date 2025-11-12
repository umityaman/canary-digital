/**
 * Chart.js Examples Demo Page
 * Tüm chart örneklerini görüntülemek için demo sayfası
 * URL: /chart-examples (geliştirme amaçlı)
 */

import SimpleLineChart from '../components/charts/examples/SimpleLineChart';
import MultiDatasetBarChart from '../components/charts/examples/MultiDatasetBarChart';
import PieChartWithPercentages from '../components/charts/examples/PieChartWithPercentages';
import DynamicRevenueChart from '../components/charts/examples/DynamicRevenueChart';
import { ExampleUsage } from '../components/charts/examples/ReusableChartWrapper';

export default function ChartExamplesPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            📊 Chart.js Örnekleri
          </h1>
          <p className="text-neutral-600">
            Sprint 1 Analytics Dashboard için hazırlanmış chart örnekleri
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://www.chartjs.org/docs/latest/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Chart.js Docs →
            </a>
            <a
              href="https://react-chartjs-2.js.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              react-chartjs-2 Docs →
            </a>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="space-y-8">
          {/* Example 1: Simple Line Chart */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                1. Simple Line Chart
              </h2>
              <p className="text-sm text-neutral-600">
                Temel line chart örneği - Revenue trend gösterimi için ideal
              </p>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded mt-2 inline-block">
                frontend/src/components/charts/examples/SimpleLineChart.tsx
              </code>
            </div>
            <SimpleLineChart />
          </section>

          {/* Example 2: Multi-Dataset Bar Chart */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                2. Multi-Dataset Bar Chart
              </h2>
              <p className="text-sm text-neutral-600">
                Yıllık karşılaştırma için çoklu dataset bar chart
              </p>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded mt-2 inline-block">
                frontend/src/components/charts/examples/MultiDatasetBarChart.tsx
              </code>
            </div>
            <MultiDatasetBarChart />
          </section>

          {/* Example 3: Pie Chart with Percentages */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                3. Pie Chart with Percentages
              </h2>
              <p className="text-sm text-neutral-600">
                Kategori dağılımı için percentage'lı pie chart
              </p>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded mt-2 inline-block">
                frontend/src/components/charts/examples/PieChartWithPercentages.tsx
              </code>
            </div>
            <PieChartWithPercentages />
          </section>

          {/* Example 4: Dynamic Revenue Chart */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                4. Dynamic Revenue Chart
              </h2>
              <p className="text-sm text-neutral-600">
                Period selector ile dinamik veri yükleme örneği
              </p>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded mt-2 inline-block">
                frontend/src/components/charts/examples/DynamicRevenueChart.tsx
              </code>
            </div>
            <DynamicRevenueChart />
          </section>

          {/* Example 5: Reusable Chart Wrapper */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                5. Reusable Chart Wrapper
              </h2>
              <p className="text-sm text-neutral-600">
                Generic, type-safe, tekrar kullanılabilir chart component
              </p>
              <code className="text-xs bg-neutral-100 px-2 py-1 rounded mt-2 inline-block">
                frontend/src/components/charts/examples/ReusableChartWrapper.tsx
              </code>
            </div>
            <ExampleUsage />
          </section>
        </div>

        {/* Footer with Learning Tips */}
        <div className="mt-12 bg-blue-50 border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Öğrenme İpuçları
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Her örneğin kaynak kodunu inceleyin</li>
            <li>• Chart.js options'ları değiştirerek denemeler yapın</li>
            <li>• Kendi verilerinizle test edin</li>
            <li>• Responsive behavior'ı mobil görünümde kontrol edin</li>
            <li>• Performance'ı büyük veri setleriyle test edin</li>
          </ul>
        </div>

        {/* Quick Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <h4 className="font-semibold text-neutral-900 mb-3">🎨 Renk Paleti</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500"></div>
                <code className="text-xs">#3b82f6</code>
                <span className="text-sm text-neutral-600">Primary Blue</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-500"></div>
                <code className="text-xs">#10b981</code>
                <span className="text-sm text-neutral-600">Success Green</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500"></div>
                <code className="text-xs">#f59e0b</code>
                <span className="text-sm text-neutral-600">Warning Amber</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-500"></div>
                <code className="text-xs">#ef4444</code>
                <span className="text-sm text-neutral-600">Danger Red</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-500"></div>
                <code className="text-xs">#8b5cf6</code>
                <span className="text-sm text-neutral-600">Purple</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <h4 className="font-semibold text-neutral-900 mb-3">📚 Kaynak Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.chartjs.org/docs/latest/samples/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Chart.js Examples
                </a>
              </li>
              <li>
                <a
                  href="https://react-chartjs-2.js.org/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  react-chartjs-2 Examples
                </a>
              </li>
              <li>
                <a
                  href="https://www.chartjs.org/docs/latest/configuration/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Configuration Options
                </a>
              </li>
              <li>
                <a
                  href="https://www.chartjs.org/docs/latest/developers/plugins.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Chart.js Plugins
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
