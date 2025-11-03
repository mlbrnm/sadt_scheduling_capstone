import os
from dotenv import load_dotenv
from supabase import create_client, Client
from database import create_sections  # import your function
load_dotenv() 

# Initialize Supabase client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch one scheduled course
scheduled_course_response = supabase_client.table("scheduled_courses").select("*").execute()
scheduled_courses = scheduled_course_response.data  # all rows

if scheduled_courses:
    for scheduled_course in scheduled_courses:
        created_sections = create_sections(scheduled_course)
        print("Created sections for", scheduled_course["course_id"], ":", created_sections)
