-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year INTEGER NOT NULL,
    academic_chair_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    completion_status TEXT DEFAULT 'not_started',
    submission_status TEXT DEFAULT 'not_submitted',
    approval_status TEXT DEFAULT 'pending',
    time_slots_attached TEXT DEFAULT 'not_attached',
    associated_programs TEXT,
    associated_courses TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster search by academic chair
CREATE INDEX idx_schedules_academic_chair ON public.schedules(academic_chair_id);

-- Add index for academic year
CREATE INDEX idx_schedules_academic_year ON public.schedules(academic_year);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own schedules
CREATE POLICY "Academic chairs can view their own schedules" ON public.schedules
    FOR SELECT
    USING (
        auth.uid() = academic_chair_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Allow academic chairs to insert their own schedules
CREATE POLICY "Academic chairs can insert their own schedules" ON public.schedules
    FOR INSERT
    WITH CHECK (auth.uid() = academic_chair_id);

-- Allow academic chairs to update their own schedules
CREATE POLICY "Academic chairs can update their own schedules" ON public.schedules
    FOR UPDATE
    USING (auth.uid() = academic_chair_id);

-- Allow service role to manage all schedules
CREATE POLICY "Service role can manage all schedules" ON public.schedules
    USING (auth.role() = 'service_role');

-- Add comment to the table
COMMENT ON TABLE public.schedules IS 'Table storing schedule information for academic chairs by academic year.';
