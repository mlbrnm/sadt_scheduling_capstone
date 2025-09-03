-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    program_id SERIAL PRIMARY KEY,
    "group" VARCHAR(255),
    acronym VARCHAR(255),
    program VARCHAR(255),
    academic_chair VARCHAR(255),
    associate_dean VARCHAR(255),
    credential VARCHAR(255),
    courses VARCHAR(255),
    intakes VARCHAR(255),
    duration VARCHAR(255),
    starting_date VARCHAR(255),
    uploaded_at VARCHAR(50),
    uploaded_by VARCHAR(255)
);



-- Enable Row-Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read programs data
CREATE POLICY "Allow authenticated users to read programs" ON public.programs
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert programs data
CREATE POLICY "Service role can insert programs" ON public.programs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update programs data
CREATE POLICY "Service role can update programs" ON public.programs
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete programs data if needed
CREATE POLICY "Service role can delete programs" ON public.programs
    FOR DELETE
    USING (auth.role() = 'service_role');
