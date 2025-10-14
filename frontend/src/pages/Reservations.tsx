import React, { useState } from 'react';
import { Plus, Calendar, List as ListIcon, GanttChart } from 'lucide-react';
import Layout from '../components/Layout';
import ReservationCalendar from '../components/reservations/ReservationCalendar';
import ReservationList from '../components/reservations/ReservationList';
import ReservationForm from '../components/reservations/ReservationForm';
import TimelineView from '../components/reservations/TimelineView';

type ViewMode = 'calendar' | 'list' | 'timeline';

const Reservations: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Get companyId from localStorage (should be from auth context in production)
  const companyId = 1; // Placeholder

  const handleReservationClick = (reservation: any) => {
    setSelectedReservation(reservation);
    // TODO: Open detail modal or navigate to detail page
    console.log('Selected reservation:', reservation);
  };

  const handleFormSuccess = (reservation: any) => {
    setShowForm(false);
    setSelectedReservation(null);
    // Refresh list
    window.location.reload();
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rezervasyonlar
            </h1>
            <p className="text-gray-600 mt-1">
              Ekipman rezervasyonlarını yönetin ve takip edin
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ListIcon className="w-4 h-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Takvim
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GanttChart className="w-4 h-4" />
                Zaman Çizelgesi
              </button>
            </div>

            {/* New Reservation Button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Yeni Rezervasyon
            </button>
          </div>
        </div>

        {/* Content */}
        {showForm ? (
          <ReservationForm
            companyId={companyId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <ReservationCalendar
                companyId={companyId}
                onReservationClick={handleReservationClick}
              />
            ) : viewMode === 'timeline' ? (
              <TimelineView
                companyId={companyId}
                onReservationClick={handleReservationClick}
              />
            ) : (
              <ReservationList
                companyId={companyId}
                onReservationClick={handleReservationClick}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reservations;
