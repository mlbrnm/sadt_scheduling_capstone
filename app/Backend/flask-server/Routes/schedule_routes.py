from flask import jsonify, request
from database import supabase_client

def register_schedule_routes(app):
    
    @app.route("/admin/schedules/generate", methods=["POST"])
    def generate_schedules():
        """
        Generate blank schedules for all Academic Chairs for a given academic year.
        Send JSON with "academic_year".
        """
        try:
            # Get academic year from request
            data = request.get_json()
            academic_year = data.get("academic_year")
            
            if not academic_year:
                return jsonify({"error": "academic_year is required"}), 400
            
            # Fetch all users with role "AC"
            ac_response = supabase_client.table("users").select("id, first_name, last_name").eq("role", "AC").eq("is_deleted", False).execute()
            
            academic_chairs = ac_response.data
            
            if not academic_chairs:
                return jsonify({"message": "No Academic Chairs found"}), 200
            
            created_schedules = []
            skipped_schedules = []
            
            for ac in academic_chairs:
                ac_id = ac["id"]
                ac_name = f"{ac['first_name']} {ac['last_name']}"
                
                # Check if schedule already exists for this AC and year
                existing = supabase_client.table("schedules").select("id").eq("academic_chair_id", ac_id).eq("academic_year", academic_year).execute()
                
                if existing.data:
                    skipped_schedules.append({
                        "academic_chair": ac_name,
                        "reason": "Schedule already exists for this year"
                    })
                    continue
                
                # Find programs where this AC's UUID is in the comma-separated academic_chair field
                programs_response = supabase_client.table("programs").select("program_id, courses").execute()
                
                # Filter programs that contain this AC's UUID in their academic_chair field
                ac_programs = []
                all_course_ids = []
                
                for program in programs_response.data:
                    # Get the academic_chair field (comma-separated UUIDs)
                    program_ac_field = program.get("academic_chair", "")
                    
                    # Check if this AC's UUID is in the list
                    if ac_id in program_ac_field:
                        ac_programs.append(program["program_id"])
                        
                        # Extract course IDs from this program
                        courses_field = program.get("courses", "")
                        if courses_field:
                            # Split by comma and strip whitespace
                            course_ids = [c.strip() for c in courses_field.split(",") if c.strip()]
                            all_course_ids.extend(course_ids)
                
                # Remove duplicate course IDs
                all_course_ids = list(set(all_course_ids))
                
                # Create comma-separated strings
                associated_programs_str = ",".join(ac_programs) if ac_programs else ""
                associated_courses_str = ",".join(all_course_ids) if all_course_ids else ""
                
                # Create the schedule record
                schedule_data = {
                    "academic_year": academic_year,
                    "academic_chair_id": ac_id,
                    "completion_status": "not_started",
                    "submission_status": "not_submitted",
                    "approval_status": "pending",
                    "time_slots_attached": "not_attached",
                    "associated_programs": associated_programs_str,
                    "associated_courses": associated_courses_str
                }
                
                schedule_response = supabase_client.table("schedules").insert(schedule_data).execute()
                
                created_schedules.append({
                    "academic_chair": ac_name,
                    "academic_chair_id": ac_id,
                    "programs_count": len(ac_programs),
                    "courses_count": len(all_course_ids)
                })
            
            return jsonify({
                "message": f"Schedule generation completed for academic year {academic_year}",
                "created": len(created_schedules),
                "skipped": len(skipped_schedules),
                "created_schedules": created_schedules,
                "skipped_schedules": skipped_schedules
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/admin/schedules/clear", methods=["DELETE"])
    def clear_schedules():
        """
        Clear all schedules from the schedules table.
        For development / debugging.
        """
        try:
            # Get count before deletion
            count_response = supabase_client.table("schedules").select("id", count="exact").execute()
            total_count = count_response.count if hasattr(count_response, 'count') else len(count_response.data)
            
            # Delete all schedules
            # We need the filter because Supabase does not allow deleting all rows without a filter
            supabase_client.table("schedules").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            
            return jsonify({
                "message": "All schedules cleared successfully",
                "deleted_count": total_count
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
