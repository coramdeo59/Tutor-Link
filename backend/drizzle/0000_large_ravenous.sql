CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_id" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"due_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'ETB' NOT NULL,
	"description" text NOT NULL,
	"tx_ref" varchar(100) NOT NULL,
	"chapa_ref_id" varchar(100),
	"redirect_url" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"user_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone_number" varchar(20),
	"invoice_id" integer,
	"tutoring_session_id" integer,
	"webhook_received" boolean DEFAULT false,
	"webhook_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	CONSTRAINT "payments_tx_ref_unique" UNIQUE("tx_ref")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
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
CREATE TABLE "tutor_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"day_of_week" varchar(20) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutor_unavailable_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutoring_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"subject_id" integer,
	"subject_name" varchar(100) NOT NULL,
	"grade_level_id" integer,
	"grade_level_name" varchar(50),
	"date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"amount" numeric(10, 2),
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"cancelled_by" integer,
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"admin_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone_number" varchar(50),
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "child_subjects" (
	"child_subject_id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"enrollment_date" date DEFAULT now() NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_assessments" (
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
CREATE TABLE "subjects" (
	"subject_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "children" (
	"child_id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"photo" varchar(255),
	"date_of_birth" date,
	"grade_level_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "children_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"parent_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"photo" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"role" varchar(50) DEFAULT 'parent' NOT NULL,
	"preferred_subjects" text,
	"preferred_communication" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parents_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tutor_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"grade_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"subject_name" varchar(100) NOT NULL,
	"subject_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutor_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"fan_number" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"verification_date" timestamp,
	"id_document_url" varchar(255),
	"cv_url" varchar(255),
	"education_level" varchar(100),
	"institution_name" varchar(255),
	"degree" varchar(100),
	"graduation_year" varchar(4),
	"years_of_experience" integer,
	"has_teaching_certificate" boolean DEFAULT false,
	"certificate_url" varchar(255),
	"approved" boolean DEFAULT false,
	"approved_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"tutor_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"photo" varchar(255),
	"street" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"country" varchar(100) DEFAULT 'Ethiopia',
	"bio" text,
	"hourly_rate" integer DEFAULT 0,
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"role" varchar(50) DEFAULT 'tutor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tutors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_subjects" ADD CONSTRAINT "child_subjects_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_subjects" ADD CONSTRAINT "child_subjects_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_assessments" ADD CONSTRAINT "progress_assessments_session_id_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_assessments" ADD CONSTRAINT "progress_assessments_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_assessments" ADD CONSTRAINT "progress_assessments_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_parents_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("parent_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_idx" ON "password_reset_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_child_id_idx" ON "sessions" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "sessions_status_idx" ON "sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_start_time_idx" ON "sessions" USING btree ("start_time");--> statement-breakpoint
CREATE UNIQUE INDEX "child_subject_idx" ON "child_subjects" USING btree ("child_id","subject_id");--> statement-breakpoint
CREATE INDEX "child_subjects_child_id_idx" ON "child_subjects" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "progress_assessments_child_id_idx" ON "progress_assessments" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "progress_assessments_subject_id_idx" ON "progress_assessments" USING btree ("subject_id");