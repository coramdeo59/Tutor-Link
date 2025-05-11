ALTER TABLE "grade_levels" DROP CONSTRAINT "grade_levels_grade_name_unique";--> statement-breakpoint
ALTER TABLE "grade_levels" ADD COLUMN "grade_Level" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "grade_levels" DROP COLUMN "grade_name";--> statement-breakpoint
ALTER TABLE "grade_levels" ADD CONSTRAINT "grade_levels_grade_Level_unique" UNIQUE("grade_Level");