DROP INDEX "student_subjects_subject_idx";--> statement-breakpoint
DROP INDEX "students_grade_idx";--> statement-breakpoint
DROP INDEX "students_school_idx";--> statement-breakpoint
ALTER TABLE "student_subjects" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "school_name";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "enrollment_date";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "graduation_year";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" DROP COLUMN "subtype";