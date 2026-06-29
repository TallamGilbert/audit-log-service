import { AuditEventInput } from "../types/event";
import { auditRepository } from "../repositories/audit.repository";
import { signatureService } from "./signature.service";
import { AuditEvent } from "../db/schema";

export class AuditService {
  /**
   * Record a single event with signing
   */
  async recordEvent(input: AuditEventInput): Promise<AuditEvent> {
    // Create the event first
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

    // Sign the event
    const signature = signatureService.signEvent(event);
    await auditRepository.updateSignature(event.id, signature);

    // Return the event with signature
    return {
      ...event,
      signature,
    };
  }

  /**
   * Record multiple events atomically with signing
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

    // Create all events in transaction
    const events = await auditRepository.createBatch(eventData);

    // Sign each event
    const signedEvents = await Promise.all(
      events.map(async (event) => {
        const signature = signatureService.signEvent(event);
        await auditRepository.updateSignature(event.id, signature);
        return { ...event, signature };
      }),
    );

    return signedEvents;
  }

  /**
   * Verify an event's integrity
   */
  verifyEvent(event: AuditEvent): boolean {
    return signatureService.verifyEvent(event);
  }
}

export const auditService = new AuditService();
