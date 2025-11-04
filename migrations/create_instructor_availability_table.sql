CREATE TABLE public.instructor_availability (
  instructor_id real REFERENCES public.instructors(instructor_id),
  timeslot_id UUID REFERENCES public.timeslots(timeslot_id),
  is_available BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (instructor_id, timeslot_id)
);

-- Enable Row-Level Security
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Allow any authenticated user to read instructor_availability
CREATE POLICY "Allow authenticated users to read instructor_availability"
ON public.instructor_availability
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Policy: Service role (backend) can insert instructor_availability
CREATE POLICY "Service role can insert instructor_availability"
ON public.instructor_availability
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role (backend) can update instructor_availability
CREATE POLICY "Service role can update instructor_availability"
ON public.instructor_availability
FOR UPDATE
USING (auth.role() = 'service_role');

-- Policy: Service role (backend) can delete instructor_availability
CREATE POLICY "Service role can delete instructor_availability"
ON public.instructor_availability
FOR DELETE
USING (auth.role() = 'service_role');
