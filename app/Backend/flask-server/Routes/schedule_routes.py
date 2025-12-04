from flask import jsonify, request
from database import supabase_client

def register_schedule_routes(app):
    
    @app.route("/schedules/save", methods=["POST"])
    def save_schedule():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        schedule_id = data.get("schedule_id")
        academic_year = data.get("academic_year")
        academic_chair_id = data.get("academic_chair_id")
        added_courses_by_semester = data.get("addedCoursesBySemester", {})
        assignments = data.get("assignments", {})

        if not academic_chair_id or not academic_year:
            return jsonify({"error": "Missing academic_chair_id or academic_year"}), 400

        # --------------------------------------------------------------
        # Helper: Ensure section count matches num_sections
        # --------------------------------------------------------------
        def sync_sections_for_scheduled_course(sc_row):
            schedule_id = sc_row["schedule_id"]
            course_id = sc_row["course_id"]
            term = sc_row["term"]
            num_sections = sc_row["num_sections"]
            scheduled_course_id = sc_row["scheduled_course_id"]

            print("\n=== SECTION SYNC DEBUG ===")
            print("Syncing sections for:", {
                "schedule_id": schedule_id,
                "course_id": course_id,
                "term": term,
                "num_sections": num_sections,
                "scheduled_course_id": scheduled_course_id
            })

            # 1. Fetch existing sections
            existing_resp = (
                supabase_client.table("sections")
                .select("id,section_letter")
                .eq("scheduled_course_id", scheduled_course_id)
                .order("section_letter", desc=False)
                .execute()
            )

            existing_sections = existing_resp.data or []
            existing_letters = [s["section_letter"] for s in existing_sections]

            print("Existing letters:", existing_letters)

            # 2. Determine desired letters A..N
            target_letters = [chr(ord("A") + i) for i in range(num_sections)]
            print("Target letters:", target_letters)

            # 3. DELETE extra sections
            for s in existing_sections:
                if s["section_letter"] not in target_letters:
                    print("Deleting extra section:", s["section_letter"])
                    supabase_client.table("sections") \
                        .delete() \
                        .eq("id", s["id"]) \
                        .execute()

            # 4. INSERT missing sections
            for letter in target_letters:
                if letter not in existing_letters:
                    print("Creating missing section:", letter)
                    supabase_client.table("sections").insert({
                        "schedule_id": schedule_id,
                        "course_id": course_id,
                        "term": term,
                        "section_letter": letter,
                        "delivery_mode": sc_row.get("delivery_mode") or "both",
                        "timeslots": [],
                        "scheduled_course_id": scheduled_course_id
                    }).execute()

            print("=== END SECTION SYNC ===\n")

        try:
            # --------------------------------------------------------------
            # 1. UPSERT SCHEDULED COURSES + SYNC SECTIONS
            # --------------------------------------------------------------
            scheduled_courses_batch = []

            for semester, courses in added_courses_by_semester.items():
                for course in courses:
                    course_id = course["course_id"]
                    num_sections = int(course.get("num_sections", 1))

                    print("=== scheduled_course DEBUG ===")
                    print("Processing:", {
                        "schedule_id": schedule_id,
                        "course_id": course_id,
                        "term": semester,
                        "desired_num_sections": num_sections
                    })

                    # Check existing scheduled_course
                    existing_resp = (
                        supabase_client.table("scheduled_courses")
                        .select("scheduled_course_id,num_sections,term,schedule_id,course_id,delivery_mode")
                        .eq("schedule_id", schedule_id)
                        .eq("course_id", course_id)
                        .eq("term", semester)
                        .execute()
                    )

                    rows = existing_resp.data or []

                    if rows:
                        sc_row = rows[0]
                        sc_id = sc_row["scheduled_course_id"]
                        current_num = sc_row["num_sections"]

                        if current_num != num_sections:
                            print(f"Updating scheduled_course {sc_id} from {current_num} -> {num_sections}")
                            update_resp = (
                                supabase_client.table("scheduled_courses")
                                .update({
                                    "num_sections": num_sections,
                                    "status": "sections_created"
                                })
                                .eq("scheduled_course_id", sc_id)
                                .execute()
                            )
                            sc_row["num_sections"] = num_sections  # refresh locally

                    else:
                        print("Inserting new scheduled_course")
                        insert_resp = (
                            supabase_client.table("scheduled_courses")
                            .insert({
                                "schedule_id": schedule_id,
                                "course_id": course_id,
                                "num_sections": num_sections,
                                "term": semester,
                                "status": "sections_created",
                                "delivery_mode": course.get("delivery_mode")
                            })
                            .execute()
                        )
                        sc_row = insert_resp.data[0]

                    # store
                    scheduled_courses_batch.append(sc_row)

                    # ⭐ SYNC SECTIONS FOR THIS COURSE
                    sync_sections_for_scheduled_course(sc_row)

                    print("=== end scheduled_course DEBUG ===\n")

            # --------------------------------------------------------------
            # 2. ASSIGN INSTRUCTORS TO SECTIONS
            # --------------------------------------------------------------
            print("\n=== INSTRUCTOR ASSIGNMENT PHASE ===")

            # Preload all sections for this schedule
            section_rows = (
                supabase_client.table("sections")
                .select("id,schedule_id,course_id,term,section_letter")
                .eq("schedule_id", schedule_id)
                .execute()
            ).data or []

            # Build lookup map: (course_id, term, section_letter) → section_id
            section_map = {
                (row["course_id"], row["term"], row["section_letter"]): row["id"]
                for row in section_rows
            }

            instructor_upserts = []

            for key, value in assignments.items():
                # Key format: "instructor-course-semester"
                instructor_id_str, course_id_str, semester = key.split("-")
                instructor_id = float(instructor_id_str)
                course_id = course_id_str  # keep string, matches your DB

                for section_letter, delivery in value.get("sections", {}).items():
                    lookup_key = (course_id, semester, section_letter)

                    if lookup_key not in section_map:
                        print("WARNING: Section not found for assignment:", lookup_key)
                        continue

                    instructor_upserts.append({
                        "schedule_id": schedule_id,
                        "section_id": section_map[lookup_key],
                        "instructor_id": instructor_id
                    })

            if instructor_upserts:
                print("Upserting instructors:", instructor_upserts)
                supabase_client.table("scheduled_instructors") \
                    .upsert(instructor_upserts,
                            on_conflict=["schedule_id", "section_id", "instructor_id"]) \
                    .execute()

            print("=== END INSTRUCTOR ASSIGNMENT ===")

            return jsonify({"message": "Schedule saved successfully"}), 200

        except Exception as e:
            print("Error saving schedule:", e)
            return jsonify({"error": str(e)}), 500


    @app.route("/schedules/<schedule_id>/json", methods=["GET"])
    def get_schedule_as_json(schedule_id):
        """
        Return schedule, scheduled_courses, and sections in JSON format,
        including course metadata nested under each scheduled course.
        """
        try:
            # Fetch schedule
            schedule_resp = (
                supabase_client.table("schedules")
                .select("*")
                .eq("id", schedule_id)
                .single()
                .execute()
            )
            if not schedule_resp.data:
                return jsonify({"error": "Schedule not found"}), 404

            schedule = schedule_resp.data

            # Fetch scheduled courses
            scheduled_courses_resp = (
                supabase_client.table("scheduled_courses")
                .select("*")
                .eq("schedule_id", schedule_id)
                .execute()
            )
            scheduled_courses = scheduled_courses_resp.data or []

            courses_by_semester = {}

            for sc in scheduled_courses:
                term = sc["term"]
                sc_id = sc["scheduled_course_id"]  # <-- correct PK

                # Fetch course metadata
                course_resp = (
                    supabase_client.table("courses")
                    .select("*")
                    .eq("course_id", sc["course_id"])
                    .single()
                    .execute()
                )
                course_data = course_resp.data or {}

                # Fetch sections for this scheduled course
                sections_resp = (
                    supabase_client.table("sections")
                    .select("*")
                    .eq("scheduled_course_id", sc_id)  # <-- FIXED
                    .execute()
                )
                related_sections = sections_resp.data or []

                # Fetch instructor assignments for each section
                for sec in related_sections:
                    instructors_resp = (
                        supabase_client.table("scheduled_instructors")
                        .select("*")
                        .eq("section_id", sec["id"])
                        .execute()
                    )
                    sec["assigned_instructors"] = instructors_resp.data or []

                # Package full object
                sc_with_course = {
                    **sc,
                    "course": course_data,
                    "sections": related_sections
                }

                # Group by semester/term
                if term not in courses_by_semester:
                    courses_by_semester[term] = []

                courses_by_semester[term].append(sc_with_course)

            # MetaData
            metaData = {
                "year": schedule.get("academic_year"),
                "activeSemesters": schedule.get("terms") or []
            }

            return jsonify({
                "schedule": schedule,
                "courses_by_semester": courses_by_semester,
                "metaData": metaData
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/schedules/<schedule_id>/instructors", methods=["GET"])
    def get_instructors_for_schedule(schedule_id):
        try:
            # get scheduled courses for this schedule
            scheduled_courses_resp = (
                supabase_client.table("scheduled_courses")
                .select("course_id")
                .eq("schedule_id", schedule_id)
                .execute()
            )

            scheduled_courses = scheduled_courses_resp.data or []
            if not scheduled_courses:
                return jsonify({"instructors": []}), 200

            # Extract list of unique course_ids
            course_ids = list({sc["course_id"] for sc in scheduled_courses})

            # fetch instructors who are qualified for any of those courses
            qualifications_resp = (
                supabase_client.table("instructor_course_qualifications")
                .select("instructor_id, course_id")
                .in_("course_id", course_ids)
                .execute()
            )

            qualifications = qualifications_resp.data or []
            if not qualifications:
                return jsonify({"instructors": []}), 200

            # Extract unique instructor_ids
            instructor_ids = list({q["instructor_id"] for q in qualifications})

            # Step 3: fetch instructor profiles
            instructors_resp = (
                supabase_client.table("instructors")
                .select("*")
                .in_("instructor_id", instructor_ids)
                .execute()
            )

            instructors = instructors_resp.data or []

            return jsonify({
                "instructors": instructors,
                "course_ids": course_ids,
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500


    @app.route("/admin/schedules/generate", methods=["POST"])
    def generate_schedules():
        """
        Generate schedules for an AC, automatically creating:
        - schedule record
        - scheduled_courses records
        - sections for each scheduled_course (default: 1 section 'A')
        """
        debug_log = {}
        
        try:
            data = request.get_json()
            academic_year = data.get("academic_year")
            ac_id = data.get("ac_id")

            if not academic_year:
                return jsonify({"error": "academic_year is required"}), 400
            if not ac_id:
                return jsonify({"error": "ac_id is required"}), 400

            # Validate AC
            ac_response = (
                supabase_client.table("users")
                .select("id, first_name, last_name")
                .eq("id", ac_id)
                .eq("role", "AC")
                .eq("is_deleted", False)
                .single()
                .execute()
            )
            if not ac_response.data:
                return jsonify({"error": "AC not found"}), 404

            ac = ac_response.data
            ac_name = f"{ac['first_name']} {ac['last_name']}"

            # Fetch programs for this AC
            programs_response = (
                supabase_client.table("programs")
                .select("program_id, intakes")
                .eq("ac_id", ac_id)
                .execute()
            )
            programs = programs_response.data
            if not programs:
                return jsonify({"message": "No programs found for this AC"}), 200

            created_schedules = []
            skipped_schedules = []
            ac_processing_details = []

            for program in programs:
                program_id = program["program_id"]
                
                # Initialize ac_detail for this program
                ac_detail = {
                    "ac_id": ac_id,
                    "program_id": program_id,
                    "steps": []
                }
                
                intakes_raw = program.get("intakes") or ""
                intake_terms = [
                    i.strip().lower()
                    for i in intakes_raw.split("-")
                    if i.strip()
                ]

                # Check if schedule already exists
                existing = (
                    supabase_client.table("schedules")
                    .select("id")
                    .eq("academic_chair_id", ac_id)
                    .eq("program_id", program_id)
                    .eq("academic_year", academic_year)
                    .execute()
                )

                ac_detail["steps"].append({
                    "step": "check_existing_schedule",
                    "existing_schedules": existing.data
                })

                if existing.data:
                    skipped_schedules.append({
                        "program_id": program_id,
                        "reason": "Schedule already exists"
                    })
                    ac_detail["steps"].append({"step": "skipped", "reason": "already_exists"})
                    ac_processing_details.append(ac_detail)
                    continue

                # Fetch program → courses mapping
                program_courses_resp = (
                    supabase_client.table("program_courses")
                    .select("course_id")
                    .eq("program_id", program_id)
                    .execute()
                )
                program_courses = program_courses_resp.data
                course_ids = [c["course_id"] for c in program_courses]

                # Create schedule entry
                schedule_data = {
                    "academic_year": academic_year,
                    "academic_chair_id": ac_id,
                    "completion_status": "not_started",
                    "submission_status": "not_submitted",
                    "approval_status": "pending",
                    "time_slots_attached": "not_attached",
                    "associated_programs": program_id,
                    "associated_courses": ",".join(course_ids),
                    "program_id": program_id,
                    "terms": intake_terms
                }
                schedule_res = supabase_client.table("schedules").insert(schedule_data).execute()
                if not schedule_res.data:
                    skipped_schedules.append({
                        "program_id": program_id,
                        "reason": "Failed to create schedule"
                    })
                    continue

                schedule_id = schedule_res.data[0]["id"]

                # Prepare scheduled_courses + sections
                scheduled_courses_to_insert = []
                sections_to_insert = []

                print(f"\n=== DEBUG: Building scheduled_courses for program_id={program_id} ===")
                print(f"course_ids: {course_ids}")
                print(f"intake_terms: {intake_terms}")
                print(f"schedule_id: {schedule_id}")

                for course_id in course_ids:
                    for term in intake_terms:

                        scheduled_course = {
                            "schedule_id": schedule_id,
                            "course_id": course_id,
                            "num_sections": 1,
                            "status": "sections_created",
                            "term": term
                        }
                        scheduled_courses_to_insert.append(scheduled_course)

                print(f"\n=== DEBUG: Prepared scheduled_courses_to_insert ===")
                print(f"Total records to insert: {len(scheduled_courses_to_insert)}")
                print(f"Records: {scheduled_courses_to_insert}")

                # Insert all scheduled_courses at once
                try:
                    print(f"\n=== DEBUG: Attempting to insert scheduled_courses ===")
                    sc_insert_res = supabase_client.table("scheduled_courses").insert(scheduled_courses_to_insert).execute()
                    
                    print(f"\n=== DEBUG: Insert response ===")
                    print(f"sc_insert_res type: {type(sc_insert_res)}")
                    print(f"sc_insert_res.data: {sc_insert_res.data}")
                    print(f"Number of records inserted: {len(sc_insert_res.data) if sc_insert_res.data else 0}")
                    
                    if hasattr(sc_insert_res, 'error') and sc_insert_res.error:
                        print(f"ERROR in sc_insert_res: {sc_insert_res.error}")
                        
                except Exception as insert_error:
                    print(f"\n=== DEBUG: EXCEPTION during scheduled_courses insert ===")
                    print(f"Error type: {type(insert_error)}")
                    print(f"Error message: {str(insert_error)}")
                    import traceback
                    traceback.print_exc()
                    raise

                # generate sections for each scheduled_course we just created
                print(f"\n=== DEBUG: Generating sections ===")
                print(f"Number of scheduled_courses to create sections for: {len(sc_insert_res.data) if sc_insert_res.data else 0}")
                
                if sc_insert_res.data:
                    for sc in sc_insert_res.data:
                        print(f"Creating section for scheduled_course_id={sc.get('scheduled_course_id')}, course_id={sc.get('course_id')}, term={sc.get('term')}")
                        sections_to_insert.append({
                            "schedule_id": schedule_id,
                            "course_id": sc["course_id"],
                            "term": sc["term"],
                            "section_letter": "A",
                            "delivery_mode": "In-Person",  
                            "timeslots": [],    
                            "instructor_id": None,
                            "semester_id": None,
                            "weekly_hours_required": None,
                            "sessions_per_week": None,
                            "scheduled_course_id": sc["scheduled_course_id"]
                        })
                else:
                    print("WARNING: sc_insert_res.data is empty or None - no sections will be created!")

                # Insert all sections at once
                print(f"\n=== DEBUG: Inserting sections ===")
                print(f"Total sections to insert: {len(sections_to_insert)}")
                
                if sections_to_insert:
                    try:
                        sections_insert_res = supabase_client.table("sections").insert(sections_to_insert).execute()
                        print(f"Sections inserted successfully: {len(sections_insert_res.data) if sections_insert_res.data else 0}")
                        print(f"sections_insert_res.data: {sections_insert_res.data}")
                    except Exception as sections_error:
                        print(f"ERROR inserting sections: {sections_error}")
                        import traceback
                        traceback.print_exc()
                else:
                    print("No sections to insert (sections_to_insert is empty)")

                created_schedules.append({
                    "program_id": program_id,
                    "courses_count": len(course_ids),
                    "schedule_id": schedule_id
                })
                
                ac_detail["steps"].append({"step": "completed_successfully"})
                ac_processing_details.append(ac_detail)

            debug_log["5_processing_complete"] = {
                "ac_processing_details": ac_processing_details,
                "created_count": len(created_schedules),
                "skipped_count": len(skipped_schedules)
            }

            return jsonify({
                "message": f"Schedule generation completed for AC {ac_name} in {academic_year}",
                "created": len(created_schedules),
                "skipped": len(skipped_schedules),
                "created_schedules": created_schedules,
                "skipped_schedules": skipped_schedules,
                "debug_log": debug_log
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
            
            # Use all schedules (no filtering)
            filtered_schedules = schedules_response.data
            
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
