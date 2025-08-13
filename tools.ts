import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "./server";
import Environment from "./environment";
import Calendar from "./utils/calendar";

class Tools {
  private _server: Server;
  private _calendar: Calendar;

  constructor(server: Server) {
    this._server = server;
    const environment = new Environment();
    this._calendar = new Calendar(environment);
    this.registerTools();
    this.handleToolsExecution();
  }

  private registerTools() {
    this._server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_calendars",
            description: "List all available calendars for the authenticated user",
            inputSchema: { type: "object", properties: {}, required: [] },
          },
          {
            name: "list_events",
            description: "List events for a given calendar ID with optional date filtering",
            inputSchema: {
              type: "object",
              properties: {
                calendarId: { type: "string" },
                timeMin: { type: "string" },
                timeMax: { type: "string" },
              },
              required: [],
            },
          },
          {
            name: "search_events",
            description: "Search events in a calendar by text query",
            inputSchema: {
              type: "object",
              properties: {
                calendarId: { type: "string" },
                query: { type: "string" },
              },
              required: ["query"],
            },
          },
          {
            name: "create_event",
            description: "Create a new event in a calendar",
            inputSchema: {
              type: "object",
              properties: {
                calendarId: { type: "string" },
                summary: { type: "string" },
                description: { type: "string" },
                startTime: { type: "string" },
                endTime: { type: "string" },
                attendees: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      email: { type: "string" },
                    },
                    required: ["email"],
                  },
                },
              },
              required: ["summary", "startTime", "endTime"],
            },
          },
          {
            name: "update_event",
            description: "Update an existing calendar event",
            inputSchema: {
              type: "object",
              properties: {
                calendarId: { type: "string" },
                eventId: { type: "string" },
                updates: { type: "object" },
              },
              required: ["eventId", "updates"],
            },
          },
          {
            name: "delete_event",
            description: "Delete an event by ID",
            inputSchema: {
              type: "object",
              properties: {
                calendarId: { type: "string" },
                eventId: { type: "string" },
              },
              required: ["eventId"],
            },
          },
        ],
      };
    });
  }

  handleToolsExecution() {
    this._server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_calendars":
            const calendars = await this._calendar.listCalendars();
            return {
              content: [
                {
                  type: "text",
                  text: calendars.map(c => `• ${c.summary} (${c.id})`).join("\n"),
                },
              ],
            };

          case "list_events":
            const events = await this._calendar.listEvents(args as Record<string, string>);
            return {
              content: [
                {
                  type: "text",
                  text: events.length
                    ? events.map(e => `• ${e.summary || "Untitled"} - ${e.id}`).join("\n")
                    : "No events found.",
                },
              ],
            };

          case "search_events":
            const searchResults = await this._calendar.searchEvents(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: searchResults.length
                    ? searchResults.map(e => `• ${e.summary || "Untitled"} - ${e.id}`).join("\n")
                    : "No matching events found.",
                },
              ],
            };

          case "create_event":
            const created = await this._calendar.createEvent(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: `Event "${created.summary}" created successfully.`,
                },
              ],
            };

          case "update_event":
            const updated = await this._calendar.updateEvent(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: `Event "${updated.summary}" updated successfully.`,
                },
              ],
            };

          case "delete_event":
            await this._calendar.deleteEvent(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: `Event "${args?.eventId}" deleted successfully.`,
                },
              ],
            };

          default:
            throw new Error(`Tool "${name}" not found`);
        }
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${(err as Error).message}`,
            },
          ],
        };
      }
    });
  }
}

export default Tools;