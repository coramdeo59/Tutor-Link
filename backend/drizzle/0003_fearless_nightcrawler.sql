CREATE TYPE "public"."user_type" AS ENUM('tutor', 'student', 'parent');--> statement-breakpoint
CREATE TABLE "Address" (
	"AddressID" serial PRIMARY KEY NOT NULL,
	"AddressLine1" varchar(255) NOT NULL,
	"AddressLine2" varchar(255),
	"CountryID" integer,
	"ProvinceID" integer,
	"City" varchar(100) NOT NULL,
	"Phone" varchar(20) NOT NULL,
	"ZipCode" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Country" (
	"CountryID" serial PRIMARY KEY NOT NULL,
	"CountryName" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Province" (
	"ProvinceID" serial PRIMARY KEY NOT NULL,
	"CountryID" integer,
	"ProvinceName" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TutorDetails" (
	"TutorID" integer PRIMARY KEY NOT NULL,
	"BirthDate" date NOT NULL,
	"Certified" boolean NOT NULL,
	"Major" varchar(100) NOT NULL,
	"EducationInstitution" varchar(255) NOT NULL,
	"GraduationYear" integer NOT NULL,
	"WorkTitle" varchar(100) NOT NULL,
	"WorkInstitution" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"UserID" serial PRIMARY KEY NOT NULL,
	"Email" varchar(255) NOT NULL,
	"Password" varchar(255) NOT NULL,
	"FirstName" varchar(100) NOT NULL,
	"LastName" varchar(100) NOT NULL,
	"UserType" "user_type" NOT NULL,
	"Photo" varchar(255),
	"AddressID" integer NOT NULL,
	"CreatedAt" timestamp DEFAULT now(),
	"Role" varchar(50) DEFAULT 'regular',
	CONSTRAINT "User_Email_unique" UNIQUE("Email")
);
--> statement-breakpoint
CREATE TABLE "StudentParent" (
	"StudentID" integer NOT NULL,
	"ParentID" integer NOT NULL,
	CONSTRAINT "StudentParent_StudentID_ParentID_pk" PRIMARY KEY("StudentID","ParentID")
);
--> statement-breakpoint
CREATE TABLE "StudentSubjectGrade" (
	"StudentID" integer NOT NULL,
	"SubjectID" integer NOT NULL,
	"GradeID" integer NOT NULL,
	CONSTRAINT "StudentSubjectGrade_StudentID_SubjectID_GradeID_pk" PRIMARY KEY("StudentID","SubjectID","GradeID")
);
--> statement-breakpoint
CREATE TABLE "TutorEducation" (
	"EducationID" serial PRIMARY KEY NOT NULL,
	"TutorID" integer NOT NULL,
	"Major" varchar(100) NOT NULL,
	"EducationInstitution" varchar(255) NOT NULL,
	"GraduationYear" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TutorSubjects" (
	"TutorID" integer NOT NULL,
	"SubjectID" integer NOT NULL,
	"GradeID" integer NOT NULL,
	CONSTRAINT "TutorSubjects_TutorID_SubjectID_GradeID_pk" PRIMARY KEY("TutorID","SubjectID","GradeID")
);
--> statement-breakpoint
CREATE TABLE "TutorWorkExperience" (
	"WorkExperienceID" serial PRIMARY KEY NOT NULL,
	"TutorID" integer NOT NULL,
	"WorkTitle" varchar(100) NOT NULL,
	"WorkInstitution" varchar(255) NOT NULL,
	"StartDate" date NOT NULL,
	"EndDate" date
);
--> statement-breakpoint
CREATE TABLE "EducationType" (
	"EducationTypeID" serial PRIMARY KEY NOT NULL,
	"EducationTypeName" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Grade" (
	"GradeID" serial PRIMARY KEY NOT NULL,
	"GradeName" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Subject" (
	"SubjectID" serial PRIMARY KEY NOT NULL,
	"SubjectName" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TutorDegree" (
	"DegreeID" serial PRIMARY KEY NOT NULL,
	"TutorID" integer NOT NULL,
	"Photo" varchar(255) NOT NULL,
	"EducationTypeID" integer NOT NULL,
	"StartDate" date NOT NULL,
	"EndDate" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TutorIDDocument" (
	"DocumentID" serial PRIMARY KEY NOT NULL,
	"TutorID" integer NOT NULL,
	"PhotoFront" varchar(255) NOT NULL,
	"PhotoBack" varchar(255) NOT NULL,
	"CountryID" integer NOT NULL,
	"ProvinceID" integer NOT NULL,
	"Type" varchar(50) NOT NULL,
	"DocumentNumber" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TutorSubjectGrade" (
	"TutorID" integer NOT NULL,
	"SubjectID" integer NOT NULL,
	"GradeID" integer NOT NULL,
	CONSTRAINT "TutorSubjectGrade_TutorID_SubjectID_GradeID_pk" PRIMARY KEY("TutorID","SubjectID","GradeID")
);
--> statement-breakpoint
CREATE TABLE "TutorTeachingLicense" (
	"LicenseID" serial PRIMARY KEY NOT NULL,
	"TutorID" integer NOT NULL,
	"Photo" varchar(255) NOT NULL,
	"IssueBody" varchar(255) NOT NULL,
	"IssuingCountryID" integer NOT NULL,
	"IssuerProvinceID" integer NOT NULL,
	"Subtype" varchar(50) NOT NULL,
	"CertificationName" varchar(100) NOT NULL,
	"SubjectArea" varchar(100) NOT NULL,
	"GradeLevel" varchar(50) NOT NULL,
	"IssueDate" date NOT NULL,
	"ExpirationDate" date NOT NULL
);
--> statement-breakpoint
DROP TABLE "grade_levels" CASCADE;--> statement-breakpoint
DROP TABLE "subjects" CASCADE;--> statement-breakpoint
DROP TABLE "tutor_availability" CASCADE;--> statement-breakpoint
DROP TABLE "tutor_education" CASCADE;--> statement-breakpoint
DROP TABLE "tutor_grade_levels" CASCADE;--> statement-breakpoint
DROP TABLE "tutor_reviews" CASCADE;--> statement-breakpoint
DROP TABLE "tutor_specialties" CASCADE;--> statement-breakpoint
DROP TABLE "tutor_subjects" CASCADE;--> statement-breakpoint
DROP TABLE "tutors" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_CountryID_Country_CountryID_fk" FOREIGN KEY ("CountryID") REFERENCES "public"."Country"("CountryID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_ProvinceID_Province_ProvinceID_fk" FOREIGN KEY ("ProvinceID") REFERENCES "public"."Province"("ProvinceID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Province" ADD CONSTRAINT "Province_CountryID_Country_CountryID_fk" FOREIGN KEY ("CountryID") REFERENCES "public"."Country"("CountryID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorDetails" ADD CONSTRAINT "TutorDetails_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_AddressID_Address_AddressID_fk" FOREIGN KEY ("AddressID") REFERENCES "public"."Address"("AddressID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentParent" ADD CONSTRAINT "StudentParent_StudentID_User_UserID_fk" FOREIGN KEY ("StudentID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentParent" ADD CONSTRAINT "StudentParent_ParentID_User_UserID_fk" FOREIGN KEY ("ParentID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentSubjectGrade" ADD CONSTRAINT "StudentSubjectGrade_StudentID_User_UserID_fk" FOREIGN KEY ("StudentID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentSubjectGrade" ADD CONSTRAINT "StudentSubjectGrade_SubjectID_Subject_SubjectID_fk" FOREIGN KEY ("SubjectID") REFERENCES "public"."Subject"("SubjectID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentSubjectGrade" ADD CONSTRAINT "StudentSubjectGrade_GradeID_Grade_GradeID_fk" FOREIGN KEY ("GradeID") REFERENCES "public"."Grade"("GradeID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorEducation" ADD CONSTRAINT "TutorEducation_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorSubjects" ADD CONSTRAINT "TutorSubjects_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorSubjects" ADD CONSTRAINT "TutorSubjects_SubjectID_Subject_SubjectID_fk" FOREIGN KEY ("SubjectID") REFERENCES "public"."Subject"("SubjectID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorSubjects" ADD CONSTRAINT "TutorSubjects_GradeID_Grade_GradeID_fk" FOREIGN KEY ("GradeID") REFERENCES "public"."Grade"("GradeID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorWorkExperience" ADD CONSTRAINT "TutorWorkExperience_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorDegree" ADD CONSTRAINT "TutorDegree_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorDegree" ADD CONSTRAINT "TutorDegree_EducationTypeID_EducationType_EducationTypeID_fk" FOREIGN KEY ("EducationTypeID") REFERENCES "public"."EducationType"("EducationTypeID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorIDDocument" ADD CONSTRAINT "TutorIDDocument_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorIDDocument" ADD CONSTRAINT "TutorIDDocument_CountryID_Country_CountryID_fk" FOREIGN KEY ("CountryID") REFERENCES "public"."Country"("CountryID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorIDDocument" ADD CONSTRAINT "TutorIDDocument_ProvinceID_Province_ProvinceID_fk" FOREIGN KEY ("ProvinceID") REFERENCES "public"."Province"("ProvinceID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorSubjectGrade" ADD CONSTRAINT "TutorSubjectGrade_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorSubjectGrade" ADD CONSTRAINT "TutorSubjectGrade_SubjectID_Subject_SubjectID_fk" FOREIGN KEY ("SubjectID") REFERENCES "public"."Subject"("SubjectID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorSubjectGrade" ADD CONSTRAINT "TutorSubjectGrade_GradeID_Grade_GradeID_fk" FOREIGN KEY ("GradeID") REFERENCES "public"."Grade"("GradeID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorTeachingLicense" ADD CONSTRAINT "TutorTeachingLicense_TutorID_User_UserID_fk" FOREIGN KEY ("TutorID") REFERENCES "public"."User"("UserID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorTeachingLicense" ADD CONSTRAINT "TutorTeachingLicense_IssuingCountryID_Country_CountryID_fk" FOREIGN KEY ("IssuingCountryID") REFERENCES "public"."Country"("CountryID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TutorTeachingLicense" ADD CONSTRAINT "TutorTeachingLicense_IssuerProvinceID_Province_ProvinceID_fk" FOREIGN KEY ("IssuerProvinceID") REFERENCES "public"."Province"("ProvinceID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."education_level";--> statement-breakpoint
DROP TYPE "public"."verification_status";