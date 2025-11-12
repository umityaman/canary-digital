import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Rental {
  id: number;
  orderNumber: string;
  customerName: string;
  pickupDate: string;
  returnDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface Maintenance {
  id: number;
  type: string;
  scheduledDate: string;
  estimatedDuration: number; // in days
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

interface EquipmentAvailabilityCalendarProps {
  equipmentId: string | number;
  equipmentName?: string;
  onDateSelect?: (date: Date) => void;
}

export const EquipmentAvailabilityCalendar: React.FC<EquipmentAvailabilityCalendarProps> = ({
  equipmentId,
  equipmentName,
  onDateSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchAvailabilityData();
  }, [equipmentId, currentDate]);

  const fetchAvailabilityData = async () => {
    try {
      setLoading(true);
      
      // Fetch rentals for this equipment
      const rentalsResponse = await api.get(`/equipment/${equipmentId}/rentals`, {
        params: {
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString()
        }
      });
      
      // Fetch maintenance schedule
      const maintenanceResponse = await api.get(`/equipment/${equipmentId}/maintenance`, {
        params: {
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString()
        }
      });

      setRentals(rentalsResponse.data || []);
      setMaintenances(maintenanceResponse.data || []);
    } catch (error) {
      console.error('Error fetching availability data:', error);
      // Set empty arrays on error to show empty calendar
      setRentals([]);
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateInRange = (date: Date, startDate: string, endDate: string) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return checkDate >= start && checkDate <= end;
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (date < today) {
      return { type: 'past', label: 'Geçmiş', color: 'bg-neutral-100 text-gray-400' };
    }

    // Check for active rentals
    const activeRental = rentals.find(rental => 
      rental.status === 'ACTIVE' && 
      isDateInRange(date, rental.pickupDate, rental.returnDate)
    );
    if (activeRental) {
      return { 
        type: 'rented', 
        label: 'Kirada', 
        color: 'bg-red-100 text-red-700 border-red-300',
        rental: activeRental
      };
    }

    // Check for confirmed/pending rentals
    const upcomingRental = rentals.find(rental => 
      (rental.status === 'CONFIRMED' || rental.status === 'PENDING') && 
      isDateInRange(date, rental.pickupDate, rental.returnDate)
    );
    if (upcomingRental) {
      return { 
        type: 'reserved', 
        label: 'Rezerve', 
        color: 'bg-orange-100 text-orange-700 border-orange-300',
        rental: upcomingRental
      };
    }

    // Check for maintenance
    const maintenance = maintenances.find(m => {
      const maintenanceStart = new Date(m.scheduledDate);
      const maintenanceEnd = new Date(maintenanceStart);
      maintenanceEnd.setDate(maintenanceEnd.getDate() + m.estimatedDuration);
      
      return m.status !== 'COMPLETED' && 
             isDateInRange(date, maintenanceStart.toISOString(), maintenanceEnd.toISOString());
    });
    if (maintenance) {
      return { 
        type: 'maintenance', 
        label: 'Bakım', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        maintenance
      };
    }

    // Available
    return { 
      type: 'available', 
      label: 'Müsait', 
      color: 'bg-green-100 text-green-700 border-green-300' 
    };
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    onDateSelect?.(clickedDate);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const status = getDateStatus(date);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            relative p-2 min-h-[80px] border rounded-lg cursor-pointer
            transition-all hover:shadow-md
            ${status.color}
            ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
            ${status.type === 'past' ? 'cursor-not-allowed' : 'hover:scale-105'}
          `}
        >
          <div className="text-sm font-semibold mb-1">{day}</div>
          <div className="text-xs font-medium">{status.label}</div>
          
          {/* Show icon based on status */}
          <div className="absolute top-1 right-1">
            {status.type === 'available' && <CheckCircle className="w-3 h-3" />}
            {status.type === 'rented' && <XCircle className="w-3 h-3" />}
            {status.type === 'reserved' && <Clock className="w-3 h-3" />}
            {status.type === 'maintenance' && <AlertCircle className="w-3 h-3" />}
          </div>

          {/* Show rental/maintenance info on hover */}
          {(status.rental || status.maintenance) && (
            <div className="absolute bottom-0 left-0 right-0 text-[10px] truncate px-1">
              {status.rental && `${status.rental.customerName}`}
              {status.maintenance && `${status.maintenance.type}`}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-sm text-neutral-600 pb-2">
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {days}
      </div>
    );
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const status = getDateStatus(selectedDate);

    return (
      <div className="mt-6 p-4 bg-white rounded-lg border-2 border-neutral-200">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {selectedDate.toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${status.color}`}>
          {status.type === 'available' && <CheckCircle className="w-4 h-4" />}
          {status.type === 'rented' && <XCircle className="w-4 h-4" />}
          {status.type === 'reserved' && <Clock className="w-4 h-4" />}
          {status.type === 'maintenance' && <AlertCircle className="w-4 h-4" />}
          {status.label}
        </div>

        {status.rental && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Sipariş No:</span>
              <span className="font-medium">{status.rental.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Müşteri:</span>
              <span className="font-medium">{status.rental.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Teslim:</span>
              <span className="font-medium">{new Date(status.rental.pickupDate).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">İade:</span>
              <span className="font-medium">{new Date(status.rental.returnDate).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Durum:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status.rental.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                status.rental.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                'bg-neutral-100 text-neutral-700'
              }`}>
                {status.rental.status}
              </span>
            </div>
          </div>
        )}

        {status.maintenance && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Bakım Türü:</span>
              <span className="font-medium">{status.maintenance.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Başlangıç:</span>
              <span className="font-medium">{new Date(status.maintenance.scheduledDate).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Tahmini Süre:</span>
              <span className="font-medium">{status.maintenance.estimatedDuration} gün</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Durum:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status.maintenance.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                status.maintenance.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {status.maintenance.status}
              </span>
            </div>
          </div>
        )}

        {status.type === 'available' && (
          <p className="text-sm text-neutral-600">
            Bu tarihte ekipman müsait ve kiralanabilir.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Müsaitlik Takvimi
          </h2>
          {equipmentName && (
            <p className="text-sm text-neutral-600 mt-1">{equipmentName}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          
          <div className="text-center min-w-[180px]">
            <div className="font-semibold text-lg text-neutral-900">
              {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-sm text-neutral-700">Müsait</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
          <span className="text-sm text-neutral-700">Rezerve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-sm text-neutral-700">Kirada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-sm text-neutral-700">Bakım</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-100 border border-neutral-300 rounded"></div>
          <span className="text-sm text-neutral-700">Geçmiş</span>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
        </div>
      ) : (
        <>
          {renderCalendar()}
          {renderSelectedDateDetails()}
        </>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }, (_, i) => i + 1)
              .filter(day => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return getDateStatus(date).type === 'available';
              }).length}
          </div>
          <div className="text-xs text-neutral-600">Müsait Gün</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }, (_, i) => i + 1)
              .filter(day => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return getDateStatus(date).type === 'rented';
              }).length}
          </div>
          <div className="text-xs text-neutral-600">Kirada</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }, (_, i) => i + 1)
              .filter(day => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return getDateStatus(date).type === 'reserved';
              }).length}
          </div>
          <div className="text-xs text-neutral-600">Rezerve</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }, (_, i) => i + 1)
              .filter(day => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return getDateStatus(date).type === 'maintenance';
              }).length}
          </div>
          <div className="text-xs text-neutral-600">Bakım</div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentAvailabilityCalendar;
