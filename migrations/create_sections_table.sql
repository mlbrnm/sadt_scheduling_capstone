-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
create table public.sections (
  id uuid not null default gen_random_uuid (),
  schedule_id uuid not null,
  instructor_id real not null,
  course_id character varying(50) not null,
  term character varying(50) not null,
  section_letter character varying(10) not null,
  delivery_mode character varying(50) not null,
  timeslots jsonb null default '[]'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  semester_id character varying(50) null,
  constraint sections_pkey primary key (id),
  constraint fk_sections_course foreign KEY (course_id) references courses (course_id) on delete CASCADE,
  constraint sections_schedule_id_fkey foreign KEY (schedule_id) references schedules (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_sections_course on public.sections using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_sections_schedule on public.sections using btree (schedule_id) TABLESPACE pg_default;

create index IF not exists idx_sections_instructor on public.sections using btree (instructor_id) TABLESPACE pg_default;

create index IF not exists idx_sections_term on public.sections using btree (term) TABLESPACE pg_default;

-- Add index for faster search by schedule
CREATE INDEX idx_sections_schedule ON public.sections(schedule_id);

-- Add index for instructor lookups
CREATE INDEX idx_sections_instructor ON public.sections(instructor_id);

-- Add index for terms
CREATE INDEX idx_sections_term ON public.sections(term);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read sections from their own schedules
CREATE POLICY "Users can view sections from their own schedules" ON public.sections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND (
                schedules.academic_chair_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() AND users.role = 'Admin'
                )
            )
        )
    );

-- Policy to allow users to insert sections for their own schedules
CREATE POLICY "Users can insert sections for their own schedules" ON public.sections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Policy to allow users to update sections in their own schedules
CREATE POLICY "Users can update sections in their own schedules" ON public.sections
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Policy to allow users to delete sections from their own schedules
CREATE POLICY "Users can delete sections from their own schedules" ON public.sections
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = sections.schedule_id 
            AND schedules.academic_chair_id = auth.uid()
        )
    );

-- Allow service role to manage all sections
CREATE POLICY "Service role can manage all sections" ON public.sections
    USING (auth.role() = 'service_role');

-- Add comment to the table
COMMENT ON TABLE public.sections IS 'Table storing individual course sections assigned to instructors within schedules.';
