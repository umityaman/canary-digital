import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FileText, Download, Upload, Edit3, Eye, Plus,
  FileCheck, DollarSign, Truck, Receipt, Wrench,
  Briefcase, FileSignature, Printer, Save, X, Archive, Settings, BarChart3
} from 'lucide-react'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analytics Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 rounded-xl border border-red-200">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Analytics Yüklenemedi</h3>
            <p className="text-neutral-600 mb-4">
              {this.state.error?.message || 'Bilinmeyen bir hata oluştu'}
            </p>
            <details className="text-left mt-4 p-4 bg-white rounded border border-red-200">
              <summary className="cursor-pointer font-medium text-red-700 mb-2">Teknik Detaylar</summary>
              <pre className="text-xs text-neutral-600 overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

type DocumentType = 'contract' | 'quote' | 'waybill' | 'invoice' | 'proforma' | 'service' | 'letterhead'
type Tab = 'templates' | 'recent' | 'archived' | 'analytics' | 'settings';

interface DocumentTemplate {
  id: string
  type: DocumentType
  name: string
  description: string
  icon: React.ReactNode
  fields: string[]
  hasCustomTemplate: boolean
}

export default function Documents() {
  const [searchParams] = useSearchParams();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('templates');

  // Set active tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['templates', 'recent', 'archived', 'analytics', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'templates' as const, label: 'Şablonlar', icon: <FileText size={18} />, description: 'Döküman şablonları' },
    { id: 'recent' as const, label: 'Son Dökümanlar', icon: <FileCheck size={18} />, description: 'Son oluşturulanlar' },
    { id: 'archived' as const, label: 'Arşiv', icon: <Archive size={18} />, description: 'Arşivlenmiş dökümanlar' },
    { id: 'analytics' as const, label: 'Analiz', icon: <BarChart3 size={18} />, description: 'Raporlar ve analizler' },
    { id: 'settings' as const, label: 'Ayarlar', icon: <Settings size={18} />, description: 'Döküman ayarları' },
  ];

  const templates: DocumentTemplate[] = [
    {
      id: '1',
      type: 'contract',
      name: 'Kiralama Sözleşmesi',
      description: 'Ekipman kiralama sözleşmesi - Müşteri bilgileri, kiralanan ekipmanlar, hukuki şartlar ve imza alanları',
      icon: <FileSignature className="text-neutral-700" size={28} />,
      fields: ['Müşteri Bilgileri', 'Kiralanan Ekipmanlar', 'Kiralama Süresi', 'Fiyat', 'Hukuki Şartlar', 'İmza Alanları'],
      hasCustomTemplate: false
    },
    {
      id: '2',
      type: 'quote',
      name: 'Fiyat Teklifi',
      description: 'Kiralama fiyat teklifi - Müşteri bilgileri, teklif edilen ekipmanlar ve fiyatlandırma detayları',
      icon: <DollarSign className="text-neutral-700" size={28} />,
      fields: ['Müşteri Bilgileri', 'Teklif Edilen Ekipmanlar', 'Birim Fiyatlar', 'İndirimler', 'Toplam Tutar', 'Geçerlilik Süresi'],
      hasCustomTemplate: false
    },
    {
      id: '3',
      type: 'waybill',
      name: 'Sevk İrsaliyesi',
      description: 'Ekipman sevk irsaliyesi - Gönderen/alıcı bilgileri ve sevk edilen ürün listesi',
      icon: <Truck className="text-neutral-700" size={28} />,
      fields: ['Gönderen Bilgileri', 'Alıcı Bilgileri', 'Sevk Tarihi', 'Ürün Listesi', 'Taşıyıcı Firma', 'Teslim Alan İmzası'],
      hasCustomTemplate: false
    },
    {
      id: '4',
      type: 'invoice',
      name: 'Fatura',
      description: 'Yasal fatura şablonu - e-Fatura entegrasyonu ve yasal düzenlemelere uygun format',
      icon: <Receipt className="text-neutral-700" size={28} />,
      fields: ['Fatura No', 'Müşteri Bilgileri', 'Ürün/Hizmet Listesi', 'KDV', 'Toplam Tutar', 'Yasal Bilgiler'],
      hasCustomTemplate: false
    },
    {
      id: '5',
      type: 'proforma',
      name: 'Proforma Fatura',
      description: 'Proforma fatura - Ön fatura ve ödeme planı bilgileri',
      icon: <FileCheck className="text-neutral-700" size={28} />,
      fields: ['Proforma No', 'Müşteri Bilgileri', 'Ürün Listesi', 'Ödeme Koşulları', 'Geçerlilik Süresi'],
      hasCustomTemplate: false
    },
    {
      id: '6',
      type: 'service',
      name: 'Teknik Servis Raporu',
      description: 'Ekipman bakım ve onarım raporu - Servis detayları ve teknisyen notları',
      icon: <Wrench className="text-neutral-700" size={28} />,
      fields: ['Ekipman Bilgileri', 'Arıza/Bakım Açıklaması', 'Yapılan İşlemler', 'Kullanılan Parçalar', 'Teknisyen', 'Tarih'],
      hasCustomTemplate: false
    },
    {
      id: '7',
      type: 'letterhead',
      name: 'Antetli Kağıt',
      description: 'Şirket antetli kağıt şablonu - Resmi yazışmalar için kullanılır',
      icon: <Briefcase className="text-neutral-700" size={28} />,
      fields: ['Şirket Logosu', 'Şirket Bilgileri', 'İletişim Bilgileri', 'İçerik Alanı'],
      hasCustomTemplate: false
    }
  ]

  const handleCreateDocument = (type: DocumentType) => {
    setSelectedDoc(type)
    setShowEditor(true)
  }

  const handleUploadTemplate = (type: DocumentType) => {
    alert(`${type} için özel şablon yükleme özelliği yakında eklenecek!`)
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <FileText className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">156</h3>
          <p className="text-sm text-neutral-600">Oluşturulan Döküman</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <FileSignature className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">42</h3>
          <p className="text-sm text-neutral-600">Kiralama Sözleşmesi</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Receipt className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">89</h3>
          <p className="text-sm text-neutral-600">Kesilen Fatura</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Download className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Toplam</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">1,247</h3>
          <p className="text-sm text-neutral-600">PDF İndirme</p>
        </div>
      </div>

      {/* Tab Navigation + Content */}
      <div className="flex gap-6">
        {/* Vertical Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p
                  className={`text-xs ml-7 ${
                    activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'templates' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Döküman Şablonları</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                  <Plus size={18} />
                  <span>Özel Şablon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-200">
                  {template.icon}
                </div>
                {template.hasCustomTemplate && (
                  <span className="px-2 py-1 bg-neutral-100 text-green-700 text-xs font-medium rounded-lg">
                    Özel Şablon
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-2">{template.name}</h3>
              <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{template.description}</p>

              <div className="mb-4">
                <p className="text-xs font-medium text-neutral-500 mb-2">İçerik Alanları:</p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((field, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white text-neutral-700 text-xs rounded-lg border border-neutral-200">
                      {field}
                    </span>
                  ))}
                  {template.fields.length > 3 && (
                    <span className="px-2 py-1 bg-white text-neutral-500 text-xs rounded-lg border border-neutral-200">
                      +{template.fields.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCreateDocument(template.type)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm"
                >
                  <Plus size={16} />
                  <span>Oluştur</span>
                </button>
                <button
                  onClick={() => handleUploadTemplate(template.type)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
                >
                  <Upload size={16} />
                  <span>Şablon</span>
                </button>
              </div>
            </div>
          ))}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Son Dökümanlar</h2>
                <button className="text-neutral-700 hover:text-neutral-900 text-sm font-medium">
                  Tümünü Gör →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Döküman</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tür</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Müşteri/Proje</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tarih</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Durum</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'DOC-2025-001', type: 'Kiralama Sözleşmesi', client: 'ABC Film Yapım', date: '09.10.2025', status: 'İmzalandı', statusColor: 'green' },
                { id: 'DOC-2025-002', type: 'Fiyat Teklifi', client: 'XYZ Prodüksiyon', date: '09.10.2025', status: 'Gönderildi', statusColor: 'blue' },
                { id: 'DOC-2025-003', type: 'Fatura', client: 'Mega Reklam', date: '08.10.2025', status: 'Ödendi', statusColor: 'green' },
                { id: 'DOC-2025-004', type: 'Sevk İrsaliyesi', client: 'Star Production', date: '08.10.2025', status: 'Teslim Edildi', statusColor: 'green' },
                { id: 'DOC-2025-005', type: 'Teknik Servis Raporu', client: 'Sony A7S III - #12345', date: '07.10.2025', status: 'Tamamlandı', statusColor: 'gray' },
              ].map((doc) => (
                <tr key={doc.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-neutral-400" size={18} />
                      <span className="font-medium text-neutral-900">{doc.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-neutral-600">{doc.type}</td>
                  <td className="py-4 px-4 text-sm text-neutral-900">{doc.client}</td>
                  <td className="py-4 px-4 text-sm text-neutral-600">{doc.date}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.statusColor === 'green' ? 'bg-neutral-100 text-green-700' :
                      doc.statusColor === 'blue' ? 'bg-neutral-100 text-blue-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors" title="Görüntüle">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors" title="Düzenle">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors" title="PDF İndir">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors" title="Yazdır">
                        <Printer size={16} />
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

          {activeTab === 'archived' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Arşivlenmiş Dökümanlar</h2>
              <div className="text-center py-12">
                <Archive className="mx-auto text-neutral-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Henüz arşivlenmiş döküman yok</h3>
                <p className="text-neutral-600">
                  Arşivlenen dökümanlar burada görünecek
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Raporlar ve Analizler</h2>
              <ErrorBoundary>
                <AnalyticsDashboard />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Döküman Ayarları</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Şirket Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Şirket Adı</label>
                      <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-xl" placeholder="Canary Digital" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Vergi No</label>
                      <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-xl" placeholder="1234567890" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Telefon</label>
                      <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-xl" placeholder="+90 (555) 123 45 67" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">E-posta</label>
                      <input type="email" className="w-full px-4 py-2 border border-neutral-300 rounded-xl" placeholder="info@canary.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Adres</label>
                      <textarea className="w-full px-4 py-2 border border-neutral-300 rounded-xl" rows={3} placeholder="Şirket adresi..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Logo & Antet Ayarları</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Şirket Logosu</label>
                      <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                        <Upload size={18} />
                        <span>Logo Yükle</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Antet Şablonu</label>
                      <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                        <Upload size={18} />
                        <span>Şablon Yükle</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <button className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                    <Save className="inline mr-2" size={18} />
                    Ayarları Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Editor Modal (Placeholder) */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900">Döküman Editörü</h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center">
                <FileText className="mx-auto text-neutral-400 mb-4" size={64} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Döküman Editörü</h3>
                <p className="text-neutral-600 mb-6">
                  Gelişmiş döküman editörü özelliği yakında eklenecek.
                  <br />
                  Şablon düzenleme, veri girişi ve PDF oluşturma işlevleri burada olacak.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                    <Save className="inline mr-2" size={16} />
                    Kaydet
                  </button>
                  <button className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                    <Download className="inline mr-2" size={16} />
                    PDF İndir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}