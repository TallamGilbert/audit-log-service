import { eq, and, gte, lte, sql, count } from "drizzle-orm";
import { db } from "../db";
import { auditEvents, AuditEvent, NewAuditEvent } from "../db/schema";

export class AuditRepository {
  /**
   * Create a single event
   */
  async create(
    data: Omit<NewAuditEvent, "id" | "createdAt">,
  ): Promise<AuditEvent> {
    const [event] = await db.insert(auditEvents).values(data).returning();

    return event;
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<AuditEvent | undefined> {
    const [event] = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.id, id));

    return event;
  }

  /**
   * Get total count of events
   */
  async getCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(auditEvents);

    return result.count;
  }
}

// Singleton instance
export const auditRepository = new AuditRepository();
