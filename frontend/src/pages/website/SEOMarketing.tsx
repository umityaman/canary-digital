import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Eye,
  Tag,
  Globe,
  FileText,
  BarChart3,
  Percent,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface SEOPage {
  id: number;
  pageName: string;
  url: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  score: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

const SEOMarketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'seo' | 'campaigns' | 'analytics'>('seo');

  const seoPages: SEOPage[] = [
    {
      id: 1,
      pageName: 'Ana Sayfa',
      url: '/',
      title: 'Kamera ve Ekipman Kiralama - Canary Rental',
      metaDescription:
        'Profesyonel kamera, objektif ve video ekipmanları kiralama hizmeti...',
      keywords: ['kamera kiralama', 'ekipman', 'video'],
      score: 85,
      impressions: 12500,
      clicks: 1250,
      ctr: 10.0,
    },
    {
      id: 2,
      pageName: 'Ürünler',
      url: '/products',
      title: 'Kiralık Kameralar ve Ekipmanlar | Canary Rental',
      metaDescription: 'Sony A7 IV, Canon EOS R6 ve daha fazlası. Günlük kiralama...',
      keywords: ['sony a7', 'canon eos', 'kiralık kamera'],
      score: 78,
      impressions: 8500,
      clicks: 680,
      ctr: 8.0,
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Yeni Yıl Kampanyası',
      type: 'discount',
      code: 'NEWYEAR2025',
      discount: 20,
      startDate: '01 Oca 2025',
      endDate: '31 Oca 2025',
      usageCount: 45,
      revenue: 125000,
      status: 'active',
    },
    {
      id: 2,
      name: 'İlk Kiralama İndirimi',
      type: 'discount',
      code: 'FIRST10',
      discount: 10,
      startDate: '15 Eki 2024',
      endDate: '31 Ara 2025',
      usageCount: 123,
      revenue: 85000,
      status: 'active',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neutral-900';
    if (score >= 60) return 'text-neutral-700';
    return 'text-neutral-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-neutral-900';
    if (score >= 60) return 'bg-neutral-700';
    return 'bg-neutral-500';
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Search size={32} className="text-neutral-900" />
              SEO & Dijital Pazarlama
            </h1>
            <p className="text-neutral-600 mt-1">
              Arama motoru optimizasyonu ve kampanya yönetimi
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Kampanya
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Ortalama SEO Skoru</span>
              <TrendingUp size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">82/100</div>
            <div className="text-xs text-neutral-600 mt-1">+5 puan bu ay</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Görüntülenme</span>
              <Eye size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">21K</div>
            <div className="text-xs text-neutral-600 mt-1">Son 30 gün</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Tıklama</span>
              <BarChart3 size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">1.9K</div>
            <div className="text-xs text-neutral-600 mt-1">CTR: 9.1%</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Aktif Kampanya</span>
              <Tag size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">8</div>
            <div className="text-xs text-neutral-600 mt-1">₺210K gelir</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'seo'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          SEO Yönetimi
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Kampanyalar
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <>
          {/* SEO Pages */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Sayfa SEO Durumu</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Sayfa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Meta Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Anahtar Kelimeler
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                      SEO Skoru
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                      Görüntülenme
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                      Tıklama
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {seoPages.map((page) => (
                    <tr key={page.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {page.pageName}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1">
                            <Globe size={12} />
                            {page.url}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-700 max-w-xs truncate">
                          {page.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {page.keywords.slice(0, 2).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                          {page.keywords.length > 2 && (
                            <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
                              +{page.keywords.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-2xl font-bold ${getScoreColor(page.score)}`}>
                            {page.score}
                          </span>
                          <div className="w-full bg-neutral-100 rounded-full h-2">
                            <div
                              className={`${getScoreBg(page.score)} h-full rounded-full`}
                              style={{ width: `${page.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                        {page.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                        {page.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                        {page.ctr.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Edit size={16} className="text-neutral-700" />
                          </button>
                          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <ExternalLink size={16} className="text-neutral-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sitemap & Robots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Sitemap Durumu
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">sitemap.xml</div>
                    <div className="text-xs text-neutral-600">45 sayfa kayıtlı</div>
                  </div>
                  <span className="px-3 py-1 bg-neutral-900 text-white text-xs rounded-full">
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">robots.txt</div>
                    <div className="text-xs text-neutral-600">Yapılandırıldı</div>
                  </div>
                  <span className="px-3 py-1 bg-neutral-900 text-white text-xs rounded-full">
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Globe size={20} />
                Google Entegrasyonlar
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      Google Analytics
                    </div>
                    <div className="text-xs text-neutral-600">GA4 - Aktif</div>
                  </div>
                  <button className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-lg hover:bg-neutral-200 transition-colors">
                    Ayarlar
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      Search Console
                    </div>
                    <div className="text-xs text-neutral-600">Bağlı</div>
                  </div>
                  <button className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-lg hover:bg-neutral-200 transition-colors">
                    Ayarlar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Kampanya Adı
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    İndirim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Başlangıç - Bitiş
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Kullanım
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Toplam Gelir
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-neutral-600">{campaign.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <code className="px-3 py-1 bg-neutral-100 text-neutral-900 text-xs font-mono rounded">
                        {campaign.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Percent size={14} className="text-neutral-700" />
                        <span className="text-sm font-bold text-neutral-900">
                          {campaign.discount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          {campaign.startDate} - {campaign.endDate}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                      {campaign.usageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                      ₺{campaign.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 bg-neutral-900 text-white text-xs rounded-full">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit size={16} className="text-neutral-700" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-neutral-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Trafik Kaynakları</h3>
            <div className="space-y-3">
              {[
                { source: 'Organik Arama', visitors: 8500, percentage: 45 },
                { source: 'Doğrudan', visitors: 5200, percentage: 28 },
                { source: 'Sosyal Medya', visitors: 3100, percentage: 16 },
                { source: 'Referans', visitors: 2100, percentage: 11 },
              ].map((source, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">{source.source}</span>
                    <span className="font-bold text-neutral-900">
                      {source.visitors.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div
                      className="bg-neutral-900 h-full rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">En İyi Performans</h3>
            <div className="space-y-3">
              {[
                { keyword: 'kamera kiralama', position: 3, clicks: 450 },
                { keyword: 'sony a7 kiralık', position: 5, clicks: 320 },
                { keyword: 'ekipman kiralama', position: 7, clicks: 280 },
                { keyword: 'video ekipmanı', position: 12, clicks: 180 },
              ].map((keyword, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {keyword.keyword}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {keyword.clicks} tıklama
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold rounded-full">
                    #{keyword.position}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOMarketing;
