from flask import jsonify, request
from database import supabase_client

def register_schedule_routes(app):
    
    @app.route("/schedules/save", methods=["POST"])
    def save_schedule_from_json():
        """
        Convert the frontend JSON scheduling schema into database objects.
        Creates a schedule record and associated section records.
        
        Example JSON format from Amrit's frontend:
        {
            "schedule_id": "optional-uuid-if-updating",
            "academic_year": 2025,
            "academic_chair_id": "uuid-here",
            "assignments": {
                "instructorId-courseId-semester": {
                    "sections": {
                        "A": { "class": true, "online": true },
                        "B": { "class": true, "online": false }
                    }
                }
            }
        }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            academic_year = data.get("academic_year")
            academic_chair_id = data.get("academic_chair_id")
            assignments = data.get("assignments", {})
            schedule_id = data.get("schedule_id")
            
            if not academic_year or not academic_chair_id:
                return jsonify({"error": "academic_year and academic_chair_id are required"}), 400
            
            # Create or update schedule record
            if schedule_id:
                # Update existing schedule
                schedule_response = supabase_client.table("schedules").update({
                    "updated_at": "now()"
                }).eq("id", schedule_id).execute()
                
                if not schedule_response.data:
                    return jsonify({"error": "Schedule not found"}), 404
                    
                # Delete existing sections for this schedule
                supabase_client.table("sections").delete().eq("schedule_id", schedule_id).execute()
            else:
                # Create new schedule
                schedule_data = {
                    "academic_year": academic_year,
                    "academic_chair_id": academic_chair_id,
                    "completion_status": "in_progress",
                    "submission_status": "not_submitted",
                    "approval_status": "pending",
                    "time_slots_attached": "not_attached"
                }
                
                schedule_response = supabase_client.table("schedules").insert(schedule_data).execute()
                
                if not schedule_response.data:
                    return jsonify({"error": "Failed to create schedule"}), 500
                    
                schedule_id = schedule_response.data[0]["id"]
            
            # Parse assignments and create section records
            sections_to_insert = []
            
            for assignment_key, assignment_data in assignments.items():
                # Parse the key as defined by Amrit's front end: "instructorId-courseId-semester"
                parts = assignment_key.split("-")
                if len(parts) < 3:
                    continue
                    
                instructor_id = parts[0]
                # Course ID might contain dashes, so join everything except first and last parts
                course_name = "-".join(parts[1:-1])
                term = parts[-1]
                
                sections = assignment_data.get("sections", {})
                
                for section_letter, flags in sections.items():
                    class_flag = flags.get("class", False)
                    online_flag = flags.get("online", False)
                    
                    # Determine delivery mode
                    if class_flag and online_flag:
                        delivery_mode = "both"
                    elif class_flag:
                        delivery_mode = "class"
                    elif online_flag:
                        delivery_mode = "online"
                    else:
                        # Skip if neither is true
                        continue
                    
                    section_record = {
                        "schedule_id": schedule_id,
                        "instructor_id": float(instructor_id),
                        "course_name": course_name,
                        "term": term,
                        "section_letter": section_letter,
                        "delivery_mode": delivery_mode,
                        "timeslots": ""
                    }
                    
                    sections_to_insert.append(section_record)
            
            # Insert all sections
            if sections_to_insert:
                supabase_client.table("sections").insert(sections_to_insert).execute()
            
            return jsonify({
                "message": "Schedule saved successfully",
                "schedule_id": schedule_id,
                "sections_created": len(sections_to_insert)
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/schedules/<schedule_id>/json", methods=["GET"])
    def get_schedule_as_json(schedule_id):
        """
        Convert database schedule and sections back into the frontend JSON format.
        
        Returns:
        {
            "metaData": {
                "year": 2025,
                "activeSemesters": { "winter": true, "springSummer": true, "fall": true }
            },
            "assignments": {
                "instructorId-courseId-semester": {
                    "sections": {
                        "A": { "class": true, "online": true }
                    }
                }
            }
        }
        """
        try:
            # Fetch schedule
            schedule_response = supabase_client.table("schedules").select("*").eq("id", schedule_id).execute()
            
            if not schedule_response.data:
                return jsonify({"error": "Schedule not found"}), 404
            
            schedule = schedule_response.data[0]
            
            # Fetch all sections for this schedule
            sections_response = supabase_client.table("sections").select("*").eq("schedule_id", schedule_id).execute()
            
            sections = sections_response.data
            
            # Build the assignments object
            assignments = {}
            active_semesters = {"winter": False, "springSummer": False, "fall": False}
            
            for section in sections:
                instructor_id = str(int(section["instructor_id"]))
                course_name = section["course_name"]
                term = section["term"]
                section_letter = section["section_letter"]
                delivery_mode = section["delivery_mode"]
                
                # Mark semester as active
                active_semesters[term] = True
                
                # Create assignment key
                assignment_key = f"{instructor_id}-{course_name}-{term}"
                
                # Initialize assignment entry if it doesn't exist
                if assignment_key not in assignments:
                    assignments[assignment_key] = {"sections": {}}
                
                # Determine class and online flags from delivery_mode
                class_flag = delivery_mode in ["class", "both"]
                online_flag = delivery_mode in ["online", "both"]
                
                # Check if this section letter already exists for this assignment
                if section_letter in assignments[assignment_key]["sections"]:
                    # Merge with existing (in case of split class/online instructors)
                    existing = assignments[assignment_key]["sections"][section_letter]
                    assignments[assignment_key]["sections"][section_letter] = {
                        "class": existing.get("class", False) or class_flag,
                        "online": existing.get("online", False) or online_flag
                    }
                else:
                    assignments[assignment_key]["sections"][section_letter] = {
                        "class": class_flag,
                        "online": online_flag
                    }
            
            # Build the response
            response_data = {
                "metaData": {
                    "year": schedule["academic_year"],
                    "activeSemesters": active_semesters
                },
                "assignments": assignments
            }
            
            return jsonify(response_data), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
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
