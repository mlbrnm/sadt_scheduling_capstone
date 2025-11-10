from flask import jsonify, request
from database import supabase_client
from datetime import datetime

def register_data_routes(app):
    
    @app.route("/api/courses", methods=["GET"])
    def get_courses():
        """
        Fetch all courses from the courses table.
        Returns course data needed for the NewSchedule page.
        """
        try:
            response = supabase_client.table("courses").select("*").execute()
            
            if not response.data:
                return jsonify([]), 200
            
            return jsonify(response.data), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/api/academic-year-summary", methods=["GET"])
    def get_academic_year_summary():
        """
        Fetch academic year scheduling summary showing all programs,
        their scheduling progress, and assigned academic chairs.
        """
        try:
            # Get academic year from query params, default to current year
            academic_year = request.args.get('academic_year', type=int)
            if not academic_year:
                academic_year = datetime.now().year
            
            # Fetch all programs
            programs_response = supabase_client.table("programs").select("*").execute()
            programs = programs_response.data or []
            
            if not programs:
                return jsonify([]), 200
            
            # Fetch all courses
            courses_response = supabase_client.table("courses").select("course_id, program_id").execute()
            courses = courses_response.data or []
            
            # Group courses by program_id
            courses_by_program = {}
            for course in courses:
                program_id = course.get("program_id")
                if program_id:
                    if program_id not in courses_by_program:
                        courses_by_program[program_id] = []
                    courses_by_program[program_id].append(course)
            
            # Fetch all sections to count assignments
            sections_response = supabase_client.table("sections").select("course_id").execute()
            sections = sections_response.data or []
            
            # Count sections by course_id
            sections_by_course = {}
            for section in sections:
                course_id = section.get("course_id")
                if course_id:
                    sections_by_course[course_id] = sections_by_course.get(course_id, 0) + 1
            
            # Build summary for each program
            summary_data = []
            
            for program in programs:
                program_id = program.get("program_id")
                program_courses = courses_by_program.get(program_id, [])
                
                # Calculate total courses
                total_courses = len(program_courses)
                
                # Calculate expected sections (6 per course)
                expected_sections = total_courses * 6
                
                # Calculate actual assigned sections
                actual_sections = 0
                for course in program_courses:
                    course_id = course.get("course_id")
                    actual_sections += sections_by_course.get(course_id, 0)
                
                # Calculate progress percentage
                progress_percentage = 0
                if expected_sections > 0:
                    progress_percentage = round((actual_sections / expected_sections) * 100, 1)
                
                # Parse academic chair UUIDs and fetch names
                academic_chair_field = program.get("academic_chair") or ""
                chair_uuids = [uuid.strip() for uuid in academic_chair_field.split(",") if uuid.strip()]
                
                chair_names = []
                if chair_uuids:
                    # Fetch user names for these UUIDs
                    users_response = supabase_client.table("users") \
                        .select("id, first_name, last_name") \
                        .in_("id", chair_uuids) \
                        .execute()
                    
                    for user in (users_response.data or []):
                        full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                        if full_name:
                            chair_names.append(full_name)
                
                summary_data.append({
                    "program_id": program_id,
                    "acronym": program.get("acronym", ""),
                    "program_name": program.get("program", ""),
                    "total_courses": total_courses,
                    "expected_sections": expected_sections,
                    "actual_sections": actual_sections,
                    "progress_percentage": progress_percentage,
                    "academic_chairs": chair_names,
                    "credential": program.get("credential", ""),
                    "status": program.get("status", "")
                })
            
            # Sort by program acronym
            summary_data.sort(key=lambda x: x.get("acronym", ""))
            
            return jsonify(summary_data), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/api/instructors", methods=["GET"])
    def get_instructors():
        """
        Fetch all instructors from the instructors table.
        Returns instructor data needed for the NewSchedule page.
        """
        try:
            response = supabase_client.table("instructors").select("*").execute()
            
            if not response.data:
                return jsonify([]), 200
            
            return jsonify(response.data), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
