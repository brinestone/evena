ALTER TABLE "events" ALTER COLUMN "address_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "event_address";--> statement-breakpoint
CREATE TYPE "event_address" AS ENUM('point', 'text');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "address_type" SET DATA TYPE "event_address" USING "address_type"::"event_address";