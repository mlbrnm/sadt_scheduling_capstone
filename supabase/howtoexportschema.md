1. You need to have Supabase CLI installed, which then also requires Docker or similar container system.

2. Link your Supabase CLI environment to the project - `npx supabase link --project-ref meyjrnnoyfxxvsqzvhlu`

3. Run `npx supabase db dump -f schema.sql`