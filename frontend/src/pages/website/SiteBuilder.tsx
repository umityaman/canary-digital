import React, { useState } from 'react';
import {
  Layout,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Check,
} from 'lucide-react';

interface Template {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  isActive: boolean;
}

const SiteBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'sites'>('templates');
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const templates: Template[] = [
    {
      id: 1,
      name: 'Kurumsal Kiralama',
      category: 'corporate',
      thumbnail: '/templates/corporate.jpg',
      description: 'Profesyonel ekipman kiralama platformu',
      isActive: true,
    },
    {
      id: 2,
      name: 'Modern Portfolio',
      category: 'rental',
      thumbnail: '/templates/modern.jpg',
      description: 'Sade ve şık kiralama sitesi',
      isActive: true,
    },
    {
      id: 3,
      name: 'Blog & Kiralama',
      category: 'blog',
      thumbnail: '/templates/blog.jpg',
      description: 'Blog entegreli kiralama platformu',
      isActive: true,
    },
  ];

  const [sites] = useState([
    {
      id: 1,
      name: 'Ana Kiralama Sitesi',
      domain: 'canary-rental.com',
      template: 'Kurumsal Kiralama',
      status: 'published',
      visitors: '12.5K',
      lastUpdated: '2 saat önce',
    },
    {
      id: 2,
      name: 'Blog Sitesi',
      domain: 'blog.canary-rental.com',
      template: 'Blog & Kiralama',
      status: 'draft',
      visitors: '3.2K',
      lastUpdated: '1 gün önce',
    },
  ]);

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <Layout size={32} className="text-neutral-900" />
          Site Oluşturma
        </h1>
        <p className="text-neutral-600 mt-1">
          Şablon seçin veya mevcut siteleri yönetin
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            Şablonlar
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'sites'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            Mevcut Siteler
          </button>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
          <Plus size={20} />
          Yeni Site Oluştur
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {/* Search & Filter */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Şablon ara..."
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <select className="px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white">
              <option value="all">Tüm Kategoriler</option>
              <option value="corporate">Kurumsal</option>
              <option value="rental">Kiralama</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Template Preview */}
                <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Monitor size={48} className="text-neutral-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors">
                      <Eye size={20} className="text-neutral-900" />
                    </button>
                    <button className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors">
                      <Edit size={20} className="text-neutral-900" />
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{template.name}</h3>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
                      {template.category === 'corporate'
                        ? 'Kurumsal'
                        : template.category === 'rental'
                        ? 'Kiralama'
                        : 'Blog'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium">
                    Bu Şablonu Kullan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sites Tab */}
      {activeTab === 'sites' && (
        <>
          {/* Device Preview Selector */}
          <div className="mb-6 flex items-center gap-2 bg-white p-2 rounded-xl border border-neutral-200 w-fit">
            <button
              onClick={() => setSelectedDevice('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                selectedDevice === 'desktop'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Monitor size={20} />
            </button>
            <button
              onClick={() => setSelectedDevice('tablet')}
              className={`p-2 rounded-lg transition-colors ${
                selectedDevice === 'tablet'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Tablet size={20} />
            </button>
            <button
              onClick={() => setSelectedDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                selectedDevice === 'mobile'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Smartphone size={20} />
            </button>
          </div>

          {/* Sites List */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Site Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Şablon
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                      Ziyaretçi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Son Güncelleme
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{site.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                          <Globe size={16} />
                          {site.domain}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {site.template}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {site.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 text-white">
                            <Check size={14} />
                            Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-neutral-200 text-neutral-900">
                            Taslak
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                        {site.visitors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {site.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Eye size={16} className="text-neutral-700" />
                          </button>
                          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Edit size={16} className="text-neutral-700" />
                          </button>
                          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Copy size={16} className="text-neutral-700" />
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
        </>
      )}
    </div>
  );
};

export default SiteBuilder;
