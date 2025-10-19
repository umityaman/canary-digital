import React, { useEffect, useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, Building2, Mail, Phone, Globe,
  Package, FileCheck, Users, DollarSign, Bell, Award, Star,
  BarChart3, ShoppingCart, Truck, Shield, ClipboardCheck, TrendingUp
} from 'lucide-react';
import { useSupplierStore, Supplier } from '../stores/supplierStore';
import SupplierModal, { SupplierFormData } from '../components/modals/SupplierModal';

type Tab = 'dashboard' | 'profiles' | 'marketplace' | 'requests' | 'contracts' | 'logistics' | 'reports' | 'insurance';

const Suppliers: React.FC = () => {
  const { suppliers, isLoading, error, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier, toggleSupplierActive } = useSupplierStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'profiles' as const, label: 'Firma Profilleri', icon: <Building2 size={18} /> },
    { id: 'marketplace' as const, label: 'Ekipman Havuzu', icon: <ShoppingCart size={18} /> },
    { id: 'requests' as const, label: 'Talep & Onay', icon: <ClipboardCheck size={18} /> },
    { id: 'contracts' as const, label: 'Sözleşme & Fatura', icon: <FileCheck size={18} /> },
    { id: 'logistics' as const, label: 'Lojistik & Teslimat', icon: <Truck size={18} /> },
    { id: 'reports' as const, label: 'Raporlama', icon: <TrendingUp size={18} /> },
    { id: 'insurance' as const, label: 'Sigorta & Güvenlik', icon: <Shield size={18} /> },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`"${name}" tedarikçisini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteSupplier(id);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Tedarikçi silinemedi');
      }
    }
  };

  const _handleToggleActive = async (supplier: Supplier) => {
    try {
      await toggleSupplierActive(supplier.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Durum değiştirilemedi');
    }
  };

  const handleSave = async (data: SupplierFormData) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data);
    } else {
      await createSupplier(data);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">Aktif</span>;
    }
    return <span className="px-2 py-1 text-xs bg-neutral-50 text-neutral-600 border border-neutral-200 rounded-full font-medium">Pasif</span>;
  };

  if (isLoading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Tedarikçiler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{suppliers.length}</h3>
          <p className="text-sm text-neutral-600">Tedarikçi Firma</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Package className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Müsait</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">342</h3>
          <p className="text-sm text-neutral-600">Ekipman Havuzu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <FileCheck className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bekliyor</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">Talep</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">₺185K</h3>
          <p className="text-sm text-neutral-600">Kiralama</p>
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">B2B Ekipman Marketplace</h2>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-white rounded-xl p-6 border-2 border-neutral-200 hover:border-neutral-900 transition-all text-left group">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Yeni Talep Oluştur</h3>
                    <p className="text-sm text-neutral-600">Tedarikçilerden ekipman talep edin</p>
                  </button>

                  <button className="bg-white rounded-xl p-6 border-2 border-neutral-200 hover:border-neutral-900 transition-all text-left group">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Search className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Ekipman Ara</h3>
                    <p className="text-sm text-neutral-600">Marketplace'te ekipman bulun</p>
                  </button>

                  <button 
                    onClick={handleAdd}
                    className="bg-white rounded-xl p-6 border-2 border-neutral-200 hover:border-neutral-900 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Firma Ekle</h3>
                    <p className="text-sm text-neutral-600">Yeni tedarikçi firma kaydı</p>
                  </button>
                </div>

                {/* Activity & Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activities */}
                  <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                      <Bell className="mr-2 text-neutral-700" size={20} />
                      Son Aktiviteler
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Talep onaylandı</p>
                          <p className="text-xs text-neutral-600">Sony A7 IV - ProRent - 1 saat önce</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Yeni talep alındı</p>
                          <p className="text-xs text-neutral-600">Canon C70 - CineGear - 2 saat önce</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Ekipman teslim edildi</p>
                          <p className="text-xs text-neutral-600">ARRI Alexa - FilmTech - 4 saat önce</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Sözleşme bekleniyor</p>
                          <p className="text-xs text-neutral-600">RED Komodo - ProGear - 5 saat önce</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Suppliers */}
                  <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                      <Award className="mr-2 text-neutral-700" size={20} />
                      En İyi Tedarikçiler
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🥇</span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">ProRent Equipment</p>
                            <p className="text-xs text-neutral-600">45 işlem</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🥈</span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">CineGear Solutions</p>
                            <p className="text-xs text-neutral-600">38 işlem</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🥉</span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">FilmTech Rental</p>
                            <p className="text-xs text-neutral-600">32 işlem</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="text-sm font-medium">4.7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profiles Tab */}
            {activeTab === 'profiles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Firma Profilleri</h2>
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
                  >
                    <Plus size={18} />
                    <span>Yeni Firma</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type="text"
                      placeholder="Tedarikçi ara (isim, email, telefon, kategori)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Hata: {error}</p>
                    <button 
                      onClick={fetchSuppliers}
                      className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                    >
                      Tekrar dene
                    </button>
                  </div>
                )}

                {/* Suppliers Table */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <div className="flex flex-col items-center">
            <Building2 size={64} className="text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {searchTerm ? 'Tedarikçi bulunamadı' : 'İlk tedarikçinizi ekleyin'}
            </h3>
            <p className="text-neutral-600 mb-6 max-w-md">
              {searchTerm 
                ? 'Arama kriterlerinize uygun tedarikçi bulunamadı.' 
                : 'Ekipman ve malzeme tedarikçilerinizi sisteme ekleyerek takip edin.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAdd}
                className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors font-medium"
              >
                Tedarikçi Ekle
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-xs text-neutral-700 uppercase tracking-wider">
                  Tedarikçi
                </th>
                <th className="text-left py-3 px-6 font-medium text-xs text-neutral-700 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="text-left py-3 px-6 font-medium text-xs text-neutral-700 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left py-3 px-6 font-medium text-xs text-neutral-700 uppercase tracking-wider">
                  Durum
                </th>
                <th className="text-right py-3 px-6 font-medium text-xs text-neutral-700 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center">
                        <Building2 size={20} className="text-neutral-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{supplier.name}</div>
                        {supplier.contactPerson && (
                          <div className="text-xs text-neutral-600">İlgili: {supplier.contactPerson}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {supplier.email && (
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <Mail size={14} />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <Phone size={14} />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.website && (
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <Globe size={14} />
                          <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 hover:underline">
                            Web Sitesi
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-neutral-700">{supplier.category || '-'}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(supplier.isActive)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
              </div>
            )}

            {/* Marketplace Tab */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Ekipman Havuzu (Marketplace)</h2>
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Marketplace Yakında</h3>
                  <p className="text-neutral-600">
                    Tedarikçi firmalardan ekipman kiralama özelliği çok yakında!
                  </p>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Talep & Onay</h2>
                <div className="text-center py-12">
                  <ClipboardCheck size={64} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Talep Sistemi Yakında</h3>
                  <p className="text-neutral-600">
                    Tedarikçilerden ekipman talep etme ve onay süreci yakında aktif olacak.
                  </p>
                </div>
              </div>
            )}

            {/* Contracts Tab */}
            {activeTab === 'contracts' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Sözleşme & Fatura</h2>
                <div className="text-center py-12">
                  <FileCheck size={64} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sözleşme Modülü Yakında</h3>
                  <p className="text-neutral-600">
                    Dijital sözleşme ve e-fatura özellikleri çok yakında!
                  </p>
                </div>
              </div>
            )}

            {/* Logistics Tab */}
            {activeTab === 'logistics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Lojistik & Teslimat</h2>
                <div className="text-center py-12">
                  <Truck size={64} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Lojistik Takibi Yakında</h3>
                  <p className="text-neutral-600">
                    Ekipman teslimat ve iade takibi yakında aktif olacak.
                  </p>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Raporlama</h2>
                <div className="text-center py-12">
                  <TrendingUp size={64} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Raporlama Modülü Yakında</h3>
                  <p className="text-neutral-600">
                    Detaylı istatistikler ve analiz raporları çok yakında!
                  </p>
                </div>
              </div>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Sigorta & Güvenlik</h2>
                <div className="text-center py-12">
                  <Shield size={64} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sigorta Modülü Yakında</h3>
                  <p className="text-neutral-600">
                    Ekipman sigortası ve güvenlik özellikleri yakında aktif olacak.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSave={handleSave}
      />
    </div>
  );
};

export default Suppliers;
