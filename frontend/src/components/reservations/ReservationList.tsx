import React, { useState, useEffect } from 'react';
import {
  List,
  Search,
  Calendar,
  User,
  Package,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { reservationAPI } from '../../services/api';

interface Reservation {
  id: number;
  reservationNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  depositPaid: boolean;
  fullPayment: boolean;
  items: Array<{
    equipmentName: string;
    quantity: number;
  }>;
  createdAt: string;
}

interface ReservationListProps {
  companyId: number;
  onReservationClick?: (reservation: Reservation) => void;
}

const ReservationList: React.FC<ReservationListProps> = ({
  companyId,
  onReservationClick,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReservations();
  }, [page, statusFilter, companyId]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const result = await reservationAPI.getAll({
        companyId,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page,
        limit: 20,
      });

      setReservations(result.reservations || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadReservations();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: {
        bg: 'bg-yellow-100 text-yellow-800',
        text: 'Bekliyor',
        icon: <Clock className="w-4 h-4" />,
      },
      CONFIRMED: {
        bg: 'bg-green-100 text-green-800',
        text: 'Onaylandı',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      IN_PROGRESS: {
        bg: 'bg-blue-100 text-blue-800',
        text: 'Devam Ediyor',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      COMPLETED: {
        bg: 'bg-gray-100 text-gray-800',
        text: 'Tamamlandı',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      CANCELLED: {
        bg: 'bg-red-100 text-red-800',
        text: 'İptal',
        icon: <XCircle className="w-4 h-4" />,
      },
      REJECTED: {
        bg: 'bg-red-100 text-red-800',
        text: 'Reddedildi',
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = configs[status] || configs.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  const getPaymentBadge = (reservation: Reservation) => {
    if (reservation.fullPayment) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Tam Ödendi
        </span>
      );
    } else if (reservation.depositPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
          <Clock className="w-3 h-3" />
          Depozito
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
          <XCircle className="w-3 h-3" />
          Ödenmedi
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <List className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Rezervasyonlar</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {total}
            </span>
          </div>

          <button
            onClick={loadReservations}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rezervasyon no, müşteri adı, email veya telefon ara..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Bekliyor</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="IN_PROGRESS">Devam Ediyor</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
            <option value="REJECTED">Reddedildi</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ara
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rezervasyon No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ekipmanlar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Rezervasyon bulunamadı
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onReservationClick?.(reservation)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-blue-600">
                        {reservation.reservationNo}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {reservation.customerName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {reservation.customerEmail}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservation.customerPhone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reservation.startDate).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="text-sm text-gray-900">
                      {new Date(reservation.endDate).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil(
                        (new Date(reservation.endDate).getTime() -
                          new Date(reservation.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      gün
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-900">
                        {reservation.items.length > 0 ? (
                          <div>
                            <div className="font-medium">
                              {reservation.items[0].equipmentName}
                            </div>
                            {reservation.items.length > 1 && (
                              <div className="text-xs text-gray-500">
                                +{reservation.items.length - 1} daha
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {reservation.totalAmount.toFixed(2)} TL
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentBadge(reservation)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reservation.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReservationClick?.(reservation);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Sayfa {page} / {totalPages} • Toplam {total} rezervasyon
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Önceki
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
