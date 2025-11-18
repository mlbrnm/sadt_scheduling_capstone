-- Create schedule_submission_log table to track submission history, approvals, rejections, and recalls
CREATE TABLE IF NOT EXISTS public.schedule_submission_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'submitted', 'approved', 'rejected', 'recalled'
    admin_user_id UUID REFERENCES public.users(id), -- who approved/rejected (null for AC submissions)
    comment TEXT, -- rejection reason or other notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by schedule
CREATE INDEX idx_schedule_submission_log_schedule_id ON public.schedule_submission_log(schedule_id);

-- Add index for created_at for chronological ordering
CREATE INDEX idx_schedule_submission_log_created_at ON public.schedule_submission_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.schedule_submission_log ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to view all logs
CREATE POLICY "Admins can view all submission logs" ON public.schedule_submission_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Policy to allow academic chairs to view logs for their own schedules
CREATE POLICY "Academic chairs can view their own submission logs" ON public.schedule_submission_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = schedule_submission_log.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Policy to allow admins to insert logs
CREATE POLICY "Admins can insert submission logs" ON public.schedule_submission_log
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Policy to allow academic chairs to insert submission logs for their schedules
CREATE POLICY "Academic chairs can insert logs for their schedules" ON public.schedule_submission_log
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = schedule_submission_log.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Allow service role to manage all logs
CREATE POLICY "Service role can manage all logs" ON public.schedule_submission_log
    USING (auth.role() = 'service_role');

-- Add comment to the table
COMMENT ON TABLE public.schedule_submission_log IS 'Tracks submission history, approvals, rejections, and recalls for schedules.';
