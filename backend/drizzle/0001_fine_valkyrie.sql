CREATE TABLE "tutor_subjects" (
	"tutor_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"grade_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tutor_subjects_tutor_id_subject_id_grade_id_pk" PRIMARY KEY("tutor_id","subject_id","grade_id")
);
--> statement-breakpoint
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_tutor_id_tutors_tutor_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("tutor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_grade_id_grade_levels_grade_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grade_levels"("grade_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutors" DROP COLUMN "subject_id";--> statement-breakpoint
ALTER TABLE "tutors" DROP COLUMN "grade_id";