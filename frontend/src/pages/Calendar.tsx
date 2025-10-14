import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          editable={true}
          height="auto"
          locale="tr"
        />
      </div>
    </div>
  );
};

export default Calendar;
