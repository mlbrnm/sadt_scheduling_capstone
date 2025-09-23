-- Create users table for additional metadata
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    has_logged_in BOOLEAN DEFAULT FALSE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    image TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view all users data
CREATE POLICY "Authenticated users can view all users" ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update their own data
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy to allow inserting user metadata when a new user is created
CREATE POLICY "Allow insert for new users" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Policy to allow service role to manage all users
CREATE POLICY "Service role can manage all users" ON public.users
    USING (auth.role() = 'service_role');

-- Add comment to the table
COMMENT ON TABLE public.users IS 'Table storing user metadata apart from basic auth table.';
