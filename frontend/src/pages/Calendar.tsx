import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import api from '../services/api';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  extendedProps?: any;
}

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar/events', {
        params: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      const formattedEvents = response.data.map((event: any) => ({
        id: String(event.id),
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        color: event.color,
        extendedProps: {
          description: event.description,
          eventType: event.eventType,
          status: event.status,
          priority: event.priority,
          order: event.order,
          customer: event.customer,
        },
      }));

      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    const event = info.event;
    alert(`
      Event: ${event.title}
      Type: ${event.extendedProps.eventType}
      Status: ${event.extendedProps.status}
      Priority: ${event.extendedProps.priority}
    `);
  };

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Event title:');
    if (title) {
      // Create new event
      createEvent({
        title,
        startDate: selectInfo.start,
        endDate: selectInfo.end,
        eventType: 'CUSTOM',
      });
    }
  };

  const createEvent = async (eventData: any) => {
    try {
      const response = await api.post('/calendar/events', eventData);
      setEvents([...events, {
        id: String(response.data.id),
        title: response.data.title,
        start: response.data.startDate,
        end: response.data.endDate,
        color: response.data.color,
      }]);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event');
    }
  };

  // Get today's events
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > today && eventDate <= weekFromNow;
  }).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Sidebar - Google Calendar Style */}
      <div className="w-80 space-y-4">
        {/* Create Button */}
        <button 
          onClick={() => {
            const title = prompt('Event başlığı:');
            if (title) {
              createEvent({
                title,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                eventType: 'CUSTOM',
              });
            }
          }}
          className="w-full flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white rounded-2xl hover:bg-neutral-800 transition-all shadow-lg"
        >
          <Plus size={20} />
          <span className="font-medium">Etkinlik Oluştur</span>
        </button>

        {/* Mini Calendar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">
              {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <div key={day} className="text-neutral-500 font-medium py-2">{day}</div>
            ))}
            {/* Simplified mini calendar - just showing current month days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                className={`py-2 rounded-lg hover:bg-neutral-100 transition-colors ${
                  day === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth()
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-2">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('month')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Ay
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Hafta
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'day'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Gün
            </button>
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-3">Bugünün Etkinlikleri</h3>
          <div className="space-y-2">
            {todayEvents.length > 0 ? (
              todayEvents.map(event => (
                <div key={event.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-full bg-blue-600 rounded-full mt-1"></div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm">{event.title}</p>
                      <p className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(event.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">Bugün etkinlik yok</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-3">Yaklaşan Etkinlikler</h3>
          <div className="space-y-2">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors">
                  <p className="font-medium text-neutral-900 text-sm">{event.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {new Date(event.start).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} • 
                    {new Date(event.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">Yaklaşan etkinlik yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 bg-white rounded-2xl border border-neutral-200 p-6 overflow-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={viewMode === 'month' ? 'dayGridMonth' : viewMode === 'week' ? 'timeGridWeek' : 'timeGridDay'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          editable={true}
          height="100%"
          locale="tr"
          buttonText={{
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
            list: 'Liste'
          }}
        />
      </div>
    </div>
  );
};

export default Calendar;
