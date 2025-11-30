

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_user_by_email"("user_email" "text") RETURNS TABLE("id" "uuid", "email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id::UUID,      -- Explicitly cast id to UUID
    u.email::TEXT    -- Explicitly cast email to TEXT
  FROM auth.users u
  WHERE u.email = user_email;
END;
$$;


ALTER FUNCTION "public"."get_user_by_email"("user_email" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "course_id" character varying(50) NOT NULL,
    "course_code" character varying(50) NOT NULL,
    "course_name" character varying(255) NOT NULL,
    "program_major" character varying(255),
    "group" character varying(50),
    "credits" numeric(4,2),
    "contact_hours" integer,
    "program_type" character varying(100),
    "credential" character varying(100),
    "req_elec" character varying(50),
    "delivery_method" character varying(100),
    "ac_name_loading" character varying(255),
    "school" character varying(255),
    "exam_otr" character varying(50),
    "semester" character varying(10),
    "fall" character varying(1),
    "winter" character varying(1),
    "spring_summer" character varying(1),
    "notes" "text",
    "uploaded_by" character varying(255),
    "uploaded_at" character varying(50),
    "class_hrs" bigint,
    "online_hrs" bigint,
    "program_id" "text",
    "has_lab" boolean DEFAULT false,
    "sessions_per_week" integer DEFAULT 2,
    "lecture_duration" integer,
    "lab_duration" integer,
    "weekly_hours_required" integer
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instructor_availability" (
    "instructor_id" real NOT NULL,
    "timeslot_id" "uuid" NOT NULL,
    "is_available" boolean DEFAULT true
);


ALTER TABLE "public"."instructor_availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instructor_course_qualifications" (
    "instructor_id" real NOT NULL,
    "course_id" character varying(50) NOT NULL
);


ALTER TABLE "public"."instructor_course_qualifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instructors" (
    "instructor_id" real NOT NULL,
    "instructor_lastname" character varying(255),
    "instructor_name" character varying(255),
    "contract_type" character varying(255),
    "instructor_status" character varying(255),
    "salaried_begin_date" character varying(100),
    "contract_end" character varying(100),
    "reporting_ac" character varying(255),
    "cch_target_ay2025" real,
    "primary_program" character varying(255),
    "position_number" real,
    "years_as_temp" real,
    "highest_education_tbc" character varying(255),
    "skill_scope" character varying(255),
    "action_plan" character varying(25),
    "notes_plan" "text",
    "full_name" character varying(255),
    "fte" character varying(255),
    "time_off" character varying(255),
    "uploaded_by" character varying(255),
    "uploaded_at" character varying(255)
);


ALTER TABLE "public"."instructors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."programs" (
    "program_id" "text" NOT NULL,
    "group" character varying(255),
    "acronym" character varying(255),
    "program" character varying(255),
    "academic_chair" character varying(255),
    "associate_dean" character varying(255),
    "credential" character varying(255),
    "courses" character varying(255),
    "intakes" character varying(255),
    "duration" character varying(255),
    "starting_date" character varying(255),
    "uploaded_at" character varying(50),
    "uploaded_by" character varying(255),
    "delivery" "text",
    "status" "text",
    "academic_chair_ids" "uuid"[]
);


ALTER TABLE "public"."programs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."programs_program_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."programs_program_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."programs_program_id_seq" OWNED BY "public"."programs"."program_id";



CREATE TABLE IF NOT EXISTS "public"."schedule_submission_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "admin_user_id" "uuid",
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."schedule_submission_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedule_submission_log" IS 'Tracks submission history, approvals, rejections, and recalls for schedules.';



CREATE TABLE IF NOT EXISTS "public"."scheduled_courses" (
    "scheduled_course_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "course_id" character varying(50) NOT NULL,
    "num_sections" integer NOT NULL,
    "delivery_mode" character varying(50),
    "status" character varying(50) DEFAULT 'sections_created'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "term" character varying(50),
    CONSTRAINT "schedule_courses_num_sections_check" CHECK (("num_sections" >= 1))
);


