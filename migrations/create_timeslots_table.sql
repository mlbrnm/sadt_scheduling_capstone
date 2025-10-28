CREATE TABLE timeslots (
    timeslot_id INT PRIMARY KEY AUTO_INCREMENT,
    start_date DATE,
    end_date DATE,
    forced_day VARCHAR(20),
    forced_start_time TIME,
    forced_duration INT,      
    pattern_day VARCHAR(20),
    pattern_start_time TIME,
    pattern_duration INT       
);
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read timeslots
CREATE POLICY "Allow authenticated users to read timeslots"
ON public.timeslots
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Allow backend service role to insert timeslots
CREATE POLICY "Service role can insert timeslots"
ON public.timeslots
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Allow backend service role to update timeslots
CREATE POLICY "Service role can update timeslots"
ON public.timeslots
FOR UPDATE
USING (auth.role() = 'service_role');

-- Allow backend service role to delete timeslots
CREATE POLICY "Service role can delete timeslots"
ON public.timeslots
FOR DELETE
USING (auth.role() = 'service_role');