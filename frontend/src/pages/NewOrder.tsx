import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, X, Calendar, QrCode, UserPlus,
  User, MapPin, FileText, Mail, Phone, Tag, StickyNote, CreditCard, Package
} from 'lucide-react';

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [searchProducts, setSearchProducts] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="text-sm text-gray-500">Siparişler › Yeni sipariş</div>
              <h1 className="text-xl font-semibold text-gray-900">Yeni Sipariş Oluştur</h1>
            </div>
          </div>
          <button
            onClick={() => {
              // Save order logic here
              navigate('/orders');
            }}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Sipariş Oluştur
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Customer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Müşteri</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Müşteri ara..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  title="Yeni Müşteri Ekle"
                >
                  <UserPlus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Fatura adresi ekle
              </button>
            </div>

            {/* Pickup & Return */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Teslim Alma</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Tarih</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Saat</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-4">İade</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Tarih</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Saat</label>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ürünler</h3>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchProducts}
                    onChange={(e) => setSearchProducts(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  title="QR Kod ile Ekle"
                >
                  <QrCode className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Empty State */}
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Bu sipariş boş</p>
                <p className="text-xs text-gray-500 mb-3">Ürün arayarak veya QR kod okutarak ekleyin</p>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  + Özel satır ekle
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-900">₺0,00</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  + İndirim ekle
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  + Kupon ekle
                </button>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Toplam indirim</span>
                  <span className="font-medium text-gray-900">₺0,00</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">KDV Dahil Toplam</span>
                  <span className="text-base font-semibold text-gray-900">₺0,00</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Güvenlik depozitosu
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Ürün güvenlik depozitosu değerinin %100'ü</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">₺0,00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Actions Dropdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-2">
                Email gönder
              </button>
              <button className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium mb-2">
                Taslak olarak kaydet
              </button>
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Yeni sözleşme
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Yeni teklif
                </button>
              </div>
              <button className="w-full text-sm text-blue-600 hover:text-blue-700 mt-3">
                Email geçmişini görüntüle (0)
              </button>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Dökümanlar</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 py-2 px-3 hover:bg-gray-50 rounded cursor-pointer">
                  <FileText className="w-4 h-4" />
                  <span>İrsaliye</span>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Faturalar</h3>
              <p className="text-xs text-gray-500">Henüz fatura eklenmedi</p>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Ödemeler</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödenen</span>
                  <span className="font-medium text-green-600">₺0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kalan</span>
                  <span className="font-medium text-gray-900">₺0,00</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Etiketler</h3>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Etiket ekle..."
                  className="flex-1 text-sm border-0 focus:outline-none focus:ring-0 p-0"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notlar</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Not ekle..."
                rows={4}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
