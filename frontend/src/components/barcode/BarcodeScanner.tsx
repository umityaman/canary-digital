import { useState } from 'react';
import { Camera, Scan, Package, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BarcodeScanner = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const handleScan = async (code: string) => {
    try {
      setScanning(true);
      // Here you would call your product API
      // const response = await fetch(`${API_URL}/api/products/barcode/${code}`);
      
      // Mock product data
      setTimeout(() => {
        setProduct({
          id: 1,
          name: 'Örnek Ürün',
          barcode: code,
          price: 150,
          stock: 50,
          category: 'Elektronik',
        });
        toast.success('Ürün bulundu!');
        setScanning(false);
      }, 1000);
    } catch (error) {
      toast.error('Ürün bulunamadı');
      setScanning(false);
    }
  };

  const handleManualScan = () => {
    if (!manualCode) {
      toast.error('Lütfen barkod girin');
      return;
    }
    handleScan(manualCode);
  };

  const handleCreateInvoice = () => {
    if (!product) {
      toast.error('Lütfen önce ürün tarayın');
      return;
    }
    toast.success('Fatura oluşturma ekranına yönlendiriliyorsunuz...', { icon: '📄' });
    // Here you would navigate to invoice creation with pre-filled product
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Barkod Okuyucu</h2>
        <p className="text-sm text-neutral-600 mt-1">Hızlı ürün tarama ve fatura oluşturma</p>
      </div>

      {/* Scanner Section */}
      <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center">
        <div className="max-w-md mx-auto space-y-6">
          {/* Camera Scanner (Placeholder) */}
          <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl p-12 border-2 border-dashed border-neutral-300">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center">
                {scanning ? (
                  <div className="animate-spin">
                    <Scan className="text-white" size={48} />
                  </div>
                ) : (
                  <Camera className="text-white" size={48} />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {scanning ? 'Taranıyor...' : 'Kamera ile Tara'}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Barkodu kamera karşısında tutun
                </p>
              </div>

              <button
                onClick={() => toast('Kamera erişimi için mobil uygulama kullanın', { icon: '📱', duration: 3000 })}
                className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
                disabled={scanning}
              >
                <Camera size={20} />
                {scanning ? 'Taranıyor...' : 'Kamerayı Aç'}
              </button>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-4">veya manuel olarak girin:</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Barkod numarasını girin"
                className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <button
                onClick={handleManualScan}
                disabled={scanning}
                className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Result */}
      {product && (
        <div className="bg-white rounded-2xl p-6 border-2 border-green-200 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="text-green-600" size={32} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{product.name}</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Barkod</p>
                  <p className="font-semibold text-neutral-900">{product.barcode}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-600 mb-1">Kategori</p>
                  <p className="font-semibold text-neutral-900">{product.category}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-900 mb-1">Fiyat</p>
                  <p className="font-semibold text-green-900">{product.price.toFixed(2)} ₺</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-900 mb-1">Stok</p>
                  <p className="font-semibold text-blue-900">{product.stock} adet</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateInvoice}
                  className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  <Plus size={20} />
                  Fatura Oluştur
                </button>
                <button
                  onClick={() => setProduct(null)}
                  className="px-6 py-3 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">Bugün Taranan</h4>
            <Scan className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-blue-900">24</p>
          <p className="text-xs text-blue-600 mt-1">Ürün taraması</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-green-900">Oluşturulan Fatura</h4>
            <Package className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-900">18</p>
          <p className="text-xs text-green-600 mt-1">Barkod ile</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-purple-900">Ortalama Süre</h4>
            <Camera className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-900">2.5s</p>
          <p className="text-xs text-purple-600 mt-1">Tarama hızı</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">💡 İpuçları</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Mobil cihazlarda kamera erişimi için uygulama kullanın</li>
          <li>• Barkodu iyi aydınlatılmış bir yerde tutun</li>
          <li>• Manuel giriş için Enter tuşuna basabilirsiniz</li>
          <li>• Tarama sonrası direkt fatura oluşturabilirsiniz</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;
