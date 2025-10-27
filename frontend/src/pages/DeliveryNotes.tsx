import React, { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, Clock, CheckCircle, FileCheck } from 'lucide-react';
import DeliveryNoteList from '../components/accounting/DeliveryNoteList';
import DeliveryNoteModal from '../components/accounting/DeliveryNoteModal';

const DeliveryNotes: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    approved: 0,
    invoiced: 0
  });

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/delivery-notes/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleModalSave = () => {
    setRefreshKey(prev => prev + 1);
  };

  const statCards = [
    {
      title: 'Toplam İrsaliye',
      value: stats.total,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Taslak',
      value: stats.draft,
      icon: Clock,
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Onaylandı',
      value: stats.approved,
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Faturaya Dönüştürüldü',
      value: stats.invoiced,
      icon: FileCheck,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package size={32} className="text-blue-600" />
                İrsaliye Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                İrsaliye oluşturun, düzenleyin ve faturaya dönüştürün
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Yeni İrsaliye
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6 transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon size={24} className={stat.iconColor} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* İrsaliye Listesi */}
        <DeliveryNoteList refresh={refreshKey} />

        {/* Modal */}
        {showModal && (
          <DeliveryNoteModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleModalSave}
          />
        )}
      </div>
    </div>
  );
};

export default DeliveryNotes;
