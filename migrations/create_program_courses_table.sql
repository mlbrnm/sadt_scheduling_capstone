--Create the join table
CREATE TABLE public.program_courses (
    program_id TEXT NOT NULL REFERENCES public.programs(program_id) ON DELETE CASCADE,
    course_id VARCHAR NOT NULL REFERENCES public.courses(course_id) ON DELETE RESTRICT,
    PRIMARY KEY (program_id, course_id)
);

--Enable Row-Level Security
ALTER TABLE public.program_courses ENABLE ROW LEVEL SECURITY;

--Allow any authenticated user to read program-course links
CREATE POLICY "Allow authenticated users to read program_courses" 
ON public.program_courses
FOR SELECT
USING (auth.role() IS NOT NULL);

--Allow service role to insert links
CREATE POLICY "Service role can insert program_courses" 
ON public.program_courses
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

--Allow service role to update links
CREATE POLICY "Service role can update program_courses" 
ON public.program_courses
FOR UPDATE
USING (auth.role() = 'service_role');

--Allow service role to delete links
CREATE POLICY "Service role can delete program_courses" 
ON public.program_courses
FOR DELETE
USING (auth.role() = 'service_role');

--Table comment
COMMENT ON TABLE public.program_courses 
IS 'Join table linking programs to their courses. Courses remain even if a program is deleted.';
