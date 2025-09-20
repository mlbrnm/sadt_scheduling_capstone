create table if not exists uploaded_files (
    id uuid primary key default gen_random_uuid(),
    original_name text not null,
    storage_path text not null, 
    version int not null,  
    uploaded_by text not null,
    uploaded_at character varying(50) null
);
