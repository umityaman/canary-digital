import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
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
  quantity: number;
  totalAmount: number;
  depositPaid: boolean;
  fullPayment: boolean;
  notes?: string;
}

interface EquipmentTimeline {
  equipmentId: number;
  equipmentName: string;
  equipmentCode?: string;
  equipmentCategory?: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  totalQuantity: number;
  dailyPrice: number;
  reservations: Reservation[];
  reservationCount: number;
  utilization: number;
}

interface TimelineData {
  startDate: string;
  endDate: string;
  totalEquipment: number;
  totalReservations: number;
  equipment: EquipmentTimeline[];
}

interface TimelineViewProps {
  companyId: number;
  onReservationClick?: (reservation: Reservation) => void;
}

type ZoomLevel = 'day' | 'week' | 'month';

const TimelineView: React.FC<TimelineViewProps> = ({ companyId, onReservationClick }) => {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadTimeline();
  }, [currentDate, zoomLevel, filterCategory, filterStatus]);

  const loadTimeline = async () => {
    try {
      setLoading(true);

      // Calculate date range based on zoom level
      const { startDate, endDate } = getDateRange();

      const params: any = {
        companyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await reservationAPI.getTimeline(params);
      setTimeline(response);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          response.equipment
            .map((e: EquipmentTimeline) => e.equipmentCategory)
            .filter((c: string) => c)
        )
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (zoomLevel === 'day') {
      // Show 7 days
      start.setDate(start.getDate() - 3);
      end.setDate(end.getDate() + 3);
    } else if (zoomLevel === 'week') {
      // Show 4 weeks (28 days)
      start.setDate(start.getDate() - 14);
      end.setDate(end.getDate() + 13);
    } else {
      // Show 3 months
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return { startDate: start, endDate: end };
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (zoomLevel === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (zoomLevel === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 28 : -28));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
    }

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 border-yellow-400 text-yellow-800',
      CONFIRMED: 'bg-green-100 border-green-400 text-green-800',
      IN_PROGRESS: 'bg-blue-100 border-blue-400 text-blue-800',
      COMPLETED: 'bg-neutral-100 border-gray-400 text-gray-800',
      CANCELLED: 'bg-red-100 border-red-400 text-red-800',
      REJECTED: 'bg-red-100 border-red-400 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 border-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      IN_PROGRESS: AlertCircle,
      COMPLETED: CheckCircle,
      CANCELLED: XCircle,
      REJECTED: XCircle,
    };
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    return <IconComponent className="w-3 h-3" />;
  };

  const renderTimeline = () => {
    if (!timeline) return null;

    const { startDate, endDate } = getDateRange();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Filter equipment by category
    const filteredEquipment = filterCategory
      ? timeline.equipment.filter((e) => e.equipmentCategory === filterCategory)
      : timeline.equipment;

    return (
      <div className="overflow-x-auto">
        {/* Timeline Header - Date Scale */}
        <div className="flex border-b sticky top-0 bg-white z-10">
          <div className="w-64 flex-shrink-0 p-4 font-semibold border-r bg-neutral-50">
            Ekipman
          </div>
          <div className="flex-1 flex">
            {Array.from({ length: totalDays }, (_, i) => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + i);
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={i}
                  className={`flex-1 min-w-[40px] p-2 text-center text-xs border-r ${
                    isToday ? 'bg-blue-50 font-bold' : isWeekend ? 'bg-neutral-50' : ''
                  }`}
                >
                  <div className={isToday ? 'text-blue-600' : 'text-neutral-600'}>
                    {date.getDate()}
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Rows - Equipment */}
        {filteredEquipment.map((equipment) => (
          <div key={equipment.equipmentId} className="flex border-b hover:bg-neutral-50">
            {/* Equipment Info */}
            <div className="w-64 flex-shrink-0 p-4 border-r">
              <div className="flex items-start gap-2">
                <Package className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" title={equipment.equipmentName}>
                    {equipment.equipmentName}
                  </div>
                  {equipment.equipmentCode && (
                    <div className="text-xs text-gray-500">{equipment.equipmentCode}</div>
                  )}
                  {equipment.equipmentCategory && (
                    <div className="text-xs text-gray-400">{equipment.equipmentCategory}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Miktar: {equipment.totalQuantity} • Kullanım: {equipment.utilization}%
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 relative" style={{ minHeight: '80px' }}>
              {/* Background Grid */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: totalDays }, (_, i) => {
                  const date = new Date(startDate);
                  date.setDate(date.getDate() + i);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={i}
                      className={`flex-1 min-w-[40px] border-r ${
                        isToday
                          ? 'bg-blue-50'
                          : isWeekend
                          ? 'bg-neutral-50'
                          : 'bg-white'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Reservation Bars */}
              {equipment.reservations.map((reservation, idx) => {
                const resStart = new Date(reservation.startDate);
                const resEnd = new Date(reservation.endDate);

                // Calculate position
                const startDiff = Math.max(
                  0,
                  Math.floor((resStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                );
                const endDiff = Math.min(
                  totalDays,
                  Math.ceil((resEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                );
                const duration = endDiff - startDiff;

                if (duration <= 0) return null;

                const leftPercent = (startDiff / totalDays) * 100;
                const widthPercent = (duration / totalDays) * 100;

                // Stack reservations vertically if they overlap
                const topOffset = idx * 28;

                return (
                  <div
                    key={reservation.id}
                    className={`absolute h-6 rounded border-2 cursor-pointer hover:shadow-lg transition-shadow ${getStatusColor(
                      reservation.status
                    )}`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: `${8 + topOffset}px`,
                    }}
                    onClick={() => onReservationClick?.(reservation)}
                    title={`${reservation.reservationNo} - ${reservation.customerName}\n${resStart.toLocaleDateString()} - ${resEnd.toLocaleDateString()}`}
                  >
                    <div className="flex items-center gap-1 px-2 h-full text-xs truncate">
                      {getStatusIcon(reservation.status)}
                      <span className="truncate">
                        {reservation.reservationNo} - {reservation.customerName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredEquipment.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Bu filtrede ekipman bulunamadı</p>
          </div>
        )}
      </div>
    );
  };

  const { startDate, endDate } = getDateRange();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Zaman Çizelgesi</h2>
            <p className="text-sm text-gray-500">
              {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <button
                onClick={() => setZoomLevel('day')}
                className={`px-3 py-1 text-sm rounded ${
                  zoomLevel === 'day'
                    ? 'bg-blue-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Gün
              </button>
              <button
                onClick={() => setZoomLevel('week')}
                className={`px-3 py-1 text-sm rounded ${
                  zoomLevel === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Hafta
              </button>
              <button
                onClick={() => setZoomLevel('month')}
                className={`px-3 py-1 text-sm rounded ${
                  zoomLevel === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Ay
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateTime('prev')}
                className="p-2 hover:bg-neutral-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm hover:bg-neutral-100 rounded"
              >
                Bugün
              </button>
              <button
                onClick={() => navigateTime('next')}
                className="p-2 hover:bg-neutral-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={loadTimeline}
              className="p-2 hover:bg-neutral-100 rounded"
              disabled={loading}
            >
              <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Bekliyor</option>
            <option value="CONFIRMED">Onaylı</option>
            <option value="IN_PROGRESS">Devam Ediyor</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
            <option value="REJECTED">Reddedildi</option>
          </select>

          {/* Stats */}
          {timeline && (
            <div className="ml-auto flex items-center gap-4 text-sm text-neutral-600">
              <div>
                <span className="font-semibold">{timeline.totalEquipment}</span> Ekipman
              </div>
              <div>
                <span className="font-semibold">{timeline.totalReservations}</span> Rezervasyon
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-yellow-100 border-2 border-yellow-400"></div>
            <span>Bekliyor</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-400"></div>
            <span>Onaylı</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-blue-100 border-2 border-blue-400"></div>
            <span>Devam Ediyor</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-neutral-100 border-2 border-gray-400"></div>
            <span>Tamamlandı</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-400"></div>
            <span>İptal/Red</span>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-500"></div>
          </div>
        ) : (
          renderTimeline()
        )}
      </div>
    </div>
  );
};

export default TimelineView;
