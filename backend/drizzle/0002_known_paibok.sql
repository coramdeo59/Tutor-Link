CREATE TABLE "child_tutoring_sessions" (
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
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"submission_id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"score" integer,
	"comments" text,
	"submission_text" text,
	"file_url" varchar(500),
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"graded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"instructions" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"max_score" integer NOT NULL,
	"estimated_time_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "feedback_responses" (
	"response_id" serial PRIMARY KEY NOT NULL,
	"feedback_id" integer NOT NULL,
	"responder_id" integer NOT NULL,
	"responder_type" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_feedback" (
	"feedback_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"parent_id" integer,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"feedback_type" varchar(50) NOT NULL,
	"session_id" integer,
	"subject_id" integer,
	"assignment_id" integer,
	"is_private" boolean DEFAULT false,
	"is_acknowledged" boolean DEFAULT false,
	"acknowledged_at" timestamp,
	"acknowledged_by" integer,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_files" (
	"file_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"cloudinary_url" varchar(500) NOT NULL,
	"cloudinary_public_id" varchar(200) NOT NULL,
	"subject_id" integer,
	"assignment_id" integer,
	"session_id" integer,
	"description" text,
	"category" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tutor_unavailable_dates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "progress_assessments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "child_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tutor_unavailable_dates" CASCADE;--> statement-breakpoint
DROP TABLE "progress_assessments" CASCADE;--> statement-breakpoint
DROP TABLE "child_sessions" CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_child_id_children_child_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_subject_id_subjects_subject_id_fk";
--> statement-breakpoint
ALTER TABLE "child_progress_assessments" DROP CONSTRAINT "child_progress_assessments_session_id_sessions_session_id_fk";
--> statement-breakpoint
DROP INDEX "child_subject_idx";--> statement-breakpoint
DROP INDEX "child_subjects_child_id_idx";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ALTER COLUMN "subject_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "subject" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "invoice_id" integer;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD COLUMN "session_id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD COLUMN "title" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "child_tutoring_sessions" ADD CONSTRAINT "child_tutoring_sessions_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_tutoring_sessions" ADD CONSTRAINT "child_tutoring_sessions_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_progress_assessments" ADD CONSTRAINT "child_progress_assessments_session_id_child_tutoring_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."child_tutoring_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "session_id";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "subject_id";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "duration_minutes";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "subject_name";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "grade_level_id";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "grade_level_name";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "cancelled_by";--> statement-breakpoint
ALTER TABLE "tutoring_sessions" DROP COLUMN "cancellation_reason";