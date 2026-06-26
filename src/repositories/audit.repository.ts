import { eq, and, gte, lte, sql, count } from "drizzle-orm";
import { db } from "../db";
import { auditEvents, AuditEvent, NewAuditEvent } from "../db/schema";

export interface QueryFilters {
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string; // ISO 8601 date string
  to?: string; // ISO 8601 date string
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  events: AuditEvent[];
  total: number;
  limit: number;
  offset: number;
}

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
   * Query events with filters and pagination
   */
  async findAll(filters: QueryFilters = {}): Promise<QueryResult> {
    const conditions = [];

    // Build WHERE conditions from filters
    if (filters.actorId) {
      conditions.push(eq(auditEvents.actorId, filters.actorId));
    }

    if (filters.action) {
      conditions.push(eq(auditEvents.action, filters.action));
    }

    if (filters.resourceType) {
      conditions.push(eq(auditEvents.resourceType, filters.resourceType));
    }

    if (filters.resourceId) {
      conditions.push(eq(auditEvents.resourceId, filters.resourceId));
    }

    // Date range filtering
    if (filters.from) {
      conditions.push(gte(auditEvents.createdAt, new Date(filters.from)));
    }

    if (filters.to) {
      conditions.push(lte(auditEvents.createdAt, new Date(filters.to)));
    }

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Set pagination defaults
    const limit =
      filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 50;
    const offset = filters.offset && filters.offset >= 0 ? filters.offset : 0;

    // Get total count (with same filters)
    const [countResult] = await db
      .select({ count: count() })
      .from(auditEvents)
      .where(whereClause);

    const total = Number(countResult.count);

    // Get paginated results
    const events = await db
      .select()
      .from(auditEvents)
      .where(whereClause)
      .orderBy(auditEvents.createdAt) // Oldest first
      .limit(limit)
      .offset(offset);

    return {
      events,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get total count of events
   */
  async getCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(auditEvents);

    return Number(result.count);
  }
}

// Singleton instance
export const auditRepository = new AuditRepository();
