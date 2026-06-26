CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255) NOT NULL,
	"before_state" jsonb,
	"after_state" jsonb,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"signature" varchar(64)
);
--> statement-breakpoint
CREATE INDEX "idx_actor_id" ON "audit_events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_action" ON "audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_resource_type" ON "audit_events" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "idx_resource_id" ON "audit_events" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_created_at" ON "audit_events" USING btree ("created_at");