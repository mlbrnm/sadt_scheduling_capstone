-- Create instructors_backup table
CREATE TABLE IF NOT EXISTS public.instructors_backup (
    backup_id text PRIMARY KEY,          -- unique ID for this backup (UUID)
    version_id text NOT NULL,            -- version identifier, e.g., "v1", "v2", or timestamp/UUID
    instructor_id real,                  -- original instructor_id from main table
    instructor_lastname varchar(255) NULL,
    instructor_name varchar(255) NULL,
    contract_type varchar(255) NULL,
    instructor_status varchar(1) NULL,
    start_date varchar(100) NULL,
    end_date varchar(100) NULL,
    time_off varchar(255) NULL,
    id_manager real NULL,
    name_manager varchar(255) NULL,
    comments text NULL,
    id_position real NULL,
    uploaded_by varchar(255) NULL,       -- original uploader
    uploaded_at varchar(255) NULL        -- original upload time
);

-- Enable Row-Level Security
ALTER TABLE public.instructors_backup ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read instructors_backup data
CREATE POLICY "Allow authenticated users to read instructors_backup" ON public.instructors_backup
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert instructors_backup data
CREATE POLICY "Service role can insert instructors_backup" ON public.instructors_backup
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update instructors_backup data
CREATE POLICY "Service role can update instructors_backup" ON public.instructors_backup
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete instructors_backup data if needed
CREATE POLICY "Service role can delete instructors_backup" ON public.instructors_backup
    FOR DELETE
    USING (auth.role() = 'service_role');
