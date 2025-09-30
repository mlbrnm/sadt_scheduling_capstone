-- Create instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
    instructor_id real primary key,
    instructor_lastName character varying(255) null,
    instructor_name character varying(255) null,
    contract_type character varying(255) null,
    instructor_status character varying(255) null,
    salaried_begin_date character varying(100) null,
    contract_end character varying(100) null,
    reporting_ac character varying(255) null,
    cch_target_ay2025 real null,
    primary_program character varying (255),
    position_number real null,
    years_as_temp real null,
    highest_education_tbc character varying (255),
    skill_scope character varying (255),
    action_plan character varying (25),
    notes_plan text null,
    full_name character varying (255),
    fte character varying (255),
    time_off character varying(255) null,
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
