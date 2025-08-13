import { google } from "googleapis";
import { GoogleAuth, AuthClient } from "google-auth-library";
import Environment from "../environment";

class Calendar {
  serviceAccount: GoogleAuth<AuthClient>;
  calendar: typeof google.calendar;
  private readonly environment: Environment;

  constructor(environment: Environment) {
    this.serviceAccount = new google.auth.GoogleAuth({
      keyFile: environment.keyFile,
      scopes: environment.scopes,
    });

    google.options({ auth: this.serviceAccount });
    this.calendar = google.calendar;
    this.environment = environment;
  }

  /**
   * List all calendars available to the authenticated account
   */
  async listCalendars() {
    const res = await this.calendar("v3").calendarList.list();
    const calendars = res.data.items || [];
    return calendars.map((cal) => ({ id: cal.id, summary: cal.summary }));
  }

  /**
   * List events with optional date filtering
   */
  async listEvents({
    calendarId = this.environment.calendarId,
    timeMin,
    timeMax,
    maxResults = 10,
  }: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }) {
    const res = await this.calendar("v3").events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return res.data.items || [];
  }

  /**
   * Search events by text query
   */
  async searchEvents({
    calendarId = this.environment.calendarId,
    query,
    maxResults = 10,
  }: {
    calendarId?: string;
    query: string;
    maxResults?: number;
  }) {
    const res = await this.calendar("v3").events.list({
      calendarId,
      q: query,
      maxResults,
      singleEvents: true,
    });

    return res.data.items || [];
  }

  /**
   * Create a new event
   */
  async createEvent({
    calendarId = this.environment.calendarId,
    summary,
    description,
    startTime,
    endTime,
    attendees = [],
  }: {
    calendarId?: string;
    summary: string;
    description?: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    attendees?: { email: string }[];
  }) {
    const res = await this.calendar("v3").events.insert({
      calendarId,
      requestBody: {
        summary,
        description,
        start: { dateTime: startTime },
        end: { dateTime: endTime },
        attendees,
      },
    });

    return res.data;
  }

  /**
   * Update an existing event
   */
  async updateEvent({
    calendarId = this.environment.calendarId,
    eventId,
    updates,
  }: {
    calendarId?: string;
    eventId: string;
    updates: any; // Should follow Google Calendar event schema
  }) {
    const res = await this.calendar("v3").events.patch({
      calendarId,
      eventId,
      requestBody: updates,
    });

    return res.data;
  }

  /**
   * Delete an event
   */
  async deleteEvent({
    calendarId = this.environment.calendarId,
    eventId,
  }: {
    calendarId?: string;
    eventId: string;
  }) {
    await this.calendar("v3").events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  }
}

export default Calendar;
