ALTER TABLE "events" ALTER COLUMN "ticket_cost" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ticket_cost" DROP NOT NULL;