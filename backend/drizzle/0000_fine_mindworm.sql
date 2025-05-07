CREATE TYPE "public"."role_enum" AS ENUM('admin', 'regular');--> statement-breakpoint
CREATE TYPE "public"."user_type_enum" AS ENUM('tutor', 'student', 'parent');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"street" varchar(255),
	"city" varchar(100),
	"state_id" integer,
	"postal_code" varchar(20),
	"country_id" integer
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "countries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"name" varchar(100) NOT NULL
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
CREATE TABLE "students" (
	"student_id" integer PRIMARY KEY NOT NULL,
	"school_name" varchar(255),
	"enrollment_date" timestamp DEFAULT now() NOT NULL,
	"graduation_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_types" (
	"education_type_id" serial PRIMARY KEY NOT NULL,
	"education_type_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade_levels" (
	"grade_id" serial PRIMARY KEY NOT NULL,
	"grade_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"subject_id" serial PRIMARY KEY NOT NULL,
	"subject_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_educations" (
	"education_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"major" varchar(100) NOT NULL,
	"education_institution" varchar(255) NOT NULL,
	"graduation_year" integer NOT NULL,
	"education_type_id" integer NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"photo" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "tutor_id_documents" (
	"document_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"photo_front" varchar(255) NOT NULL,
	"photo_back" varchar(255) NOT NULL,
	"country_id" integer NOT NULL,
	"province_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"document_number" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_subjects" (
	"tutor_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"grade_id" integer NOT NULL,
	CONSTRAINT "tutor_subjects_tutor_id_subject_id_grade_id_pk" PRIMARY KEY("tutor_id","subject_id","grade_id")
);
--> statement-breakpoint
CREATE TABLE "tutor_teaching_licenses" (
	"license_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"photo" varchar(255) NOT NULL,
	"issue_body" varchar(255) NOT NULL,
	"issuing_country_id" integer NOT NULL,
	"issuer_province_id" integer NOT NULL,
	"subtype" varchar(50) NOT NULL,
	"certification_name" varchar(100) NOT NULL,
	"subject_area" varchar(100) NOT NULL,
	"grade_level" varchar(50) NOT NULL,
	"issue_date" timestamp NOT NULL,
	"expiration_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_work_experiences" (
	"work_experience_id" serial PRIMARY KEY NOT NULL,
	"tutor_id" integer NOT NULL,
	"work_title" varchar(100) NOT NULL,
	"work_institution" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"tutor_id" integer PRIMARY KEY NOT NULL,
	"bio" text,
	"hourly_rate" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_student_id_users_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_id_documents" ADD CONSTRAINT "tutor_id_documents_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_id_documents" ADD CONSTRAINT "tutor_id_documents_province_id_states_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."states"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" ADD CONSTRAINT "tutor_teaching_licenses_issuing_country_id_countries_id_fk" FOREIGN KEY ("issuing_country_id") REFERENCES "public"."countries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_teaching_licenses" ADD CONSTRAINT "tutor_teaching_licenses_issuer_province_id_states_id_fk" FOREIGN KEY ("issuer_province_id") REFERENCES "public"."states"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_tutor_id_users_user_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "state_code_country_unique_idx" ON "states" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "students_school_idx" ON "students" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "tutor_educations_tutor_idx" ON "tutor_educations" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_educations_type_idx" ON "tutor_educations" USING btree ("education_type_id");--> statement-breakpoint
CREATE INDEX "tutor_id_documents_tutor_idx" ON "tutor_id_documents" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_id_documents_country_idx" ON "tutor_id_documents" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "tutor_id_documents_province_idx" ON "tutor_id_documents" USING btree ("province_id");--> statement-breakpoint
CREATE INDEX "tutor_subjects_tutor_idx" ON "tutor_subjects" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_subjects_subject_idx" ON "tutor_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "tutor_subjects_grade_idx" ON "tutor_subjects" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "tutor_teaching_licenses_tutor_idx" ON "tutor_teaching_licenses" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_teaching_licenses_country_idx" ON "tutor_teaching_licenses" USING btree ("issuing_country_id");--> statement-breakpoint
CREATE INDEX "tutor_teaching_licenses_province_idx" ON "tutor_teaching_licenses" USING btree ("issuer_province_id");--> statement-breakpoint
CREATE INDEX "tutor_work_experiences_tutor_idx" ON "tutor_work_experiences" USING btree ("tutor_id");