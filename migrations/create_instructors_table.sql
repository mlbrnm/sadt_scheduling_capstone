-- Create instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
    instructor_id        INT PRIMARY KEY,
    instructor_lastname  VARCHAR(255),
    instructor_name      VARCHAR(255),
    contract_type        VARCHAR(255),
    instructor_status    VARCHAR(1) CHECK (instructor_status IN ('A', 'I', 'L')),
    start_date           VARCHAR(100),
    end_date             VARCHAR(100),
    time_off             VARCHAR(255),
    id_manager           INT,
    name_manager         VARCHAR(255),
    comments             TEXT,
    id_position          INT,
    uploaded_by          VARCHAR(255),
    uploaded_at          VARCHAR(255));

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
