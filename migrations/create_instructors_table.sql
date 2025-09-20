-- Create instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
    instructor_id real primary key,
    instructor_lastname character varying(255) null,
    instructor_name character varying(255) null,
    contract_type character varying(255) null,
    instructor_status character varying(1) null,
    start_date character varying(100) null,
    end_date character varying(100) null,
    time_off character varying(255) null,
    id_manager real null,
    name_manager character varying(255) null,
    comments text null,
    id_position real null,
    uploaded_by character varying(255) null,
    uploaded_at character varying(255) null
);

-- Enable Row-Level Security
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read instructor data
CREATE POLICY "Allow authenticated users to read instructors" ON public.instructors
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert instructor data
CREATE POLICY "Service role can insert instructors" ON public.instructors
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update instructor data
CREATE POLICY "Service role can update instructors" ON public.instructors
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete instructor data if needed
CREATE POLICY "Service role can delete instructors" ON public.instructors
    FOR DELETE
    USING (auth.role() = 'service_role');
