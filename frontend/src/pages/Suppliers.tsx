import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Building2, Mail, Phone, Globe } from 'lucide-react';
import { useSupplierStore, Supplier } from '../stores/supplierStore';
import SupplierModal, { SupplierFormData } from '../components/modals/SupplierModal';

const Suppliers: React.FC = () => {
  const { suppliers, isLoading, error, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier, toggleSupplierActive } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

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

  const handleToggleActive = async (supplier: Supplier) => {
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
      {/* Search and Action Bar */}
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
        <button
          onClick={handleAdd}
          className="whitespace-nowrap flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Yeni Tedarikçi</span>
        </button>
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
