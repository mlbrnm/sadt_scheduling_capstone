-- Add program_id column to courses table to link courses to programs
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS program_id text NULL;

-- Add foreign key constraint
ALTER TABLE public.courses
ADD CONSTRAINT fk_courses_program_id 
FOREIGN KEY (program_id) 
REFERENCES public.programs(program_id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_program_id 
ON public.courses(program_id);
