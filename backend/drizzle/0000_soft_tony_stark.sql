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
	"overall_progress" integer,
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
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_parents_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("parent_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_idx" ON "password_reset_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "token_idx" ON "password_reset_tokens" USING btree ("token");