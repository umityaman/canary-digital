import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reservationAPI } from '../../services/api';

interface Reservation {
  id: number;
  reservationNo: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  items: Array<{
    id: number;
    equipmentName: string;
    quantity: number;
  }>;
}

interface ReservationCalendarProps {
  companyId: number;
  onReservationClick?: (reservation: Reservation) => void;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  companyId,
  onReservationClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Load reservations for current month
  useEffect(() => {
    loadReservations();
  }, [currentDate, companyId]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const result = await reservationAPI.getAll({
        companyId,
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        limit: 1000,
      });

      setReservations(result.reservations || []);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek };
  };

  const getReservationsForDay = (day: number) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return reservations.filter((res) => {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      return targetDate >= resStart && targetDate <= resEnd;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      case 'CANCELLED':
      case 'REJECTED':
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  // Render calendar grid
  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startDayOfWeek + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const isToday =
        isCurrentMonth &&
        dayNumber === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      if (!isCurrentMonth) {
        days.push(
          <div key={i} className="min-h-24 bg-gray-50 border border-gray-200"></div>
        );
        continue;
      }

      const dayReservations = getReservationsForDay(dayNumber);

      days.push(
        <div
          key={i}
          className={`min-h-24 border border-gray-200 p-1 ${
            isToday ? 'bg-blue-50 border-blue-400' : 'bg-white'
          } hover:bg-gray-50 transition-colors`}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-semibold ${
                isToday
                  ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                  : 'text-gray-700'
              }`}
            >
              {dayNumber}
            </span>
            {dayReservations.length > 0 && (
              <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                {dayReservations.length}
              </span>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-20">
            {dayReservations.slice(0, 3).map((res) => (
              <div
                key={res.id}
                onClick={() => onReservationClick?.(res)}
                className={`text-xs p-1 rounded border cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(
                  res.status
                )}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {getStatusIcon(res.status)}
                  <span className="font-semibold truncate">{res.reservationNo}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] opacity-80">
                  <User className="w-2.5 h-2.5" />
                  <span className="truncate">{res.customerName}</span>
                </div>
              </div>
            ))}
            {dayReservations.length > 3 && (
              <div className="text-[10px] text-gray-500 text-center">
                +{dayReservations.length - 3} daha
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Rezervasyon Takvimi</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Ay
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm border-l border-gray-300 ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hafta
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm border-l border-gray-300 ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Gün
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800 capitalize">
              {monthName}
            </h3>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Bugün
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-gray-600">Bekleyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Onaylı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Devam Eden</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Tamamlandı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">İptal/Red</span>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}

      {/* Summary */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          <span className="font-semibold">{reservations.length}</span> rezervasyon
        </div>
        <div className="flex items-center gap-4">
          <div className="text-gray-600">
            Bekleyen:{' '}
            <span className="font-semibold">
              {reservations.filter((r) => r.status === 'PENDING').length}
            </span>
          </div>
          <div className="text-gray-600">
            Onaylı:{' '}
            <span className="font-semibold">
              {reservations.filter((r) => r.status === 'CONFIRMED').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;
