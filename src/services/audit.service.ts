import { AuditEventInput } from "../types/event";
import { auditRepository } from "../repositories/audit.repository";
import { AuditEvent } from "../db/schema";

export class AuditService {
  /**
   * Record a single event
   */
  async recordEvent(input: AuditEventInput): Promise<AuditEvent> {
    return auditRepository.create({
      actorId: input.actor_id,
      action: input.action,
      resourceType: input.resource_type,
      resourceId: input.resource_id,
      beforeState: input.before_state,
      afterState: input.after_state,
      ipAddress: input.ip_address,
      userAgent: input.user_agent,
    });
  }

  /**
   * Record multiple events atomically
   * All succeed or all fail
   */
  async recordBulk(inputs: AuditEventInput[]): Promise<AuditEvent[]> {
    const eventData = inputs.map((input) => ({
      actorId: input.actor_id,
      action: input.action,
      resourceType: input.resource_type,
      resourceId: input.resource_id,
      beforeState: input.before_state,
      afterState: input.after_state,
      ipAddress: input.ip_address,
      userAgent: input.user_agent,
    }));

    // This uses a transaction - all or nothing
    return auditRepository.createBatch(eventData);
  }
}

export const auditService = new AuditService();