ALTER TABLE "public"."scheduled_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "academic_year" integer NOT NULL,
    "academic_chair_id" "uuid" NOT NULL,
    "completion_status" "text" DEFAULT 'not_started'::"text",
    "submission_status" "text" DEFAULT 'not_submitted'::"text",
    "approval_status" "text" DEFAULT 'pending'::"text",
    "time_slots_attached" "text" DEFAULT 'not_attached'::"text",
    "associated_programs" "text",
    "associated_courses" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "terms" "text"[]
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedules" IS 'Table storing schedule information for academic chairs by academic year.';



CREATE TABLE IF NOT EXISTS "public"."schedulesmodified" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_id" "text" NOT NULL,
    "academic_year" integer NOT NULL,
    "semester" character varying NOT NULL,
    "academicchairid" "uuid" NOT NULL,
    "courses_attached" boolean DEFAULT false NOT NULL,
    "instructors_assigned" boolean DEFAULT false NOT NULL,
    "timeslots_assigned" boolean DEFAULT false NOT NULL,
    "submitted_to_ac" boolean DEFAULT false NOT NULL,
    "responsibility" character varying DEFAULT 'Admin'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."schedulesmodified" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedulesmodified" IS 'Table storing schedule metadata and workflow flags: program, year, semester, academic chair, courses/instructors/timeslots assignment status, and responsibility for next action.';



CREATE TABLE IF NOT EXISTS "public"."schedulesubmissions" (
    "submission_id" integer NOT NULL,
    "ac_id" integer NOT NULL,
    "submitted_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "status" character varying(50) DEFAULT 'Pending'::character varying
);


ALTER TABLE "public"."schedulesubmissions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."schedulesubmissions_submission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."schedulesubmissions_submission_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."schedulesubmissions_submission_id_seq" OWNED BY "public"."schedulesubmissions"."submission_id";



CREATE TABLE IF NOT EXISTS "public"."section_timeslot_assignment" (
    "assignment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_id" "uuid" NOT NULL,
    "instructor_id" real NOT NULL,
    "timeslot_id" "uuid" NOT NULL,
    "room" character varying(50),
    "generated_by" character varying(255) DEFAULT 'auto'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."section_timeslot_assignment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "course_id" character varying(50) NOT NULL,
    "term" character varying(50),
    "section_letter" character varying(10) NOT NULL,
    "delivery_mode" character varying(50) NOT NULL,
    "timeslots" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "semester_id" character varying(50),
    "instructor_id" real,
    "weekly_hours_required" numeric(4,2),
    "sessions_per_week" integer
);


ALTER TABLE "public"."sections" OWNER TO "postgres";


COMMENT ON TABLE "public"."sections" IS 'Table storing individual course sections assigned to instructors within schedules.';



COMMENT ON COLUMN "public"."sections"."course_id" IS 'Foreign key reference to courses table course_id';



CREATE TABLE IF NOT EXISTS "public"."timeslots" (
    "timeslot_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_of_week" character varying(10) NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_available" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."timeslots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."uploaded_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "original_name" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "version" integer NOT NULL,
    "uploaded_by" "text" NOT NULL,
    "uploaded_at" character varying(50),
    "table_name" "text",
    "column_order" "text"[]
);


ALTER TABLE "public"."uploaded_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "has_logged_in" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "first_name" "text",
    "last_name" "text",
    "role" "text",
    "image" "text",
    "email" "text",
    "is_deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Table storing user metadata apart from basic auth table.';



