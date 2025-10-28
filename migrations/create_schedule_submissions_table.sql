CREATE TABLE public.ScheduleSubmissions (
    submission_id SERIAL PRIMARY KEY,
    ac_id INT NOT NULL,  -- FK to Users table (Academic Chair)
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'  -- e.g., Pending, Approved
);
ALTER TABLE public.ScheduleSubmissions ENABLE ROW LEVEL SECURITY;
-- Allow any authenticated user to read schedule submissions
CREATE POLICY "Allow authenticated users to read submissions"
ON public.ScheduleSubmissions
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Allow backend service role to insert schedule submissions
CREATE POLICY "Service role can insert submissions"
ON public.ScheduleSubmissions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Allow backend service role to update schedule submissions
CREATE POLICY "Service role can update submissions"
ON public.ScheduleSubmissions
FOR UPDATE
USING (auth.role() = 'service_role');

-- Allow backend service role to delete schedule submissions
CREATE POLICY "Service role can delete submissions"
ON public.ScheduleSubmissions
FOR DELETE
USING (auth.role() = 'service_role');
