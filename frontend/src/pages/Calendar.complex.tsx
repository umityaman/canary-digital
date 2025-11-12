import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import api from '../services/api';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  status: string;
  priority: string;
  color: string;
  order?: { id: number; orderNumber: string; status: string };
  equipment?: { id: number; name: string; category: string };
  customer?: { id: number; name: string; email: string; phone: string };
  assignedUser?: { id: number; name: string; email: string };
  location?: string;
  notes?: string;
}

interface EventModalData {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  priority: string;
  color: string;
  location: string;
  notes: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalData, setModalData] = useState<EventModalData>({
    title: '',
    description: '',
    eventType: 'CUSTOM',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date().toISOString().slice(0, 16),
    allDay: false,
    priority: 'MEDIUM',
    color: '#3b82f6',
    location: '',
    notes: '',
  });

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const eventTypes = [
    { value: 'ORDER', label: 'Order', color: '#10b981' },
    { value: 'DELIVERY', label: 'Delivery', color: '#3b82f6' },
    { value: 'PICKUP', label: 'Pickup', color: '#f59e0b' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: '#ef4444' },
    { value: 'INSPECTION', label: 'Inspection', color: '#8b5cf6' },
    { value: 'MEETING', label: 'Meeting', color: '#ec4899' },
    { value: 'REMINDER', label: 'Reminder', color: '#f97316' },
    { value: 'CUSTOM', label: 'Custom', color: '#6b7280' },
  ];

  const statusOptions = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filterType, filterStatus, filterPriority])

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calendar/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filterType !== 'all') {
      filtered = filtered.filter((e) => e.eventType === filterType);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((e) => e.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter((e) => e.priority === filterPriority);
    }

    setFilteredEvents(filtered);
  };

  const handleDateSelect = (selectInfo: any) => {
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    
    setModalData({
      ...modalData,
      startDate: start.toISOString().slice(0, 16),
      endDate: end.toISOString().slice(0, 16),
      allDay: selectInfo.allDay,
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = async (clickInfo: any) => {
    const eventId = parseInt(clickInfo.event.id);
    try {
      const response = await api.get(`/calendar/events/${eventId}`);
      setSelectedEvent(response.data);
      setModalData({
        title: response.data.title,
        description: response.data.description || '',
        eventType: response.data.eventType,
        startDate: new Date(response.data.startDate).toISOString().slice(0, 16),
        endDate: new Date(response.data.endDate).toISOString().slice(0, 16),
        allDay: response.data.allDay,
        priority: response.data.priority,
        color: response.data.color,
        location: response.data.location || '',
        notes: response.data.notes || '',
      });
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (selectedEvent) {
        // Update existing event
        await api.put(`/calendar/events/${selectedEvent.id}`, modalData);
      } else {
        // Create new event
        await api.post('/calendar/events', modalData);
      }
      setShowModal(false);
      fetchEvents();
      resetModal();
    } catch (error: any) {
      console.error('Failed to save event:', error);
      if (error.response?.status === 409) {
        alert('Equipment is already booked for this time period!');
      } else {
        alert('Failed to save event. Please try again.');
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/calendar/events/${selectedEvent.id}`);
        setShowModal(false);
        fetchEvents();
        resetModal();
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const resetModal = () => {
    setModalData({
      title: '',
      description: '',
      eventType: 'CUSTOM',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date().toISOString().slice(0, 16),
      allDay: false,
      priority: 'MEDIUM',
      color: '#3b82f6',
      location: '',
      notes: '',
    });
    setSelectedEvent(null);
  };

  const calendarEvents = filteredEvents.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.allDay,
    backgroundColor: event.color,
    borderColor: event.color,
    extendedProps: {
      description: event.description,
      eventType: event.eventType,
      status: event.status,
      priority: event.priority,
    },
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Calendar</h1>
        <p className="text-neutral-600">Manage orders, deliveries, and events</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Event Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2"
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('all');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
              className="w-full bg-neutral-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          {eventTypes.map((type) => (
            <div key={type.value} className="flex items-center">
              <div
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={calendarEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {selectedEvent ? 'Edit Event' : 'Create Event'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={modalData.title}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    value={modalData.description}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Event Type *</label>
                    <select
                      value={modalData.eventType}
                      onChange={(e) => {
                        const type = eventTypes.find((t) => t.value === e.target.value);
                        setModalData({
                          ...modalData,
                          eventType: e.target.value,
                          color: type?.color || '#3b82f6',
                        });
                      }}
                      className="w-full border border-neutral-300 rounded-md px-3 py-2"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
                    <select
                      value={modalData.priority}
                      onChange={(e) => setModalData({ ...modalData, priority: e.target.value })}
                      className="w-full border border-neutral-300 rounded-md px-3 py-2"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={modalData.startDate}
                      onChange={(e) => setModalData({ ...modalData, startDate: e.target.value })}
                      className="w-full border border-neutral-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">End Date *</label>
                    <input
                      type="datetime-local"
                      value={modalData.endDate}
                      onChange={(e) => setModalData({ ...modalData, endDate: e.target.value })}
                      className="w-full border border-neutral-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={modalData.allDay}
                      onChange={(e) => setModalData({ ...modalData, allDay: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-neutral-700">All Day Event</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={modalData.location}
                    onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
                  <textarea
                    value={modalData.notes}
                    onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={modalData.color}
                    onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                    className="h-10 w-20 border border-neutral-300 rounded-md"
                  />
                </div>

                {selectedEvent && (
                  <div className="bg-neutral-50 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Event Details</h3>
                    <div className="text-sm space-y-1">
                      <p>Status: <span className="font-medium">{selectedEvent.status}</span></p>
                      {selectedEvent.order && (
                        <p>Order: <span className="font-medium">{selectedEvent.order.orderNumber}</span></p>
                      )}
                      {selectedEvent.customer && (
                        <p>Customer: <span className="font-medium">{selectedEvent.customer.name}</span></p>
                      )}
                      {selectedEvent.equipment && (
                        <p>Equipment: <span className="font-medium">{selectedEvent.equipment.name}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {selectedEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetModal();
                  }}
                  className="px-4 py-2 bg-gray-300 text-neutral-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}