ALTER TABLE ONLY "public"."schedulesubmissions" ALTER COLUMN "submission_id" SET DEFAULT "nextval"('"public"."schedulesubmissions_submission_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id");



ALTER TABLE ONLY "public"."instructor_availability"
    ADD CONSTRAINT "instructor_availability_pkey" PRIMARY KEY ("instructor_id", "timeslot_id");



ALTER TABLE ONLY "public"."instructor_course_qualifications"
    ADD CONSTRAINT "instructor_course_qualifications_pkey" PRIMARY KEY ("instructor_id", "course_id");



ALTER TABLE ONLY "public"."instructors"
    ADD CONSTRAINT "instructors_pkey" PRIMARY KEY ("instructor_id");



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_pkey" PRIMARY KEY ("program_id");



ALTER TABLE ONLY "public"."schedule_submission_log"
    ADD CONSTRAINT "schedule_submission_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduled_courses"
    ADD CONSTRAINT "scheduled_courses_pkey" PRIMARY KEY ("scheduled_course_id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedulesmodified"
    ADD CONSTRAINT "schedulesmodified_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedulesubmissions"
    ADD CONSTRAINT "schedulesubmissions_pkey" PRIMARY KEY ("submission_id");



ALTER TABLE ONLY "public"."section_timeslot_assignment"
    ADD CONSTRAINT "section_timeslot_assignment_pkey" PRIMARY KEY ("assignment_id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timeslots"
    ADD CONSTRAINT "timeslots_pkey" PRIMARY KEY ("timeslot_id");



ALTER TABLE ONLY "public"."uploaded_files"
    ADD CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_courses_program_id" ON "public"."courses" USING "btree" ("program_id");



CREATE INDEX "idx_schedule_submission_log_created_at" ON "public"."schedule_submission_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_schedule_submission_log_schedule_id" ON "public"."schedule_submission_log" USING "btree" ("schedule_id");



CREATE INDEX "idx_schedules_academic_chair" ON "public"."schedules" USING "btree" ("academic_chair_id");



CREATE INDEX "idx_schedules_academic_year" ON "public"."schedules" USING "btree" ("academic_year");



CREATE INDEX "idx_schedulesmodified_academic_year" ON "public"."schedulesmodified" USING "btree" ("academic_year");



CREATE INDEX "idx_schedulesmodified_academicchairid" ON "public"."schedulesmodified" USING "btree" ("academicchairid");



CREATE INDEX "idx_schedulesmodified_program_id" ON "public"."schedulesmodified" USING "btree" ("program_id");



CREATE INDEX "idx_sections_course" ON "public"."sections" USING "btree" ("course_id");



CREATE INDEX "idx_sections_schedule" ON "public"."sections" USING "btree" ("schedule_id");



CREATE INDEX "idx_sections_term" ON "public"."sections" USING "btree" ("term");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "fk_courses_program_id" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("program_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."schedulesmodified"
    ADD CONSTRAINT "fk_program" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("program_id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "fk_sections_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "fk_sections_instructor" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("instructor_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."instructor_availability"
    ADD CONSTRAINT "instructor_availability_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("instructor_id");



ALTER TABLE ONLY "public"."instructor_availability"
    ADD CONSTRAINT "instructor_availability_timeslot_id_fkey" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslots"("timeslot_id");



ALTER TABLE ONLY "public"."instructor_course_qualifications"
    ADD CONSTRAINT "instructor_course_qualifications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id");



ALTER TABLE ONLY "public"."instructor_course_qualifications"
    ADD CONSTRAINT "instructor_course_qualifications_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("instructor_id");



ALTER TABLE ONLY "public"."scheduled_courses"
    ADD CONSTRAINT "schedule_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scheduled_courses"
    ADD CONSTRAINT "schedule_courses_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_submission_log"
    ADD CONSTRAINT "schedule_submission_log_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."schedule_submission_log"
    ADD CONSTRAINT "schedule_submission_log_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_academic_chair_id_fkey" FOREIGN KEY ("academic_chair_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."section_timeslot_assignment"
    ADD CONSTRAINT "section_timeslot_assignment_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("instructor_id");



ALTER TABLE ONLY "public"."section_timeslot_assignment"
    ADD CONSTRAINT "section_timeslot_assignment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



ALTER TABLE ONLY "public"."section_timeslot_assignment"
    ADD CONSTRAINT "section_timeslot_assignment_timeslot_id_fkey" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslots"("timeslot_id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Academic chairs can insert logs for their schedules" ON "public"."schedule_submission_log" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE (("schedules"."id" = "schedule_submission_log"."schedule_id") AND ("schedules"."academic_chair_id" = "auth"."uid"())))));



CREATE POLICY "Academic chairs can insert their own schedules" ON "public"."schedules" FOR INSERT WITH CHECK (("auth"."uid"() = "academic_chair_id"));



CREATE POLICY "Academic chairs can update their own schedules" ON "public"."schedules" FOR UPDATE USING (("auth"."uid"() = "academic_chair_id"));



CREATE POLICY "Academic chairs can view their own schedules" ON "public"."schedules" FOR SELECT USING ((("auth"."uid"() = "academic_chair_id") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'Admin'::"text"))))));



CREATE POLICY "Academic chairs can view their own submission logs" ON "public"."schedule_submission_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE (("schedules"."id" = "schedule_submission_log"."schedule_id") AND ("schedules"."academic_chair_id" = "auth"."uid"())))));



CREATE POLICY "Admins can edit" ON "public"."users" FOR UPDATE USING (true) WITH CHECK ((( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())) = 'Admin'::"text"));



CREATE POLICY "Admins can edit Programs" ON "public"."programs" FOR UPDATE USING (true) WITH CHECK ((( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())) = 'Admin'::"text"));



