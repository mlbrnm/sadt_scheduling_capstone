-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    program_id text primary key,
    "group" character varying(255) null,
    acronym character varying(255) null,
    program character varying(255) null,
    academic_chair character varying(255) null,
    associate_dean character varying(255) null,
    credential character varying(255) null,
    courses character varying(255) null,
    intakes character varying(255) null,
    duration character varying(255) null,
    starting_date character varying(255) null,
    delivery character varying(255) null,
    status character varying(255) null,
    uploaded_at character varying(50) null,
    uploaded_by character varying(255) null
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
