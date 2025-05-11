ALTER TABLE "grade_levels" ALTER COLUMN "grade_name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "grade_levels" ADD CONSTRAINT "grade_levels_grade_name_unique" UNIQUE("grade_name");--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_subject_name_unique" UNIQUE("subject_name");