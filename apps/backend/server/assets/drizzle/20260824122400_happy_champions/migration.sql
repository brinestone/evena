CREATE TYPE "event_address" AS ENUM('point', 'struct');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "address_type" "event_address" NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "address" jsonb DEFAULT '{}';