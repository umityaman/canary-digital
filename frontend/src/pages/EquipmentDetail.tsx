import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCodeGenerator from '../components/QRCodeGenerator';
import EquipmentAvailabilityCalendar from '../components/EquipmentAvailabilityCalendar';
import api from '../services/api';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'inactive';
  location: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  warrantyExpiration: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  description?: string;
  orders?: Order[];
  inspections?: Inspection[];
  photos?: Photo[];
  damages?: Damage[];
}

interface Order {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  createdAt: string;
  description: string;
}

interface Inspection {
  id: string;
  inspectionDate: string;
  inspector: string;
  status: 'passed' | 'failed' | 'pending';
  notes: string;
  createdAt: string;
}

interface Photo {
  id: string;
  url: string;
  description: string;
  uploadedAt: string;
}

interface Damage {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedDate: string;
  status: 'reported' | 'in-repair' | 'resolved';
  reportedBy: string;
}

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'inspections' | 'maintenance' | 'availability'>('overview');
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get(`/equipment/${id}`);
        setEquipment(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch equipment');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-neutral-100 text-neutral-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">
          {error || 'Ekipman bulunamadı'}
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800"
        >
          Envantere Dön
        </button>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{equipment.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Serial Number:</span>
            <span className="font-medium">{equipment.serialNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Manufacturer:</span>
            <span className="font-medium">{equipment.manufacturer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Model:</span>
            <span className="font-medium">{equipment.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{equipment.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
              {equipment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Dates & Warranty */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Dates & Warranty</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Purchase Date:</span>
            <span className="font-medium">{new Date(equipment.purchaseDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Warranty Expires:</span>
            <span className="font-medium">{new Date(equipment.warrantyExpiration).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Maintenance:</span>
            <span className="font-medium">{new Date(equipment.lastMaintenanceDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Maintenance:</span>
            <span className="font-medium">{new Date(equipment.nextMaintenanceDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {equipment.description && (
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="text-gray-700">{equipment.description}</p>
        </div>
      )}

      {/* Recent Damages */}
      {equipment.damages && equipment.damages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Damages</h3>
          <div className="space-y-3">
            {equipment.damages.slice(0, 3).map((damage) => (
              <div key={damage.id} className="border-l-4 border-red-400 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{damage.description}</p>
                    <p className="text-sm text-gray-600">
                      Reported by {damage.reportedBy} on {new Date(damage.reportedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(damage.severity)}`}>
                      {damage.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(damage.status)}`}>
                      {damage.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {equipment.orders && equipment.orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Order History</h3>
          </div>
          <div className="divide-y">
            {equipment.orders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Order #{order.orderNumber}</h4>
                    <p className="text-sm text-gray-600">{order.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} - {order.type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No order history available
        </div>
      )}
    </div>
  );

  const renderInspectionsTab = () => (
    <div className="space-y-6">
      {equipment.inspections && equipment.inspections.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Inspection History</h3>
          </div>
          <div className="divide-y">
            {equipment.inspections.map((inspection) => (
              <div key={inspection.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      Inspection - {new Date(inspection.inspectionDate).toLocaleDateString()}
                    </h4>
                    <p className="text-sm text-gray-600">Inspector: {inspection.inspector}</p>
                    {inspection.notes && (
                      <p className="text-sm text-gray-700 mt-2">{inspection.notes}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No inspection records available
        </div>
      )}
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Maintenance Schedule</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Last Maintenance:</span>
            <span className="font-medium">{new Date(equipment.lastMaintenanceDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Due:</span>
            <span className="font-medium">{new Date(equipment.nextMaintenanceDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Days Until Next:</span>
            <span className="font-medium">
              {Math.ceil((new Date(equipment.nextMaintenanceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full bg-neutral-900 text-white py-2 px-4 rounded-lg hover:bg-neutral-800">
            Schedule Maintenance
          </button>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
            Mark as Completed
          </button>
          <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700">
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={() => navigate('/inventory')}
                className="text-neutral-700 hover:text-blue-800"
              >
                ← Envantere Dön
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-gray-600">{equipment.type} - {equipment.manufacturer} {equipment.model}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQRModal(true)}
              className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800"
            >
              QR Kod Oluştur
            </button>
            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(equipment.status)}`}>
              {equipment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Genel Bakış' },
              { key: 'availability', label: 'Müsaitlik Takvimi' },
              { key: 'history', label: 'Geçmiş' },
              { key: 'inspections', label: 'İncelemeler' },
              { key: 'maintenance', label: 'Bakım' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-neutral-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'availability' && (
            <EquipmentAvailabilityCalendar 
              equipmentId={equipment.id}
              equipmentName={equipment.name}
            />
          )}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'inspections' && renderInspectionsTab()}
          {activeTab === 'maintenance' && renderMaintenanceTab()}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeGenerator
          equipmentId={parseInt(equipment.id)}
          equipmentName={equipment.name}
          serialNumber={equipment.serialNumber || 'N/A'}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

export default EquipmentDetail;
