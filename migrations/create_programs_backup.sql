-- Create programs backup table
CREATE TABLE IF NOT EXISTS programs_backup (
    backup_id text PRIMARY KEY,        -- unique ID for this backup row (UUID)
    version_id text NOT NULL,          -- version identifier (e.g., timestamp or UUID)
    program_id text,                   -- original program_id from main table
    "group" varchar(255) NULL,
    acronym varchar(255) NULL,
    program varchar(255) NULL,
    academic_chair varchar(255) NULL,
    associate_dean varchar(255) NULL,
    credential varchar(255) NULL,
    courses varchar(255) NULL,
    intakes varchar(255) NULL,
    duration varchar(255) NULL,
    starting_date varchar(255) NULL,
    uploaded_at varchar(50) NULL,
    uploaded_by varchar(255) NULL
);

-- Enable Row-Level Security
ALTER TABLE public.programs_backup ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read programs backup data
CREATE POLICY "Allow authenticated users to read programs_backup" ON public.programs_backup
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert program
