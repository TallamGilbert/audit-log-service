import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// Audit events table - the heart of our service
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Required fields
    actorId: varchar("actor_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 100 }).notNull(),
    resourceId: varchar("resource_id", { length: 255 }).notNull(),

    // Optional fields
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),

    // Server-assigned timestamp
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // For Phase 2.5 (HMAC signing) - we'll add this column now
    signature: varchar("signature", { length: 64 }),
  },
  (table) => ({
    // Indexes for efficient querying (Phase 3)
    actorIdIdx: index("idx_actor_id").on(table.actorId),
    actionIdx: index("idx_action").on(table.action),
    resourceTypeIdx: index("idx_resource_type").on(table.resourceType),
    resourceIdIdx: index("idx_resource_id").on(table.resourceId),
    createdAtIdx: index("idx_created_at").on(table.createdAt),
  }),
);

// TypeScript types inferred from schema
export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
