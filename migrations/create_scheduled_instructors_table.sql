create table public.scheduled_instructors (
    id uuid not null default gen_random_uuid(),
    schedule_id uuid not null,
    section_id uuid not null, 
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint scheduled_instructors_pkey primary key (id),
    constraint fk_schedule foreign key (schedule_id) references schedules(id) on delete cascade,
    constraint fk_section foreign key (section_id) references sections(id) on delete cascade,
    constraint fk_instructor foreign key (instructor_id) references instructors(instructor_id) on delete cascade
);
