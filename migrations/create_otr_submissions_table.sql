CREATE TABLE OTR_Submissions (
    otr_submission_id SERIAL PRIMARY KEY, 
    term VARCHAR(50),
    block_dept VARCHAR(50),
    block VARCHAR(50),
    course_dept VARCHAR(50),
    course VARCHAR(50),
    title VARCHAR(255),
    component VARCHAR(50),
    schedule_type VARCHAR(50),
    status VARCHAR(50),
    delivery VARCHAR(50),
    meet_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    forced_day VARCHAR(20),
    forced_start_time TIME,
    forced_duration INTERVAL,
    pattern VARCHAR(50),
    pattern_day VARCHAR(20),
    pattern_start_time TIME,
    pattern_duration INTERVAL,
    instructor_id INT,
    name VARCHAR(100),
    surname VARCHAR(100),
    room_type_requested VARCHAR(50),
    pavilion_requested VARCHAR(50),
    room_number VARCHAR(50),
    room_type_assigned VARCHAR(50),
    room_description VARCHAR(255),
    component_disabled BOOLEAN,
    section_disabled BOOLEAN,
    course_disabled BOOLEAN,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_file VARCHAR(255)
);
-- Allow any authenticated user to read OTR submissions
CREATE POLICY "Allow authenticated users to read OTR submissions"
ON public.OTR_Submissions
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Allow backend service role to insert OTR submissions
CREATE POLICY "Service role can insert OTR submissions"
ON public.OTR_Submissions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Allow backend service role to update OTR submissions
CREATE POLICY "Service role can update OTR submissions"
ON public.OTR_Submissions
FOR UPDATE
USING (auth.role() = 'service_role');

-- Allow backend service role to delete OTR submissions
CREATE POLICY "Service role can delete OTR submissions"
ON public.OTR_Submissions
FOR DELETE
USING (auth.role() = 'service_role');
