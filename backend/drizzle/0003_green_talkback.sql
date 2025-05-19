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
	"parent_id" integer NOT NULL,
	"subject_id" integer,
	"subject_name" varchar(100) NOT NULL,
	"grade_level_id" integer,
	"grade_level_name" varchar(50),
	"date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"cancelled_by" integer,
	"cancellation_reason" text,
	"notes" text,
	"zoom_link" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
