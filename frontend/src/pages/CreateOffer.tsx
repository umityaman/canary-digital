import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OfferModal from '../components/accounting/OfferModal';

const CreateOffer: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/accounting');
  };

  const handleSuccess = () => {
    navigate('/accounting');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Teklif</h1>
              <p className="text-sm text-gray-500">Teklif oluştur ve kaydet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OfferModal
          isOpen={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
          editingOffer={null}
        />
      </div>
    </div>
  );
};

export default CreateOffer;
