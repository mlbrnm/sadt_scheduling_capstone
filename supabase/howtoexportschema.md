1. You need to have Supabase CLI installed, which then also requires Docker or similar container system.

2. Link your Supabase CLI environment to the project - `npx supabase link --project-ref meyjrnnoyfxxvsqzvhlu`

3. Run `npx supabase db dump -f schema.sql`


## Other things you need to do:

1. Change all the .env variables (obviously)
2. Copy over the edge function and ensure it has the same name (check_email_existence)
3. Create the storage bucket "uploads".