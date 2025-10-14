import { useState } from 'react'
import {
  FileText, Download, Upload, Edit3, Eye, Plus,
  FileCheck, DollarSign, Truck, Receipt, Wrench,
  Briefcase, FileSignature, Printer, Save, X
} from 'lucide-react'

type DocumentType = 'contract' | 'quote' | 'waybill' | 'invoice' | 'proforma' | 'service' | 'letterhead'

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
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null)
  const [showEditor, setShowEditor] = useState(false)

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

      {/* Document Templates Grid */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Döküman Şablonları</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
            <Plus size={18} />
            <span>Özel Şablon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Recent Documents */}
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