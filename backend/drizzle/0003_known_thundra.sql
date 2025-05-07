CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_subjects" (
	"student_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_subjects_student_id_subject_id_pk" PRIMARY KEY("student_id","subject_id")
);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "grade_level_id" integer;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_subjects_subject_idx" ON "student_subjects" USING btree ("subject_id");--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_grade_level_id_grade_levels_grade_id_fk" FOREIGN KEY ("grade_level_id") REFERENCES "public"."grade_levels"("grade_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "students_grade_idx" ON "students" USING btree ("grade_level_id");