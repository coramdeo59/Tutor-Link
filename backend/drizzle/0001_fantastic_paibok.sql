ALTER TABLE "addresses" ADD COLUMN "address_line_1" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "address_line_2" varchar(255);--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "street";