import { google, calendar_v3 } from 'googleapis';
import { getAuthClient, refreshAccessToken } from './oauth';

/**
 * Google Calendar Service
 * Handles all interactions with Google Calendar API
 */
export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private accessToken: string;
  private refreshToken: string | undefined;

  constructor(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    const auth = getAuthClient(accessToken, refreshToken);
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create a calendar event from order data
   * @param orderData Order information
   * @returns Created event
   */
  async createEvent(orderData: {
    id: number;
    orderNumber: string;
    startDate: Date;
    endDate: Date;
    equipment: { name: string; id: number }[];
    customer: { name: string; email?: string };
    notes?: string;
    deliveryAddress?: string;
  }) {
    try {
      const equipmentList = orderData.equipment
        .map((eq) => `• ${eq.name}`)
        .join('\n');

      const event: calendar_v3.Schema$Event = {
        summary: `📦 ${orderData.orderNumber} - ${orderData.customer.name}`,
        description: `
🎥 Ekipman Kiralama
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sipariş No: ${orderData.orderNumber}
Müşteri: ${orderData.customer.name}

📋 Ekipmanlar:
${equipmentList}

${orderData.notes ? `📝 Notlar:\n${orderData.notes}` : ''}

🔗 Canary Sistemi - Sipariş #${orderData.id}
        `.trim(),
        location: orderData.deliveryAddress || '',
        start: {
          dateTime: orderData.startDate.toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        end: {
          dateTime: orderData.endDate.toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        attendees: orderData.customer.email
          ? [{ email: orderData.customer.email }]
          : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 gün önce
            { method: 'popup', minutes: 60 }, // 1 saat önce
          ],
        },
        colorId: '2', // Yeşil - Kiralama
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all', // Email bildirimi gönder
      });

      return response.data;
    } catch (error: any) {
      if (error.code === 401) {
        // Token expired, try refresh
        if (this.refreshToken) {
          const newTokens = await refreshAccessToken(this.refreshToken);
          this.accessToken = newTokens.access_token!;
          
          // Retry with new token
          const auth = getAuthClient(this.accessToken, this.refreshToken);
          this.calendar = google.calendar({ version: 'v3', auth });
          return this.createEvent(orderData);
        }
      }
      console.error('Error creating calendar event:', error);
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  /**
   * Update existing calendar event
   * @param eventId Google Calendar event ID
   * @param orderData Updated order information
   * @returns Updated event
   */
  async updateEvent(
    eventId: string,
    orderData: {
      orderNumber: string;
      startDate: Date;
      endDate: Date;
      equipment: { name: string }[];
      customer: { name: string; email?: string };
      notes?: string;
      deliveryAddress?: string;
      status?: string;
    }
  ) {
    try {
      const equipmentList = orderData.equipment
        .map((eq) => `• ${eq.name}`)
        .join('\n');

      // Color based on status
      let colorId = '2'; // Green - default
      if (orderData.status === 'COMPLETED') colorId = '9'; // Blue
      if (orderData.status === 'CANCELLED') colorId = '11'; // Red
      if (orderData.status === 'ACTIVE') colorId = '5'; // Yellow

      const event: calendar_v3.Schema$Event = {
        summary: `📦 ${orderData.orderNumber} - ${orderData.customer.name}`,
        description: `
🎥 Ekipman Kiralama
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sipariş No: ${orderData.orderNumber}
Müşteri: ${orderData.customer.name}
Durum: ${orderData.status || 'PENDING'}

📋 Ekipmanlar:
${equipmentList}

${orderData.notes ? `📝 Notlar:\n${orderData.notes}` : ''}
        `.trim(),
        location: orderData.deliveryAddress || '',
        start: {
          dateTime: orderData.startDate.toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        end: {
          dateTime: orderData.endDate.toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        attendees: orderData.customer.email
          ? [{ email: orderData.customer.email }]
          : [],
        colorId,
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: event,
        sendUpdates: 'all', // Email bildirimi gönder
      });

      return response.data;
    } catch (error: any) {
      if (error.code === 401 && this.refreshToken) {
        const newTokens = await refreshAccessToken(this.refreshToken);
        this.accessToken = newTokens.access_token!;
        
        const auth = getAuthClient(this.accessToken, this.refreshToken);
        this.calendar = google.calendar({ version: 'v3', auth });
        return this.updateEvent(eventId, orderData);
      }
      console.error('Error updating calendar event:', error);
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  /**
   * Delete calendar event
   * @param eventId Google Calendar event ID
   */
  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all', // Email bildirimi gönder
      });
    } catch (error: any) {
      if (error.code === 401 && this.refreshToken) {
        const newTokens = await refreshAccessToken(this.refreshToken);
        this.accessToken = newTokens.access_token!;
        
        const auth = getAuthClient(this.accessToken, this.refreshToken);
        this.calendar = google.calendar({ version: 'v3', auth });
        return this.deleteEvent(eventId);
      }
      
      // 404 means event already deleted - not an error
      if (error.code === 404) {
        console.log('Event already deleted:', eventId);
        return;
      }
      
      console.error('Error deleting calendar event:', error);
      throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
  }

  /**
   * Get calendar event details
   * @param eventId Google Calendar event ID
   * @returns Event details
   */
  async getEvent(eventId: string) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      return response.data;
    } catch (error: any) {
      if (error.code === 401 && this.refreshToken) {
        const newTokens = await refreshAccessToken(this.refreshToken);
        this.accessToken = newTokens.access_token!;
        
        const auth = getAuthClient(this.accessToken, this.refreshToken);
        this.calendar = google.calendar({ version: 'v3', auth });
        return this.getEvent(eventId);
      }
      console.error('Error getting calendar event:', error);
      throw new Error(`Failed to get calendar event: ${error.message}`);
    }
  }

  /**
   * List calendar events in date range
   * @param startDate Start date
   * @param endDate End date
   * @returns List of events
   */
  async listEvents(startDate: Date, endDate: Date) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      if (error.code === 401 && this.refreshToken) {
        const newTokens = await refreshAccessToken(this.refreshToken);
        this.accessToken = newTokens.access_token!;
        
        const auth = getAuthClient(this.accessToken, this.refreshToken);
        this.calendar = google.calendar({ version: 'v3', auth });
        return this.listEvents(startDate, endDate);
      }
      console.error('Error listing calendar events:', error);
      throw new Error(`Failed to list calendar events: ${error.message}`);
    }
  }

  /**
   * Check equipment availability (conflict detection)
   * @param equipmentIds Equipment IDs to check
   * @param startDate Start date
   * @param endDate End date
   * @returns List of conflicting events
   */
  async checkAvailability(
    equipmentIds: number[],
    startDate: Date,
    endDate: Date
  ) {
    try {
      const events = await this.listEvents(startDate, endDate);

      // Filter events that contain any of the equipment IDs in description
      const conflicts = events.filter((event) => {
        const description = event.description || '';
        return equipmentIds.some((id) =>
          description.includes(`Equipment ID: ${id}`)
        );
      });

      return conflicts;
    } catch (error: any) {
      console.error('Error checking availability:', error);
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  /**
   * Get free/busy information
   * @param startDate Start date
   * @param endDate End date
   * @returns Free/busy data
   */
  async getFreeBusy(startDate: Date, endDate: Date) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.code === 401 && this.refreshToken) {
        const newTokens = await refreshAccessToken(this.refreshToken);
        this.accessToken = newTokens.access_token!;
        
        const auth = getAuthClient(this.accessToken, this.refreshToken);
        this.calendar = google.calendar({ version: 'v3', auth });
        return this.getFreeBusy(startDate, endDate);
      }
      console.error('Error getting free/busy:', error);
      throw new Error(`Failed to get free/busy information: ${error.message}`);
    }
  }
}
