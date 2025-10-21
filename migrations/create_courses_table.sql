-- Create Course table with audit columns
CREATE TABLE IF NOT EXISTS courses (
    course_id character varying(50) primary key,
    course_code character varying(50) not null,
    course_name character varying(255) not null,
    program_major character varying(255) null,
    "group" character varying(50) null,
    credits numeric(4, 2) null,
    contact_hours integer null,
    class_hrs integer null,
    online_hrs integer null,
    program_type character varying(100) null,
    credential character varying(100) null,
    req_elec character varying(50) null,
    delivery_method character varying(100) null,
    ac_name_loading character varying(255) null,
    school character varying(255) null,
    exam_otr character varying(50) null,
    semester character varying(10) null,
    fall character varying(1) null,
    winter character varying(1) null,
    spring_summer character varying(1) null,
    notes text null,
    uploaded_by character varying(255) null,
    uploaded_at character varying(50) null
);

-- Enable Row-Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read courses
CREATE POLICY "Allow authenticated users to read courses" 
ON public.courses
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert courses
CREATE POLICY "Service role can insert courses" 
ON public.courses
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update courses
CREATE POLICY "Service role can update courses" 
ON public.courses
FOR UPDATE
USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete courses if needed
CREATE POLICY "Service role can delete courses" 
ON public.courses
FOR DELETE
USING (auth.role() = 'service_role');


