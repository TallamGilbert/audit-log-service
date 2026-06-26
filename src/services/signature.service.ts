import { createHmac } from "crypto";
import { config } from "../config";

export class SignatureService {
  private readonly secret: string;

  constructor() {
    this.secret = config.secret;
  }

  /**
   * Create an HMAC signature for an event
   * Signs all mutable fields to detect tampering
   */
  signEvent(event: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    beforeState?: unknown;
    afterState?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
  }): string {
    // Create a canonical representation of the event
    // Order matters for consistent signatures
    const payload = JSON.stringify({
      actor_id: event.actorId,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      before_state: event.beforeState ?? null,
      after_state: event.afterState ?? null,
      ip_address: event.ipAddress ?? null,
      user_agent: event.userAgent ?? null,
      created_at: event.createdAt.toISOString(),
    });

    return createHmac("sha256", this.secret).update(payload).digest("hex");
  }

  /**
   * Verify an event's signature
   * Returns true if the event hasn't been tampered with
   */
  verifyEvent(event: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    beforeState?: unknown;
    afterState?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    signature: string | null;
  }): boolean {
    if (!event.signature) {
      return false;
    }

    const expectedSignature = this.signEvent(event);
    return event.signature === expectedSignature;
  }
}

export const signatureService = new SignatureService();
