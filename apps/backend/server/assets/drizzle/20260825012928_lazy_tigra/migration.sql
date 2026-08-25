CREATE TABLE "event_attendances" (
	"id" text PRIMARY KEY,
	"reservation" text,
	"event" text,
	"attendee" text,
	"company" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_reservations" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"chargeable" boolean DEFAULT true NOT NULL,
	"company" integer DEFAULT 0 NOT NULL,
	"discount" real DEFAULT 0 NOT NULL,
	"discount_reason" text,
	"user_id" text,
	"reservation_code" varchar(6),
	"beneficiary_name" text,
	"beneficiary_email" text,
	"beneficiary_phone" text,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"event" text,
	"attended_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "duration" interval;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "addage_limit" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ticket_cost" SET DATA TYPE integer USING "ticket_cost"::integer;--> statement-breakpoint
CREATE INDEX "event_attendances_reservation_index" ON "event_attendances" ("reservation") WHERE ("reservation" is not null);--> statement-breakpoint
CREATE INDEX "event_attendances_event_index" ON "event_attendances" ("event") WHERE ("event" is not null);--> statement-breakpoint
CREATE INDEX "event_attendances_attendee_index" ON "event_attendances" ("attendee") WHERE ("attendee" is not null);--> statement-breakpoint
CREATE INDEX "event_attendances_reservation_event_index" ON "event_attendances" ("reservation","event") WHERE ((("reservation" is not null)) and (("event" is not null)));--> statement-breakpoint
CREATE INDEX "event_reservations_created_at_index" ON "event_reservations" ("created_at");--> statement-breakpoint
CREATE INDEX "event_reservations_updated_at_index" ON "event_reservations" ("updated_at");--> statement-breakpoint
CREATE INDEX "event_reservations_user_id_index" ON "event_reservations" ("user_id") WHERE ("user_id" is not null);--> statement-breakpoint
CREATE INDEX "event_reservations_reservation_code_event_index" ON "event_reservations" ("reservation_code","event") WHERE ("reservation_code" is not null);--> statement-breakpoint
CREATE INDEX "event_reservations_beneficiary_email_index" ON "event_reservations" ("beneficiary_email") WHERE ("beneficiary_email" is not null);--> statement-breakpoint
CREATE INDEX "event_reservations_beneficiary_phone_index" ON "event_reservations" ("beneficiary_phone") WHERE ("beneficiary_phone" is not null);--> statement-breakpoint
CREATE INDEX "event_reservations_event_index" ON "event_reservations" ("event");--> statement-breakpoint
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_reservation_event_reservations_id_fkey" FOREIGN KEY ("reservation") REFERENCES "event_reservations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_event_events_id_fkey" FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_attendee_user_id_fkey" FOREIGN KEY ("attendee") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_reservations" ADD CONSTRAINT "event_reservations_event_events_id_fkey" FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_reservations" ADD CONSTRAINT "event_reservations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
CREATE VIEW "vw_event_lookup" AS (select "e"."id", "e"."name", "e"."description", "e"."updated_at", "e"."started_at", "e"."attendee_limit", count("ca"."id") as "attendances", count("ca"."id") as "pending_reservations" from "events" "e" left join "event_attendances" "ca" on "ca"."event" = "e"."id" left join "event_reservations" "pr" on (("pr"."event" = "e"."id") and (("pr"."cancelled_at" is null)) and (("pr"."attended_at" is null))) group by "e"."id" order by "e"."updated_at" desc);