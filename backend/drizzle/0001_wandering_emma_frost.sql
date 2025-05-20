CREATE TABLE "child_progress_assessments" (
	"assessment_id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"progress_percentage" integer NOT NULL,
	"assessment_date" timestamp DEFAULT now() NOT NULL,
	"tutor_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "valid_progress_check" CHECK (progress_percentage BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "child_sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "valid_time_check" CHECK (end_time > start_time),
	CONSTRAINT "valid_status_check" CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "valid_time_check";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "valid_status_check";--> statement-breakpoint
ALTER TABLE "progress_assessments" DROP CONSTRAINT "progress_assessments_session_id_sessions_session_id_fk";
--> statement-breakpoint
DROP INDEX "sessions_child_id_idx";--> statement-breakpoint
DROP INDEX "sessions_status_idx";--> statement-breakpoint
DROP INDEX "sessions_start_time_idx";--> statement-breakpoint
ALTER TABLE "child_progress_assessments" ADD CONSTRAINT "child_progress_assessments_session_id_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_progress_assessments" ADD CONSTRAINT "child_progress_assessments_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_progress_assessments" ADD CONSTRAINT "child_progress_assessments_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_sessions" ADD CONSTRAINT "child_sessions_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_sessions" ADD CONSTRAINT "child_sessions_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "child_progress_assessments_child_id_idx" ON "child_progress_assessments" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "child_progress_assessments_subject_id_idx" ON "child_progress_assessments" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "child_sessions_child_id_idx" ON "child_sessions" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "child_sessions_status_idx" ON "child_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "child_sessions_start_time_idx" ON "child_sessions" USING btree ("start_time");--> statement-breakpoint
ALTER TABLE "progress_assessments" ADD CONSTRAINT "progress_assessments_session_id_child_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."child_sessions"("session_id") ON DELETE cascade ON UPDATE no action;