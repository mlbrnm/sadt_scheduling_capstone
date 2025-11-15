CREATE TABLE public.section_timeslot_assignment (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id),
    instructor_id real NOT NULL REFERENCES public.instructors(instructor_id),
    timeslot_id UUID NOT NULL REFERENCES public.timeslots(timeslot_id),
    room VARCHAR(50),
    generated_by VARCHAR(255) DEFAULT 'auto',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.section_timeslot_assignment ENABLE ROW LEVEL SECURITY;

-- Policy: Allow any authenticated user to read section_timeslot_assignment
CREATE POLICY "Allow authenticated users to read section_timeslot_assignment"
ON public.section_timeslot_assignment
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Policy: Service role (backend) can insert section_timeslot_assignment
CREATE POLICY "Service role can insert section_timeslot_assignment"
ON public.section_timeslot_assignment
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role (backend) can update section_timeslot_assignment
CREATE POLICY "Service role can update section_timeslot_assignment"
ON public.section_timeslot_assignment
FOR UPDATE
USING (auth.role() = 'service_role');

-- Policy: Service role (backend) can delete section_timeslot_assignment
CREATE POLICY "Service role can delete section_timeslot_assignment"
ON public.section_timeslot_assignment
FOR DELETE
USING (auth.role() = 'service_role');
