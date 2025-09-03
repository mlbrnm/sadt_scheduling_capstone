-- Create instructor_course_history table
CREATE TABLE IF NOT EXISTS public.instructor_course_history (
    instructor_id INTEGER NOT NULL,
    course_catalog_id INTEGER NOT NULL,
    last_taught_term_id INTEGER,
    preference_level VARCHAR,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (instructor_id, course_catalog_id)
);

-- Enable Row-Level Security
ALTER TABLE public.instructor_course_history ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read instructor_course_history data
CREATE POLICY "Allow authenticated users to read instructor_course_history" ON public.instructor_course_history
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert instructor_course_history data
CREATE POLICY "Service role can insert instructor_course_history" ON public.instructor_course_history
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update instructor_course_history data
CREATE POLICY "Service role can update instructor_course_history" ON public.instructor_course_history
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete instructor_course_history data if needed
CREATE POLICY "Service role can delete instructor_course_history" ON public.instructor_course_history
    FOR DELETE
    USING (auth.role() = 'service_role');
