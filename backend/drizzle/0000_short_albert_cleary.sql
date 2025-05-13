CREATE TYPE "public"."day_of_week_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('admin', 'regular');--> statement-breakpoint
CREATE TYPE "public"."user_type_enum" AS ENUM('tutor', 'parent');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"address_line_1" varchar(255) NOT NULL,
	"state" varchar(100),
	"city" varchar(100),
	"phone_number" varchar(50),
	"street" varchar(255)
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
	"day_of_week" "day_of_week_enum" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_subjects" (
	"tutor_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"grade_id" integer NOT NULL,
	CONSTRAINT "tutor_subjects_tutor_id_subject_id_grade_id_pk" PRIMARY KEY("tutor_id","subject_id","grade_id")
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"tutor_id" integer PRIMARY KEY NOT NULL,
	"bio" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"document_pdf_url" varchar(255),
	"cv_url" varchar(255),
	"kebele_id_url" varchar(255),
	"national_id_url" varchar(255),
	"fan_number" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_details_tutor_id_unique" UNIQUE("tutor_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"photo" varchar(255),
	"address_id" integer NOT NULL,
	"user_type" "user_type_enum" NOT NULL,
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
	"date_of_birth" date,
	"grade_level_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"parent_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_availability_slots" ADD CONSTRAINT "tutor_availability_slots_tutor_id_tutors_tutor_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("tutor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_tutor_id_users_user_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_details" ADD CONSTRAINT "verification_details_tutor_id_tutors_tutor_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("tutor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_parents_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("parent_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_grade_level_id_grade_levels_grade_id_fk" FOREIGN KEY ("grade_level_id") REFERENCES "public"."grade_levels"("grade_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_parent_id_users_user_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tutor_day_slot_idx" ON "tutor_availability_slots" USING btree ("tutor_id","day_of_week","start_time");--> statement-breakpoint
CREATE INDEX "tutor_subjects_tutor_idx" ON "tutor_subjects" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_subjects_subject_idx" ON "tutor_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "tutor_subjects_grade_idx" ON "tutor_subjects" USING btree ("grade_id");