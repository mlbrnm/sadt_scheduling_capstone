-- Create instructor_skills table
CREATE TABLE IF NOT EXISTS public.instructor_skills (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER NOT NULL,
    skill VARCHAR,
    technology VARCHAR,
    qualification_level VARCHAR,
    date_acquired DATE,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.instructor_skills ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read instructor_skills data
CREATE POLICY "Allow authenticated users to read instructor_skills" ON public.instructor_skills
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert instructor_skills data
CREATE POLICY "Service role can insert instructor_skills" ON public.instructor_skills
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update instructor_skills data
CREATE POLICY "Service role can update instructor_skills" ON public.instructor_skills
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete instructor_skills data if needed
CREATE POLICY "Service role can delete instructor_skills" ON public.instructor_skills
    FOR DELETE
    USING (auth.role() = 'service_role');
