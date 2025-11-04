CREATE TABLE public.timeslots (
  timeslot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week VARCHAR(10) NOT NULL,   -- e.g. Monday, Tuesday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
) TABLESPACE pg_default;

--Enable Row-Level Security
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;

--Policy: Allow any authenticated user to read timeslots
CREATE POLICY "Allow authenticated users to read timeslots" 
ON public.timeslots
FOR SELECT
USING (auth.role() IS NOT NULL);

--Policy: Service role (backend) can insert timeslots
CREATE POLICY "Service role can insert timeslots" 
ON public.timeslots
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

--Policy: Service role (backend) can update timeslots
CREATE POLICY "Service role can update timeslots" 
ON public.timeslots
FOR UPDATE
USING (auth.role() = 'service_role');

--Policy: Service role (backend) can delete timeslots if needed
CREATE POLICY "Service role can delete timeslots" 
ON public.timeslots
FOR DELETE
USING (auth.role() = 'service_role');
