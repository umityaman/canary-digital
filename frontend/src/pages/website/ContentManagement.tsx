import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Image,
  Video,
  File,
  Folder,
} from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  author: string;
  lastModified: string;
  views: number;
}

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'blog' | 'media'>('pages');

  const pages: Page[] = [
    {
      id: 1,
      title: 'Ana Sayfa',
      slug: '/',
      status: 'published',
      author: 'Admin',
      lastModified: '2 saat önce',
      views: 3500,
    },
    {
      id: 2,
      title: 'Ürünlerimiz',
      slug: '/products',
      status: 'published',
      author: 'Admin',
      lastModified: '5 saat önce',
      views: 2100,
    },
    {
      id: 3,
      title: 'Hakkımızda',
      slug: '/about',
      status: 'draft',
      author: 'Editor',
      lastModified: '1 gün önce',
      views: 890,
    },
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'Kamera Kiralama İpuçları',
      category: 'Rehber',
      author: 'Content Team',
      publishDate: '15 Ekim 2025',
      status: 'published',
      views: 1250,
    },
    {
      id: 2,
      title: 'En İyi Ekipman Seçimi',
      category: 'İnceleme',
      author: 'Tech Writer',
      publishDate: '18 Ekim 2025',
      status: 'scheduled',
      views: 0,
    },
  ];

  const mediaFiles = [
    {
      id: 1,
      name: 'hero-image.jpg',
      type: 'image',
      size: '2.4 MB',
      uploadDate: '10 Ekim 2025',
      dimensions: '1920x1080',
    },
    {
      id: 2,
      name: 'product-video.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadDate: '12 Ekim 2025',
      duration: '2:15',
    },
    {
      id: 3,
      name: 'catalog-2025.pdf',
      type: 'document',
      size: '8.7 MB',
      uploadDate: '14 Ekim 2025',
      pages: 24,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-neutral-900 text-white',
      draft: 'bg-neutral-200 text-neutral-900',
      scheduled: 'bg-neutral-600 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-900';
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={20} className="text-neutral-700" />;
      case 'video':
        return <Video size={20} className="text-neutral-700" />;
      case 'document':
        return <File size={20} className="text-neutral-700" />;
      default:
        return <File size={20} className="text-neutral-700" />;
    }
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <FileText size={32} className="text-neutral-900" />
              İçerik Yönetimi
            </h1>
            <p className="text-neutral-600 mt-1">
              Sayfalar, blog yazıları ve medya dosyalarınızı yönetin
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni İçerik
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Sayfa</span>
              <FileText size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">45</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Blog Yazısı</span>
              <Calendar size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">28</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Medya Dosyası</span>
              <Image size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">156</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Görüntüleme</span>
              <Eye size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">12.5K</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'pages'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Sayfalar
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'blog'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Blog
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'media'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Medya
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="İçerik ara..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors">
          <Filter size={20} />
          Filtrele
        </button>
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Sayfa Başlığı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Yazar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Görüntülenme
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
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{page.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {page.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          page.status
                        )}`}
                      >
                        {page.status === 'published'
                          ? 'Yayında'
                          : page.status === 'draft'
                          ? 'Taslak'
                          : 'Zamanlanmış'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {page.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {page.lastModified}
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

      {/* Blog Tab */}
      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{post.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Tag size={14} />
                    <span>{post.category}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    post.status
                  )}`}
                >
                  {post.status === 'published'
                    ? 'Yayında'
                    : post.status === 'draft'
                    ? 'Taslak'
                    : 'Zamanlanmış'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{post.publishDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={14} />
                  <span>{post.views.toLocaleString()} görüntülenme</span>
                </div>
              </div>

              <div className="text-sm text-neutral-600 mb-4">
                <span className="font-medium">Yazar:</span> {post.author}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                  Önizle
                </button>
                <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Folder size={20} className="text-neutral-700" />
            <span className="text-sm text-neutral-600">Tüm Dosyalar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">
                  {getMediaIcon(file.type)}
                </div>
                <div className="text-sm font-medium text-neutral-900 mb-1 truncate">
                  {file.name}
                </div>
                <div className="text-xs text-neutral-600 mb-2">{file.size}</div>
                <div className="text-xs text-neutral-500">{file.uploadDate}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContentManagement;
