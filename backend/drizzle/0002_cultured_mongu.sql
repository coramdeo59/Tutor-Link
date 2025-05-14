DROP TABLE "tutor_subjects" CASCADE;--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "subject_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "grade_id" integer NOT NULL;