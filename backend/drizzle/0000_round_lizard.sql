CREATE TYPE "public"."day_of_week_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('admin', 'regular');--> statement-breakpoint
CREATE TYPE "public"."user_type_enum" AS ENUM('tutor', 'parent');--> statement-breakpoint
CREATE TABLE "achievements" (
	"achievement_id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"earned_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"preferred_subject_ids" jsonb,
	"widget_preferences" jsonb,
	"display_preferences" jsonb,
	"pinned_items" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_settings_child_id_unique" UNIQUE("child_id")
);
--> statement-breakpoint
CREATE TABLE "learning_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"hours_spent" numeric NOT NULL,
	"session_id" integer,
	"description" text,
	"week_start_date" timestamp with time zone,
	"total_hours" numeric,
	"recorded_date" timestamp with time zone NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_progress" (
	"progress_id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"progress_percentage" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutoring_sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"topic" varchar(255),
	"cancelled" boolean DEFAULT false,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"tutor_id" integer PRIMARY KEY NOT NULL,
	"bio" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"subject_id" integer NOT NULL,
	"grade_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"stateId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "states_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "grade_levels" (
	"grade_id" serial PRIMARY KEY NOT NULL,
	"grade_Level" varchar(100) NOT NULL,
	CONSTRAINT "grade_levels_grade_Level_unique" UNIQUE("grade_Level")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"subject_id" serial PRIMARY KEY NOT NULL,
	"subject_name" varchar(100) NOT NULL,
	CONSTRAINT "subjects_subject_name_unique" UNIQUE("subject_name")
);
--> statement-breakpoint
CREATE TABLE "tutor_availability_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"day_of_week" "day_of_week_enum"[] NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"document_Upload" varchar(255),
	"cv_url" varchar(255),
	"kebele_id_Upload" varchar(255),
	"national_id_Upload" varchar(255),
	"fan_number" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_details_tutor_id_unique" UNIQUE("tutor_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"photo" varchar(255),
	"stateId" integer NOT NULL,
	"cityId" integer NOT NULL,
	"phoneNumber" varchar(50) NOT NULL,
	"userType" "user_type_enum" NOT NULL,
	"role" "role_enum" DEFAULT 'regular' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "children" (
	"child_id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"username" varchar(100) NOT NULL,
	"date_of_birth" date,
	"grade_level_id" integer,
	"password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "children_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"parent_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_settings" ADD CONSTRAINT "dashboard_settings_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_hours" ADD CONSTRAINT "learning_hours_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_hours" ADD CONSTRAINT "learning_hours_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_hours" ADD CONSTRAINT "learning_hours_session_id_tutoring_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tutoring_sessions"("session_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_progress" ADD CONSTRAINT "session_progress_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_progress" ADD CONSTRAINT "session_progress_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_tutor_id_tutors_tutor_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("tutor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_tutor_id_users_userId_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_stateId_states_id_fk" FOREIGN KEY ("stateId") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_availability_slots" ADD CONSTRAINT "tutor_availability_slots_tutor_id_tutors_tutor_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("tutor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_details" ADD CONSTRAINT "verification_details_tutor_id_tutors_tutor_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("tutor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stateId_states_id_fk" FOREIGN KEY ("stateId") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_cityId_cities_id_fk" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_parents_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("parent_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_grade_level_id_grade_levels_grade_id_fk" FOREIGN KEY ("grade_level_id") REFERENCES "public"."grade_levels"("grade_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_parent_id_users_userId_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tutor_day_slot_idx" ON "tutor_availability_slots" USING btree ("tutor_id","start_time");