CREATE POLICY "Admins can insert submission logs" ON "public"."schedule_submission_log" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'Admin'::"text")))));



CREATE POLICY "Admins can view all submission logs" ON "public"."schedule_submission_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'Admin'::"text")))));



CREATE POLICY "Allow authenticated users to read courses" ON "public"."courses" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read instructor_availability" ON "public"."instructor_availability" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read instructor_course_qualificati" ON "public"."instructor_course_qualifications" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read instructors" ON "public"."instructors" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read programs" ON "public"."programs" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read schedule_courses" ON "public"."scheduled_courses" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read section_timeslot_assignment" ON "public"."section_timeslot_assignment" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read submissions" ON "public"."schedulesubmissions" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to read timeslots" ON "public"."timeslots" FOR SELECT USING (("auth"."role"() IS NOT NULL));



CREATE POLICY "Allow insert for new users" ON "public"."users" FOR INSERT WITH CHECK ((("auth"."uid"() = "id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Anyone can read emails" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Authenticated Users Can Read All" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Service role can delete courses" ON "public"."courses" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete instructor_availability" ON "public"."instructor_availability" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete instructor_course_qualifications" ON "public"."instructor_course_qualifications" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete instructors" ON "public"."instructors" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete programs" ON "public"."programs" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete schedule_courses" ON "public"."scheduled_courses" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete section_timeslot_assignment" ON "public"."section_timeslot_assignment" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete submissions" ON "public"."schedulesubmissions" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can delete timeslots" ON "public"."timeslots" FOR DELETE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert courses" ON "public"."courses" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert instructor_availability" ON "public"."instructor_availability" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert instructor_course_qualifications" ON "public"."instructor_course_qualifications" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert instructors" ON "public"."instructors" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert programs" ON "public"."programs" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert schedule_courses" ON "public"."scheduled_courses" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert section_timeslot_assignment" ON "public"."section_timeslot_assignment" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert submissions" ON "public"."schedulesubmissions" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can insert timeslots" ON "public"."timeslots" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all logs" ON "public"."schedule_submission_log" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all schedules" ON "public"."schedules" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all sections" ON "public"."sections" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all users" ON "public"."users" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update courses" ON "public"."courses" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update instructor_availability" ON "public"."instructor_availability" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update instructor_course_qualifications" ON "public"."instructor_course_qualifications" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update instructors" ON "public"."instructors" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update programs" ON "public"."programs" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update schedule_courses" ON "public"."scheduled_courses" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update section_timeslot_assignment" ON "public"."section_timeslot_assignment" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update submissions" ON "public"."schedulesubmissions" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can update timeslots" ON "public"."timeslots" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can delete sections from their own schedules" ON "public"."sections" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE (("schedules"."id" = "sections"."schedule_id") AND ("schedules"."academic_chair_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert sections for their own schedules" ON "public"."sections" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE (("schedules"."id" = "sections"."schedule_id") AND ("schedules"."academic_chair_id" = "auth"."uid"())))));



CREATE POLICY "Users can update sections in their own schedules" ON "public"."sections" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE (("schedules"."id" = "sections"."schedule_id") AND ("schedules"."academic_chair_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view sections from their own schedules" ON "public"."sections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."schedules"
  WHERE (("schedules"."id" = "sections"."schedule_id") AND (("schedules"."academic_chair_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."users"
          WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'Admin'::"text")))))))));



