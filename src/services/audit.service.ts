import { AuditEventInput, AuditEvent } from "../types/event";
import { eventStore } from "./storage";

export class AuditService {
  /**
   * Record a single event
   * Server assigns id and timestamp, ignoring any from client
   */
  recordEvent(input: AuditEventInput): AuditEvent {
    // Note: Any id or timestamp from client is already stripped by validation
    return eventStore.store(input);
  }
}

// Singleton instance
export const auditService = new AuditService();
