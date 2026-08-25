CREATE TYPE "event_type" AS ENUM('invite_only', 'open');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "attendeeLimit" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "type" "event_type" DEFAULT 'open'::"event_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ticketCost" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "currency" varchar(3) NOT NULL;