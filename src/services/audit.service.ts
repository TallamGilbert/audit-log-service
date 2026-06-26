import { AuditEventInput, AuditEvent } from "../types/event";
import { auditRepository } from "../repositories/audit.repository";
import { AuditEvent as DBAuditEvent } from "../db/schema";

export class AuditService {
  /**
   * Record a single event with persistence
   */
  async recordEvent(input: AuditEventInput): Promise<DBAuditEvent> {
    // Map from API shape to database shape
    const event = await auditRepository.create({
      actorId: input.actor_id,
      action: input.action,
      resourceType: input.resource_type,
      resourceId: input.resource_id,
      beforeState: input.before_state,
      afterState: input.after_state,
      ipAddress: input.ip_address,
      userAgent: input.user_agent,
    });

    return event;
  }
}

export const auditService = new AuditService();
