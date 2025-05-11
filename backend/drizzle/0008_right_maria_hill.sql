ALTER TABLE "tutor_id_documents" DROP CONSTRAINT "tutor_id_documents_country_id_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "tutor_id_documents" DROP CONSTRAINT "tutor_id_documents_province_id_states_id_fk";
--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" DROP CONSTRAINT "tutor_teaching_licenses_issuing_country_id_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" DROP CONSTRAINT "tutor_teaching_licenses_issuer_province_id_states_id_fk";
--> statement-breakpoint
DROP INDEX "tutor_id_documents_country_idx";--> statement-breakpoint
DROP INDEX "tutor_id_documents_province_idx";--> statement-breakpoint
DROP INDEX "tutor_teaching_licenses_country_idx";--> statement-breakpoint
DROP INDEX "tutor_teaching_licenses_province_idx";--> statement-breakpoint
ALTER TABLE "tutor_id_documents" ADD COLUMN "country_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "tutor_id_documents" ADD COLUMN "province_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" ADD COLUMN "issuing_country_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" ADD COLUMN "issuer_province_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "tutor_id_documents" DROP COLUMN "country_id";--> statement-breakpoint
ALTER TABLE "tutor_id_documents" DROP COLUMN "province_id";--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" DROP COLUMN "issuing_country_id";--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" DROP COLUMN "issuer_province_id";