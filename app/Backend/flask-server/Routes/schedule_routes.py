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
                # Update existing schedule and set completion_status to in_progress
                schedule_response = supabase_client.table("schedules").update({
                    "completion_status": "in_progress",
                    "updated_at": "now()"
                }).eq("id", schedule_id).execute()
                
                if not schedule_response.data:
                    return jsonify({"error": "Schedule not found"}), 404
                    
                # Delete existing sections for this schedule
                supabase_client.table("sections").delete().eq("schedule_id", schedule_id).execute()
            else:
                # Create new schedule with completion_status set to in_progress
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
                course_id = "-".join(parts[1:-1])
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
                        "course_id": course_id,
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
        Convert database schedule and scheduled courses/sections back into frontend JSON format.

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

            # Fetch all scheduled_courses for this schedule
            scheduled_courses_response = supabase_client.table("scheduled_courses") \
                .select("*").eq("schedule_id", schedule_id).execute()
            scheduled_courses = scheduled_courses_response.data

            # Fetch all sections for this schedule
            sections_response = supabase_client.table("sections").select("*").eq("schedule_id", schedule_id).execute()
            sections = sections_response.data

            # Determine active semesters from scheduled_courses
            active_semesters = {"winter": False, "springSummer": False, "fall": False}
            for sc in scheduled_courses:
                term = (sc.get("term") or "").lower()
                if term in active_semesters:
                    active_semesters[term] = True

            # Build assignments object from sections
            assignments = {}
            for section in sections:
                if not section.get("instructor_id"):
                    continue
                instructor_id = str(int(section["instructor_id"]))
                course_id = section["course_id"]
                term = section["term"]
                section_letter = section["section_letter"]
                delivery_mode = section["delivery_mode"]

                assignment_key = f"{instructor_id}-{course_id}-{term}"
                if assignment_key not in assignments:
                    assignments[assignment_key] = {"sections": {}}

                class_flag = delivery_mode in ["class", "both"]
                online_flag = delivery_mode in ["online", "both"]

                # Merge with existing section if already present
                existing = assignments[assignment_key]["sections"].get(section_letter, {})
                assignments[assignment_key]["sections"][section_letter] = {
                    "class": existing.get("class", False) or class_flag,
                    "online": existing.get("online", False) or online_flag
                }

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
        Each course is scheduled for every intake (term) defined in its program's intakes.
        """
        try:
            # Get academic year from request
            data = request.get_json()
            academic_year = data.get("academic_year")
            if not academic_year:
                return jsonify({"error": "academic_year is required"}), 400

            # Fetch all users with role "AC"
            ac_response = supabase_client.table("users") \
                .select("id, first_name, last_name") \
                .eq("role", "AC") \
                .eq("is_deleted", False).execute()

            academic_chairs = ac_response.data
            if not academic_chairs:
                return jsonify({"message": "No Academic Chairs found"}), 200

            # Fetch all programs and courses once
            programs_response = supabase_client.table("programs") \
                .select("program_id, intakes, academic_chair_ids").execute()
            programs_data = programs_response.data

            courses_response = supabase_client.table("courses") \
                .select("course_id, program_id").execute()
            courses_data = courses_response.data

            created_schedules = []
            skipped_schedules = []

            for ac in academic_chairs:
                ac_id = ac["id"]
                ac_name = f"{ac['first_name']} {ac['last_name']}"

                # Check if schedule already exists for this AC and year
                existing = supabase_client.table("schedules") \
                    .select("id").eq("academic_chair_id", ac_id).eq("academic_year", academic_year).execute()

                if existing.data:
                    skipped_schedules.append({
                        "academic_chair": ac_name,
                        "reason": "Schedule already exists for this year"
                    })
                    continue

                # Find programs assigned to this AC
                ac_programs = [p for p in programs_data if ac_id in (p.get("academic_chair_ids") or [])]

                # Create comma-separated program IDs for the schedule
                associated_programs_str = ",".join([p["program_id"] for p in ac_programs])

                # Gather courses for these programs
                ac_course_ids = []
                scheduled_courses_to_insert = []
                for program in ac_programs:
                    program_courses = [c for c in courses_data if c["program_id"] == program["program_id"]]
                    ac_course_ids.extend([c["course_id"] for c in program_courses])

                    # Split intakes into a list and normalize
                    intakes = program.get("intakes") or ""
                    intake_terms = [i.strip().lower() for i in intakes.split(",") if i.strip()]

                    # Generate scheduled_courses for each term and course
                    for course in program_courses:
                        for term in intake_terms:
                            scheduled_courses_to_insert.append({
                                "schedule_id": None,  # will fill after schedule creation
                                "course_id": course["course_id"],
                                "num_sections": 1,
                                "status": "sections_created",
                                "term": term
                            })

                # Remove duplicates
                ac_course_ids = list(set(ac_course_ids))
                associated_courses_str = ",".join(ac_course_ids)

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
                if not schedule_response.data:
                    skipped_schedules.append({"academic_chair": ac_name, "reason": "Failed to create schedule"})
                    continue

                schedule_id = schedule_response.data[0]["id"]

                # Fill schedule_id for each scheduled_course
                for sc in scheduled_courses_to_insert:
                    sc["schedule_id"] = schedule_id

                # Insert scheduled courses
                if scheduled_courses_to_insert:
                    supabase_client.table("scheduled_courses").insert(scheduled_courses_to_insert).execute()

                created_schedules.append({
                    "academic_chair": ac_name,
                    "academic_chair_id": ac_id,
                    "programs_count": len(ac_programs),
                    "courses_count": len(ac_course_ids)
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

    # @app.route("/admin/schedules/generate", methods=["POST"])
    # def generate_schedules():
    #     """
    #     Generate blank schedules for all Academic Chairs for a given academic year.
    #     Send JSON with "academic_year".
    #     """
    #     try:
    #         # Get academic year from request
    #         data = request.get_json()
    #         academic_year = data.get("academic_year")
            
    #         if not academic_year:
    #             return jsonify({"error": "academic_year is required"}), 400
            
    #         # Fetch all users with role "AC"
    #         ac_response = supabase_client.table("users").select("id, first_name, last_name").eq("role", "AC").eq("is_deleted", False).execute()
            
    #         academic_chairs = ac_response.data
            
    #         if not academic_chairs:
    #             return jsonify({"message": "No Academic Chairs found"}), 200
            
    #         created_schedules = []
    #         skipped_schedules = []
            
    #         for ac in academic_chairs:
    #             ac_id = ac["id"]
    #             ac_name = f"{ac['first_name']} {ac['last_name']}"
                
    #             # Check if schedule already exists for this AC and year
    #             existing = supabase_client.table("schedules").select("id").eq("academic_chair_id", ac_id).eq("academic_year", academic_year).execute()
                
    #             if existing.data:
    #                 skipped_schedules.append({
    #                     "academic_chair": ac_name,
    #                     "reason": "Schedule already exists for this year"
    #                 })
    #                 continue
                
    #             # Find programs where this AC's UUID is in the comma-separated academic_chair field
    #             programs_response = supabase_client.table("programs").select("program_id, courses").execute()
                
    #             # Filter programs that contain this AC's UUID in their academic_chair field
    #             ac_programs = []
    #             all_course_ids = []
                
    #             for program in programs_response.data:
    #                 # Get the academic_chair field (comma-separated UUIDs)
    #                 program_ac_field = program.get("academic_chair", "")
                    
    #                 # Check if this AC's UUID is in the list
    #                 if ac_id in program_ac_field:
    #                     ac_programs.append(program["program_id"])
                        
    #                     # Extract course IDs from this program
    #                     courses_field = program.get("courses", "")
    #                     if courses_field:
    #                         # Split by comma and strip whitespace
    #                         course_ids = [c.strip() for c in courses_field.split(",") if c.strip()]
    #                         all_course_ids.extend(course_ids)
                
    #             # Remove duplicate course IDs
    #             all_course_ids = list(set(all_course_ids))
                
    #             # Create comma-separated strings
    #             associated_programs_str = ",".join(ac_programs) if ac_programs else ""
    #             associated_courses_str = ",".join(all_course_ids) if all_course_ids else ""
                
    #             # Create the schedule record
    #             schedule_data = {
    #                 "academic_year": academic_year,
    #                 "academic_chair_id": ac_id,
    #                 "completion_status": "not_started",
    #                 "submission_status": "not_submitted",
    #                 "approval_status": "pending",
    #                 "time_slots_attached": "not_attached",
    #                 "associated_programs": associated_programs_str,
    #                 "associated_courses": associated_courses_str
    #             }
                
    #             schedule_response = supabase_client.table("schedules").insert(schedule_data).execute()
                
    #             created_schedules.append({
    #                 "academic_chair": ac_name,
    #                 "academic_chair_id": ac_id,
    #                 "programs_count": len(ac_programs),
    #                 "courses_count": len(all_course_ids)
    #             })
            
    #         return jsonify({
    #             "message": f"Schedule generation completed for academic year {academic_year}",
    #             "created": len(created_schedules),
    #             "skipped": len(skipped_schedules),
    #             "created_schedules": created_schedules,
    #             "skipped_schedules": skipped_schedules
    #         }), 200
            
    #     except Exception as e:
    #         return jsonify({"error": str(e)}), 500
    
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
    
    @app.route("/schedules/<schedule_id>/submit", methods=["POST"])
    def submit_schedule(schedule_id):
        """
        Submit a schedule by changing its submission_status to 'submitted'.
        This prevents further modifications to the schedule.
        """
        try:
            # Update the schedule's submission_status to 'submitted'
            response = supabase_client.table("schedules").update({
                "submission_status": "submitted",
                "updated_at": "now()"
            }).eq("id", schedule_id).execute()
            
            if not response.data:
                return jsonify({"error": "Schedule not found"}), 404
            
            return jsonify({
                "message": "Schedule submitted successfully",
                "schedule": response.data[0]
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/schedules/<schedule_id>/recall", methods=["POST"])
    def recall_schedule(schedule_id):
        """
        Recall a submitted schedule by changing its submission_status back to 'not_submitted'.
        This allows the academic chair to make further modifications.
        """
        try:
            # Update the schedule's submission_status to 'not_submitted'
            response = supabase_client.table("schedules").update({
                "submission_status": "not_submitted",
                "updated_at": "now()"
            }).eq("id", schedule_id).execute()
            
            if not response.data:
                return jsonify({"error": "Schedule not found"}), 404
            
            # Log the recall action
            supabase_client.table("schedule_submission_log").insert({
                "schedule_id": schedule_id,
                "action": "recalled",
                "admin_user_id": None,
                "comment": None
            }).execute()
            
            return jsonify({
                "message": "Schedule recalled successfully",
                "schedule": response.data[0]
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/admin/schedules/list", methods=["GET"])
    def list_admin_schedules():
        """
        Fetch all schedules for admin review.
        Returns schedules with submission_status in ('submitted', 'recalled') or approval_status = 'approved'.
        Includes academic chair name, programs, and combined status.
        """
        try:
            # Fetch schedules with their academic chair information
            try:
                schedules_response = supabase_client.table("schedules").select(
                    "id, academic_year, academic_chair_id, submission_status, approval_status, "
                    "associated_programs, created_at, updated_at"
                ).execute()
            except Exception as e:
                print(f"Error fetching schedules: {e}")
                return jsonify({"error": "Failed to fetch schedules", "details": str(e)}), 500
            
            if not schedules_response.data:
                return jsonify({"schedules": []}), 200
            
            # Filter schedules: submitted, recalled, or approved
            filtered_schedules = [
                s for s in schedules_response.data
                if s.get("submission_status") in ["submitted", "recalled"] or s.get("approval_status") == "approved"
            ]
            
            # Fetch all users to get academic chair names
            try:
                users_response = supabase_client.table("users").select("id, first_name, last_name").execute()
                users_map = {u["id"]: f"{u.get('first_name', '')} {u.get('last_name', '')}" for u in (users_response.data or [])}
            except Exception as e:
                print(f"Error fetching users: {e}")
                users_map = {}
            
            # Fetch all programs to get program names
            try:
                programs_response = supabase_client.table("programs").select("program_id, program").execute()
                programs_map = {p["program_id"]: p.get("program", p["program_id"]) for p in (programs_response.data or [])}
            except Exception as e:
                print(f"Error fetching programs: {e}")
                programs_map = {}
            
            # Build response data
            result = []
            for schedule in filtered_schedules:
                try:
                    # Get academic chair name
                    ac_name = users_map.get(schedule.get("academic_chair_id"), "Unknown")
                    
                    # Get program names (comma-separated in associated_programs)
                    associated_programs_str = schedule.get("associated_programs", "") or ""
                    program_ids = associated_programs_str.split(",") if associated_programs_str else []
                    program_names = [programs_map.get(pid.strip(), pid.strip()) for pid in program_ids if pid.strip()]
                    
                    # Determine combined status
                    approval_status = schedule.get("approval_status", "pending")
                    submission_status = schedule.get("submission_status", "not_submitted")
                    
                    if approval_status == "approved":
                        combined_status = "Approved"
                    elif submission_status == "recalled":
                        combined_status = "Recalled"
                    else:
                        combined_status = submission_status.replace("_", " ").title()
                    
                    result.append({
                        "schedule_id": schedule["id"],
                        "title": f"{ac_name} - {schedule.get('academic_year', 'N/A')}",
                        "academic_chair_name": ac_name,
                        "academic_year": schedule.get("academic_year"),
                        "programs": program_names,
                        "status": combined_status,
                        "submission_status": submission_status,
                        "approval_status": approval_status,
                        "date_submitted": schedule.get("updated_at") or schedule.get("created_at")
                    })
                except Exception as e:
                    print(f"Error processing schedule {schedule.get('id', 'unknown')}: {e}")
                    continue
            
            # Sort by date submitted (most recent first)
            result.sort(key=lambda x: x.get("date_submitted", ""), reverse=True)
            
            return jsonify({"schedules": result}), 200
            
        except Exception as e:
            print(f"Error in list_admin_schedules: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
    
    @app.route("/admin/schedules/<schedule_id>/approve", methods=["POST"])
    def approve_schedule(schedule_id):
        """
        Approve a schedule by setting approval_status to 'approved'.
        Optionally accepts a comment in the request body.
        """
        try:
            data = request.get_json() or {}
            comment = data.get("comment")
            admin_user_id = data.get("admin_user_id")
            
            # Update the schedule's approval_status to 'approved'
            response = supabase_client.table("schedules").update({
                "approval_status": "approved",
                "updated_at": "now()"
            }).eq("id", schedule_id).execute()
            
            if not response.data:
                return jsonify({"error": "Schedule not found"}), 404
            
            # Log the approval action
            supabase_client.table("schedule_submission_log").insert({
                "schedule_id": schedule_id,
                "action": "approved",
                "admin_user_id": admin_user_id,
                "comment": comment
            }).execute()
            
            return jsonify({
                "message": "Schedule approved successfully",
                "schedule": response.data[0]
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/admin/schedules/<schedule_id>/reject", methods=["POST"])
    def reject_schedule(schedule_id):
        """
        Reject a schedule by setting approval_status to 'rejected' and 
        submission_status back to 'not_submitted'.
        Requires a comment (rejection reason) in the request body.
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Request body is required"}), 400
            
            comment = data.get("comment")
            admin_user_id = data.get("admin_user_id")
            
            if not comment:
                return jsonify({"error": "Comment (rejection reason) is required"}), 400
            
            # Update the schedule's approval_status to 'rejected' and submission_status to 'not_submitted'
            response = supabase_client.table("schedules").update({
                "approval_status": "rejected",
                "submission_status": "not_submitted",
                "updated_at": "now()"
            }).eq("id", schedule_id).execute()
            
            if not response.data:
                return jsonify({"error": "Schedule not found"}), 404
            
            # Log the rejection action
            supabase_client.table("schedule_submission_log").insert({
                "schedule_id": schedule_id,
                "action": "rejected",
                "admin_user_id": admin_user_id,
                "comment": comment
            }).execute()
            
            return jsonify({
                "message": "Schedule rejected successfully",
                "schedule": response.data[0]
            }), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
