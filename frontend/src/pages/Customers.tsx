import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Users, Mail, Phone, Building, Plug } from 'lucide-react';
import { useCustomerStore } from '../stores/customerStore';
import CustomerModal, { CustomerFormData } from '../components/modals/CustomerModal';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const { customers, loading, error, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFormData | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchCustomers(term);
  };

  const handleAdd = () => {
    navigate('/customers/create');
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
