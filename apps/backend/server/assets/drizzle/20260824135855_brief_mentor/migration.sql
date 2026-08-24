CREATE TYPE "event_attachment_type" AS ENUM('image', 'video', 'audio');--> statement-breakpoint
CREATE TABLE "event_attachments" (
	"id" text PRIMARY KEY,
	"resource" text,
	"type" "event_attachment_type" NOT NULL,
	"event" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "tags" text[] DEFAULT '{}'::text[];--> statement-breakpoint
CREATE INDEX "event_attachments_event_index" ON "event_attachments" ("event");--> statement-breakpoint
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_event_events_id_fkey" FOREIGN KEY ("event") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_createdBy_user_id_fkey", ADD CONSTRAINT "events_createdBy_user_id_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;