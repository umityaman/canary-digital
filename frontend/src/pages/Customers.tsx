import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Users, Mail, Phone, Building, Plug, MapPin, ShoppingBag, Calendar, Star } from 'lucide-react';
import { useCustomerStore } from '../stores/customerStore';
import CustomerModal, { CustomerFormData } from '../components/modals/CustomerModal';

const Customers: React.FC = () => {
  const { customers, loading, error, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFormData | null>(null);
  const viewMode = 'grid'; // Default view mode (can be extended later)

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchCustomers(term);
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`"${name}" müşterisini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteCustomer(id);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Müşteri silinemedi');
      }
    }
  };

  const handleSave = async (data: CustomerFormData) => {
    if (modalMode === 'create') {
      await createCustomer(data);
    } else if (selectedCustomer?.id) {
      await updateCustomer(selectedCustomer.id, data);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Müşteri ara (isim, email, telefon, şirket)..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Yeni Müşteri
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500 text-lg">Henüz müşteri bulunmuyor</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-neutral-900 hover:text-neutral-700 font-medium"
            >
              İlk müşterinizi ekleyin
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View - Modern Customer Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {customers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-neutral-300"
              >
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center ring-2 ring-neutral-100">
                      <span className="text-neutral-700 font-bold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      {customer.company && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Building size={12} />
                          {customer.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-neutral-50 to-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-neutral-600 mb-1">
                      <ShoppingBag size={14} />
                      <span className="text-xs font-medium">Siparişler</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">
                      {customer.orders?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Star size={14} />
                      <span className="text-xs font-medium">Puan</span>
                    </div>
                    <p className="text-xl font-bold text-blue-700">
                      5.0
                    </p>
                  </div>
                </div>

                {/* Tags/Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {customer.booqableId && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <Plug size={10} />
                      Booqable
                    </span>
                  )}
                  {customer.taxNumber && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      VN: {customer.taxNumber}
                    </span>
                  )}
                  {customer.createdAt && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      <Calendar size={10} />
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleEdit(customer)}
                    className="flex-1 text-center py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    Detaylar
                  </button>
                  <button 
                    className="flex-1 text-center py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Sipariş Oluştur
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şirket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center">
                          <span className="text-neutral-700 font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.booqableId && (
                              <div 
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                title={`Booqable ID: ${customer.booqableId}`}
                              >
                                <Plug size={12} />
                                <span>Booqable</span>
                              </div>
                            )}
                          </div>
                          {customer.taxNumber && (
                            <div className="text-sm text-gray-500">
                              VN: {customer.taxNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-1" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.company ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Building size={14} className="mr-1 text-gray-400" />
                          {customer.company}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-900 rounded-full">
                        {customer.orders?.length || 0} sipariş
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <CustomerModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        customer={selectedCustomer}
        mode={modalMode}
      />
    </div>
  );
};

export default Customers;
