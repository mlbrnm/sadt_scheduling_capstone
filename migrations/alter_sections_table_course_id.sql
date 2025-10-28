-- Alter sections table to use course_id instead of course_name
-- This provides better data integrity and matches the frontend implementation

-- Step 1: Rename the column from course_name to course_id
ALTER TABLE public.sections 
RENAME COLUMN course_name TO course_id;

-- Step 2: Change the column type to match the courses table
ALTER TABLE public.sections 
ALTER COLUMN course_id TYPE VARCHAR(50);

-- Step 3: Add foreign key constraint for referential integrity
ALTER TABLE public.sections 
ADD CONSTRAINT fk_sections_course 
FOREIGN KEY (course_id) 
REFERENCES public.courses(course_id) 
ON DELETE CASCADE;

-- Step 4: Add index for faster lookups
CREATE INDEX idx_sections_course ON public.sections(course_id);

-- Add comment
COMMENT ON COLUMN public.sections.course_id IS 'Foreign key reference to courses table course_id';
