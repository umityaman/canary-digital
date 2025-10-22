import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Upload, QrCode, DollarSign } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import QRCodeGenerator from '../components/QRCodeGenerator';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

interface SmartPricing {
  id: number;
  name: string;
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
}

const NewEquipment: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Form states
  const [formData, setFormData] = useState({
    // 1. Genel Bilgiler
    name: '',
    brand: '',
    model: '',
    stockNumber: '',
    category: '',
    serialNumber: '',
    qrCode: '',
    description: '',
    
    // 2. Fiyatlandırma
    pricingType: 'NO_CHARGE', // NO_CHARGE, FIXED, SMART
    fixedPriceType: 'DAILY', // HOURLY, DAILY, WEEKLY, MONTHLY
    fixedPrice: '',
    smartPricingId: '',
    
    // 3. Durum ve Tür
    status: 'AVAILABLE',
    equipmentType: 'RENTAL',
    location: '',
    
    // 4. Satın Alma Bilgileri
    purchasePrice: '',
    supplier: '',
    purchaseDate: '',
    warrantyEndDate: '',
    notes: '',
    
    // 5. Fotoğraflar
    images: [] as string[]
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [smartPricings, setSmartPricings] = useState<SmartPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nextEquipmentCode, setNextEquipmentCode] = useState<string>('Yükleniyor...');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [savedEquipmentId, setSavedEquipmentId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSmartPricings();
    fetchNextEquipmentCode();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSmartPricings = async () => {
    try {
      // Smart pricing endpoint'i eklenecek
      // const response = await api.get('/smart-pricings');
      // setSmartPricings(response.data);
      setSmartPricings([]); // Şimdilik boş
    } catch (error) {
      console.error('Error fetching smart pricings:', error);
    }
  };

  const fetchNextEquipmentCode = async () => {
    try {
      // Son ekipmanı al
      const response = await api.get('/equipment');
      const equipment = response.data;
      
      if (equipment && equipment.length > 0) {
        // En yüksek ID'yi bul
        const maxId = Math.max(...equipment.map((e: any) => e.id || 0));
        const nextNumber = maxId + 1;
        setNextEquipmentCode(`EQP-${String(nextNumber).padStart(4, '0')}`);
      } else {
        setNextEquipmentCode('EQP-0001');
      }
    } catch (error) {
      console.error('Error fetching next equipment code:', error);
      setNextEquipmentCode('EQP-0001');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePricingTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      pricingType: type,
      fixedPrice: '',
      smartPricingId: ''
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate upload - replace with actual upload logic
        const url = URL.createObjectURL(file);
        uploadedUrls.push(url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      showNotification('success', `${files.length} resim yüklendi`);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', 'Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showNotification('error', 'Lütfen kategori adı girin');
      return;
    }

    try {
      const response = await api.post('/categories', {
        name: newCategoryName.trim(),
        isActive: true
      });
      
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory.name }));
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      showNotification('success', 'Kategori başarıyla eklendi');
    } catch (error: any) {
      console.error('Add category error:', error);
      showNotification('error', error.response?.data?.error || 'Kategori eklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model || !formData.category) {
      showNotification('error', 'Lütfen zorunlu alanları doldurun (Marka, Model, Kategori)');
      return;
    }

    setLoading(true);
    try {
      const equipmentData = {
        ...formData,
        name: formData.name || `${formData.brand} ${formData.model}`, // Otomatik isim
        fixedPrice: formData.fixedPrice ? parseFloat(formData.fixedPrice) : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      };

      const response = await api.post('/equipment', equipmentData);
      const savedEquipment = response.data;
      
      setSavedEquipmentId(savedEquipment.id);
      showNotification('success', 'Ekipman başarıyla eklendi');
      
      // Show QR modal option
      if (window.confirm('Ekipman kaydedildi! QR kod oluşturmak ister misiniz?')) {
        setShowQRModal(true);
      } else {
        navigate('/inventory');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      showNotification('error', error.response?.data?.message || 'Ekipman kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/inventory')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-gray-700" />
              <h1 className="text-2xl font-semibold text-gray-900">Yeni Ekipman Ekle</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Genel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              1. Genel Bilgiler
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Ekipman ID - Otomatik */}
              <div className="col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Ekipman ID (Otomatik)</p>
                      <p className="text-xs text-blue-700 mt-1">Sistem tarafından otomatik olarak atanacak</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 font-mono">
                      {nextEquipmentCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Marka */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Canon, Sony, Nikon..."
                  required
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: EOS R5, A7III..."
                  required
                />
              </div>

              {/* Stok No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok No
                </label>
                <input
                  type="text"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Aynı marka/model ekipmanlar için"
                />
                <p className="text-xs text-gray-500 mt-1">Bu numara aynı marka modelde olan ekipmanlar için kullanılacak</p>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    + Yeni
                  </button>
                </div>
              </div>

              {/* Seri Numarası */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seri Numarası
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: SN123456789"
                />
              </div>

              {/* QR Kod */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Kod
                </label>
                <input
                  type="text"
                  name="qrCode"
                  value={formData.qrCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/tools sayfasında oluşturulan QR kod"
                />
                <p className="text-xs text-gray-500 mt-1">QR kod oluşturmak için Tools sayfasını ziyaret edin</p>
              </div>

              {/* Belgelerdeki Açıklamalar */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belgelerdeki Açıklamalar
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Örneğin aksesuarlarınızı buraya listeleyebilirsiniz..."
                />
              </div>
            </div>
          </div>

          {/* 2. Fiyatlandırma */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              2. Fiyatlandırma
            </h2>
            
            <div className="space-y-4">
              {/* Seçenek 1: Ücretsiz */}
              <div 
                onClick={() => handlePricingTypeChange('NO_CHARGE')}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.pricingType === 'NO_CHARGE' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.pricingType === 'NO_CHARGE' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.pricingType === 'NO_CHARGE' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bu ürün için ücret almıyorum</p>
                    <p className="text-sm text-gray-600">Ücretsiz kullanım için bu seçeneği seçin</p>
                  </div>
                </div>
              </div>

              {/* Seçenek 2: Sabit Kiralama Ücreti */}
              <div 
                onClick={() => handlePricingTypeChange('FIXED')}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.pricingType === 'FIXED' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.pricingType === 'FIXED' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.pricingType === 'FIXED' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sabit Kiralama Ücreti</p>
                    <p className="text-sm text-gray-600">Belirli bir ücret belirleyin</p>
                  </div>
                </div>

                {formData.pricingType === 'FIXED' && (
                  <div className="ml-8 space-y-3">
                    {/* Periyot Seçimi */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'HOURLY', label: 'Saatlik' },
                        { value: 'DAILY', label: 'Günlük' },
                        { value: 'WEEKLY', label: 'Haftalık' },
                        { value: 'MONTHLY', label: 'Aylık' }
                      ].map(period => (
                        <button
                          key={period.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, fixedPriceType: period.value }));
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.fixedPriceType === period.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>

                    {/* Fiyat Girişi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ücret (₺)
                      </label>
                      <input
                        type="number"
                        name="fixedPrice"
                        value={formData.fixedPrice}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Örn: 500"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Seçenek 3: Akıllı Fiyatlandırma */}
              <div 
                onClick={() => handlePricingTypeChange('SMART')}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.pricingType === 'SMART' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.pricingType === 'SMART' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.pricingType === 'SMART' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Akıllı Fiyatlandırma</p>
                    <p className="text-sm text-gray-600">Tools sayfasında oluşturulan fiyatlandırmayı kullan</p>
                  </div>
                </div>

                {formData.pricingType === 'SMART' && (
                  <div className="ml-8">
                    <select
                      name="smartPricingId"
                      value={formData.smartPricingId}
                      onChange={handleInputChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Akıllı fiyatlandırma seçin</option>
                      {smartPricings.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                      ))}
                    </select>
                    {smartPricings.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Henüz akıllı fiyatlandırma oluşturulmamış. Tools sayfasından oluşturabilirsiniz.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Durum ve Tür */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Durum ve Tür</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">Müsait</option>
                  <option value="RENTED">Kirada</option>
                  <option value="RESERVED">Rezerve</option>
                  <option value="MAINTENANCE">Bakımda</option>
                  <option value="LOST">Kayıp</option>
                  <option value="BROKEN">Bozuk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ekipman Türü
                </label>
                <select
                  name="equipmentType"
                  value={formData.equipmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RENTAL">Kiralık</option>
                  <option value="SALE">Satılık</option>
                  <option value="SERVICE">Servis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konum
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Depo, Raf numarası"
                />
              </div>
            </div>
          </div>

          {/* 4. Satın Alma Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Satın Alma Bilgileri</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satın Alma Fiyatı (₺)
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 50000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tedarikçi firma adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satın Alma Tarihi
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garanti Bitiş Tarihi
                </label>
                <input
                  type="date"
                  name="warrantyEndDate"
                  value={formData.warrantyEndDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Not
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Satın alma ile ilgili notlar..."
                />
              </div>
            </div>
          </div>

          {/* 5. Fotoğraflar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Fotoğraflar</h2>
            
            <div className="space-y-4">
              {/* Fotoğraf Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium text-gray-700">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <span className="text-sm text-gray-500">
                  Birden fazla fotoğraf seçebilirsiniz
                </span>
              </div>

              {/* Fotoğraf Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Ekipman fotoğrafı ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Henüz fotoğraf yüklenmedi</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">📝 Not:</span> Ekipmanı kaydettikten sonra detay sayfasında <strong>Müsaitlik Takvimi</strong> ve <strong>Tarihçe</strong> bilgilerini görüntüleyebilirsiniz.
            </p>
          </div>

        </form>
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Kategori Ekle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Ses Sistemleri, Aydınlatma, Kamera..."
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && savedEquipmentId && (
        <QRCodeGenerator
          equipmentId={savedEquipmentId}
          equipmentName={formData.name}
          serialNumber={formData.serialNumber || 'N/A'}
          onClose={() => {
            setShowQRModal(false);
            navigate('/inventory');
          }}
        />
      )}
    </div>
  );
};

export default NewEquipment;
