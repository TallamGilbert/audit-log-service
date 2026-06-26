import { v4 as uuidv4 } from "uuid";
import { AuditEventInput, AuditEvent } from "../types/event";

// Simple in-memory storage - will be replaced with database in Phase 2
class EventStore {
  private events: Map<string, AuditEvent> = new Map();

  /**
   * Store a new event
   * @param input - The validated event data
   * @returns The stored event with server-assigned id and timestamp
   */
  store(input: AuditEventInput): AuditEvent {
    // Create the event with server-assigned values
    const event: AuditEvent = {
      ...input,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    this.events.set(event.id, event);
    return event;
  }

  /**
   * Get an event by ID
   */
  getById(id: string): AuditEvent | undefined {
    return this.events.get(id);
  }

  /**
   * Get all events (will add filtering in Phase 3)
   */
  getAll(): AuditEvent[] {
    return Array.from(this.events.values());
  }
}

// Export a singleton instance
export const eventStore = new EventStore();
