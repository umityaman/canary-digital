import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { offerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import OfferModal from '../components/accounting/OfferModal';

const EditOffer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffer();
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getById(Number(id));
      setOffer(response.data);
    } catch (error: any) {
      toast.error('Teklif yüklenemedi');
      navigate('/accounting');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/accounting');
  };

  const handleSuccess = () => {
    navigate('/accounting');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!offer) {
    return null;
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Teklif Düzenle</h1>
              <p className="text-sm text-gray-500">{offer.offerNumber}</p>
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
          editingOffer={offer}
        />
      </div>
    </div>
  );
};

export default EditOffer;
