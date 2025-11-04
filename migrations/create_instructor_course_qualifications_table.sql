CREATE TABLE public.instructor_course_qualifications (
    instructor_id real NOT NULL REFERENCES public.instructors(instructor_id),
    course_id varchar(50) NOT NULL REFERENCES public.courses(course_id),
    PRIMARY KEY (instructor_id, course_id)
) TABLESPACE pg_default;

ALTER TABLE public.instructor_course_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read instructor_course_qualifications"
ON public.instructor_course_qualifications
FOR SELECT
USING (auth.role() IS NOT NULL);

CREATE POLICY "Service role can insert instructor_course_qualifications"
ON public.instructor_course_qualifications
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update instructor_course_qualifications"
ON public.instructor_course_qualifications
FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete instructor_course_qualifications"
ON public.instructor_course_qualifications
FOR DELETE
USING (auth.role() = 'service_role');
