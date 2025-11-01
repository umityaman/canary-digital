import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { 
  Send, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface GIBIntegrationProps {
  invoiceId?: string
  onSuccess?: () => void
}

const GIBIntegration: React.FC<GIBIntegrationProps> = ({ invoiceId, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [generatedXML, setGeneratedXML] = useState<string>('')
  const [showXMLPreview, setShowXMLPreview] = useState(false)
  const [gibResponse, setGibResponse] = useState<any>(null)

  // Sample invoice data for testing
  const getSampleInvoiceData = () => {
    return {
      invoiceId: invoiceId || `INV-${Date.now()}`,
      uuid: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      issueDate: new Date().toISOString().split('T')[0],
      invoiceTypeCode: 'SATIS',
      documentCurrencyCode: 'TRY',
      
      supplier: {
        partyName: 'Canary Digital Ekipman Kiralama A.Ş.',
        taxOffice: 'Beşiktaş',
        taxNumber: '1234567890',
        address: 'Örnek Mahallesi Test Sokak No:1',
        citySubdivisionName: 'Beşiktaş',
        cityName: 'İstanbul',
        postalZone: '34000',
        country: 'Türkiye',
        telephone: '+90 212 123 4567',
        email: 'info@canary.com',
        website: 'www.canary.com'
      },
      
      customer: {
        partyName: 'Örnek Müşteri Ltd. Şti.',
        taxOffice: 'Kadıköy',
        taxNumber: '0987654321', // Set to empty for e-Arşiv test
        address: 'Test Mahallesi Örnek Sokak No:2',
        citySubdivisionName: 'Kadıköy',
        cityName: 'İstanbul',
        postalZone: '34700',
        country: 'Türkiye',
        telephone: '+90 216 987 6543',
        email: 'musteri@example.com'
      },
      
      lines: [
        {
          lineId: '1',
          itemName: 'Sony A7S III Kamera Kiralama (3 Gün)',
          quantity: 3,
          unitCode: 'DAY',
          priceAmount: 1500.00,
          taxPercent: 20,
          taxAmount: 900.00,
          lineExtensionAmount: 4500.00
        },
        {
          lineId: '2',
          itemName: 'Canon RF 24-70mm Lens Kiralama (3 Gün)',
          quantity: 3,
          unitCode: 'DAY',
          priceAmount: 500.00,
          taxPercent: 20,
          taxAmount: 300.00,
          lineExtensionAmount: 1500.00
        }
      ],
      
      lineExtensionAmount: 6000.00,
      taxExclusiveAmount: 6000.00,
      taxInclusiveAmount: 7200.00,
      payableAmount: 7200.00,
      
      note: 'Ekipman kiralama faturası - Test amaçlıdır'
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    const token = localStorage.getItem('token')

    try {
      const response = await axios.get(
        `${API_URL}/api/accounting/gib/test-connection`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setConnectionStatus(response.data.success)
      
      if (response.data.success) {
        toast.success('GİB servisleri erişilebilir ✓')
      } else {
        toast.error('GİB servisleri erişilemiyor')
      }
    } catch (error: any) {
      setConnectionStatus(false)
      toast.error(error.response?.data?.message || 'Bağlantı testi başarısız')
    } finally {
      setTestingConnection(false)
    }
  }

  const generateXML = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      const invoiceData = getSampleInvoiceData()
      
      const response = await axios.post(
        `${API_URL}/api/accounting/gib/generate-xml`,
        invoiceData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setGeneratedXML(response.data.data.xml)
      setShowXMLPreview(true)
      toast.success('XML başarıyla oluşturuldu')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'XML oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const sendToGIB = async (invoiceType: 'efatura' | 'earsiv') => {
    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      const invoiceData = getSampleInvoiceData()
      
      // e-Arşiv için vergi numarasını kaldır, TC kimlik no ekle
      if (invoiceType === 'earsiv') {
        invoiceData.customer.taxNumber = ''
        invoiceData.customer.tcKimlikNo = '12345678901'
        delete invoiceData.customer.taxOffice
      }

      const response = await axios.post(
        `${API_URL}/api/accounting/gib/send-invoice`,
        invoiceData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setGibResponse(response.data.data)
      
      if (response.data.success) {
        toast.success(response.data.message)
        onSuccess?.()
      } else {
        toast.error(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fatura gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  const downloadXML = () => {
    if (!generatedXML) return

    const blob = new Blob([generatedXML], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${Date.now()}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('XML indirildi')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">GİB Entegrasyonu</h2>
            <p className="text-sm text-neutral-600 mt-1">
              e-Fatura ve e-Arşiv Fatura Yönetimi
            </p>
          </div>
          
          <button
            onClick={testConnection}
            disabled={testingConnection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {testingConnection ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Bağlantı Test Et
          </button>
        </div>

        {/* Connection Status */}
        {connectionStatus !== null && (
          <div className={`flex items-center gap-2 p-4 rounded-xl ${
            connectionStatus ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {connectionStatus ? (
              <>
                <CheckCircle size={20} />
                <span className="font-medium">GİB servisleri erişilebilir</span>
              </>
            ) : (
              <>
                <XCircle size={20} />
                <span className="font-medium">GİB servisleri erişilemiyor</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Generate XML */}
        <button
          onClick={generateXML}
          disabled={loading}
          className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
        >
          <FileText className="text-purple-600 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">XML Oluştur</h3>
          <p className="text-xs text-neutral-600 mt-1">
            UBL-TR 1.2 formatında fatura XML'i oluştur
          </p>
        </button>

        {/* Send e-Fatura */}
        <button
          onClick={() => sendToGIB('efatura')}
          disabled={loading}
          className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
        >
          <Send className="text-blue-600 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">e-Fatura Gönder</h3>
          <p className="text-xs text-neutral-600 mt-1">
            Ticari müşteriye e-Fatura gönder
          </p>
        </button>

        {/* Send e-Arşiv */}
        <button
          onClick={() => sendToGIB('earsiv')}
          disabled={loading}
          className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
        >
          <Send className="text-green-600 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">e-Arşiv Gönder</h3>
          <p className="text-xs text-neutral-600 mt-1">
            Bireysel müşteriye e-Arşiv gönder
          </p>
        </button>
      </div>

      {/* XML Preview */}
      {showXMLPreview && generatedXML && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">XML Önizleme</h3>
            <button
              onClick={downloadXML}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <Download size={18} />
              XML İndir
            </button>
          </div>
          
          <div className="bg-neutral-50 rounded-xl p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-mono">
              {generatedXML}
            </pre>
          </div>
        </div>
      )}

      {/* GIB Response */}
      {gibResponse && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">GİB Yanıtı</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Fatura Tipi:</span>
              <span className="font-medium text-neutral-900">{gibResponse.type}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Fatura No:</span>
              <span className="font-medium text-neutral-900">{gibResponse.invoiceId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">UUID:</span>
              <span className="font-mono text-xs text-neutral-700">{gibResponse.uuid}</span>
            </div>
            
            <div className={`flex items-center gap-2 p-4 rounded-xl ${
              gibResponse.gibResponse.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {gibResponse.gibResponse.success ? (
                <>
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Başarılı</p>
                    <p className="text-sm text-green-700">{gibResponse.gibResponse.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="text-red-600" size={20} />
                  <div>
                    <p className="font-medium text-red-900">Başarısız</p>
                    <p className="text-sm text-red-700">{gibResponse.gibResponse.message}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Önemli Bilgiler</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• <strong>e-Fatura:</strong> Vergi numarası olan ticari müşteriler için kullanılır</li>
              <li>• <strong>e-Arşiv:</strong> TC kimlik numarası olan bireysel müşteriler için kullanılır</li>
              <li>• <strong>Test Ortamı:</strong> Şu anda GİB test ortamına bağlanıyorsunuz</li>
              <li>• <strong>XML Format:</strong> UBL-TR 1.2 standardı kullanılmaktadır</li>
              <li>• GİB kullanıcı adı ve şifresi .env dosyasında tanımlanmalıdır</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-neutral-900 font-medium">İşlem yapılıyor...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GIBIntegration
