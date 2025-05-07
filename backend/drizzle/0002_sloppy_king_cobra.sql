DROP INDEX "state_code_country_unique_idx";--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "phone_number" varchar(50);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_state_name_in_country_idx" ON "states" USING btree ("country_id","name");