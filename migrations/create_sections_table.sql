-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    instructor_id REAL NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    term VARCHAR(50) NOT NULL,
    section_letter VARCHAR(10) NOT NULL,
    delivery_mode VARCHAR(50) NOT NULL,
    timeslots TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster search by schedule
CREATE INDEX idx_sections_schedule ON public.sections(schedule_id);

-- Add index for instructor lookups
CREATE INDEX idx_sections_instructor ON public.sections(instructor_id);

-- Add index for term-based queries
CREATE INDEX idx_sections_term ON public.sections(term);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read sections from their own schedules
CREATE POLICY "Users can view sections from their own schedules" ON public.sections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND (
                schedules.academic_chair_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() AND users.role = 'Admin'
                )
            )
        )
    );

-- Policy to allow users to insert sections for their own schedules
CREATE POLICY "Users can insert sections for their own schedules" ON public.sections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Policy to allow users to update sections in their own schedules
CREATE POLICY "Users can update sections in their own schedules" ON public.sections
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Policy to allow users to delete sections from their own schedules
CREATE POLICY "Users can delete sections from their own schedules" ON public.sections
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Allow service role to manage all sections
CREATE POLICY "Service role can manage all sections" ON public.sections
    USING (auth.role() = 'service_role');

-- Add comment to the table
COMMENT ON TABLE public.sections IS 'Table storing individual course sections assigned to instructors within schedules.';