CREATE POLICY "Users can view their own data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "academic_chairs_can_insert_their_own_schedules" ON "public"."schedulesmodified" FOR INSERT WITH CHECK (("auth"."uid"() = "academicchairid"));



CREATE POLICY "academic_chairs_can_update_their_own_schedules" ON "public"."schedulesmodified" FOR UPDATE USING (("auth"."uid"() = "academicchairid"));



CREATE POLICY "academic_chairs_can_view_their_own_schedules" ON "public"."schedulesmodified" FOR SELECT USING ((("auth"."uid"() = "academicchairid") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'Admin'::"text"))))));



ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instructor_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instructor_course_qualifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instructors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_submission_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scheduled_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedulesmodified" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedulesubmissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."section_timeslot_assignment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_can_manage_all_schedules" ON "public"."schedulesmodified" USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."timeslots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."uploaded_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_user_by_email"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_by_email"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_by_email"("user_email" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."instructor_availability" TO "anon";
GRANT ALL ON TABLE "public"."instructor_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."instructor_availability" TO "service_role";



GRANT ALL ON TABLE "public"."instructor_course_qualifications" TO "anon";
GRANT ALL ON TABLE "public"."instructor_course_qualifications" TO "authenticated";
GRANT ALL ON TABLE "public"."instructor_course_qualifications" TO "service_role";



GRANT ALL ON TABLE "public"."instructors" TO "anon";
GRANT ALL ON TABLE "public"."instructors" TO "authenticated";
GRANT ALL ON TABLE "public"."instructors" TO "service_role";



GRANT ALL ON TABLE "public"."programs" TO "anon";
GRANT ALL ON TABLE "public"."programs" TO "authenticated";
GRANT ALL ON TABLE "public"."programs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."programs_program_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."programs_program_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."programs_program_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_submission_log" TO "anon";
GRANT ALL ON TABLE "public"."schedule_submission_log" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_submission_log" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_courses" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_courses" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."schedulesmodified" TO "anon";
GRANT ALL ON TABLE "public"."schedulesmodified" TO "authenticated";
GRANT ALL ON TABLE "public"."schedulesmodified" TO "service_role";



GRANT ALL ON TABLE "public"."schedulesubmissions" TO "anon";
GRANT ALL ON TABLE "public"."schedulesubmissions" TO "authenticated";
GRANT ALL ON TABLE "public"."schedulesubmissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."schedulesubmissions_submission_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."schedulesubmissions_submission_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."schedulesubmissions_submission_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."section_timeslot_assignment" TO "anon";
GRANT ALL ON TABLE "public"."section_timeslot_assignment" TO "authenticated";
GRANT ALL ON TABLE "public"."section_timeslot_assignment" TO "service_role";



GRANT ALL ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT ALL ON TABLE "public"."sections" TO "service_role";



GRANT ALL ON TABLE "public"."timeslots" TO "anon";
GRANT ALL ON TABLE "public"."timeslots" TO "authenticated";
GRANT ALL ON TABLE "public"."timeslots" TO "service_role";



GRANT ALL ON TABLE "public"."uploaded_files" TO "anon";
GRANT ALL ON TABLE "public"."uploaded_files" TO "authenticated";
GRANT ALL ON TABLE "public"."uploaded_files" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
