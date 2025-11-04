-- Create table
CREATE TABLE public.schedule_courses (
    scheduled_course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    num_sections INT NOT NULL CHECK (num_sections >= 1),
    delivery_mode VARCHAR(50),
    status VARCHAR(50) DEFAULT 'sections_created',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    term character varying(50) null,
);

-- Enable Row-Level Security
ALTER TABLE public.schedule_courses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read schedule_courses
CREATE POLICY "Allow authenticated users to read schedule_courses"
ON public.schedule_courses
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Policy: Allow service role (backend) to insert schedule_courses
CREATE POLICY "Service role can insert schedule_courses"
ON public.schedule_courses
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow service role (backend) to update schedule_courses
CREATE POLICY "Service role can update schedule_courses"
ON public.schedule_courses
FOR UPDATE
USING (auth.role() = 'service_role');

-- Policy: Allow service role (backend) to delete schedule_courses
CREATE POLICY "Service role can delete schedule_courses"
ON public.schedule_courses
FOR DELETE
USING (auth.role() = 'service_role');
