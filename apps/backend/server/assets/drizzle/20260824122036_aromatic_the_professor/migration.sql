CREATE INDEX "events_name_index" ON "events" ("name");--> statement-breakpoint
CREATE INDEX "events_createdBy_index" ON "events" ("createdBy");--> statement-breakpoint
CREATE INDEX "events_createdAt_index" ON "events" ("createdAt");--> statement-breakpoint
CREATE INDEX "events_updatedAt_index" ON "events" ("updatedAt");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_createdBy_user_id_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id");