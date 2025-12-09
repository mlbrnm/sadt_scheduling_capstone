import sys
from ortools.sat.python import cp_model
import random
from supabase import create_client, Client 
from dotenv import load_dotenv 
import os 

load_dotenv() 
# this function will load the variables from the .env file

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
# used the  os.getenv function instead of os.environ function
    # if value does not exist system won't crash, it will just return none 
    # (environ will crash if value doesn't exist)


supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# : Client - type hint that says the variable supabase_client is an object instance 
# of class Client (a class from the supabase package we imported)



# def minutes_to_time(minutes):
#     days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
#     day = minutes // 1440
#     time_in_day = minutes % 1440
#     hours = time_in_day // 60
#     minutes = time_in_day % 60
#     return f"{days[day]} {hours:02d}:{minutes:02d}"

# #this function should be used when courses are saved to the schedule_courses table
# def create_sections(scheduled_course):
#     num_sections = scheduled_course["num_sections"]
#     sections_to_insert = []

#     for i in range(1, num_sections + 1):
#         section_letter = chr(64 + i) #creates ASCII code number which corresponds to a letter and then chr converts that code num to the letter (ex. 65 = 'A')
#         sections_to_insert.append({
#             "schedule_id": scheduled_course["schedule_id"],
#             "course_id": scheduled_course["course_id"],
#             "term": scheduled_course["term"],
#             "section_letter": section_letter,
#             "delivery_mode": scheduled_course["delivery_mode"],
#             "timeslots": [],
#             "instructor_id": None,
#             "weekly_hours_required": scheduled_course.get("weekly_hours_required"),
#             "sessions_per_week": scheduled_course.get("sessions_per_week")
#         })
#     response = supabase_client.table("sections").insert(sections_to_insert).execute()
#     return response

# #this function will return a dictionary of all the sections for a specific schedule
# def get_sections_by_schedule(supabase_client, schedule_id):
#     sections = (
#         supabase_client.table('sections').select('*').eq('schedule_id', schedule_id).execute().data
#         )
#     return sections

# #this function willl return all instructor course qualifications - a dictionary of who can teach which courses
# def get_instructor_course_qualifications(supabase_client):
#     qualifications = (
#         supabase_client.table('instructor_course_qualifications').select('*').execute().data
#     )
#     return qualifications

# #this function is a helper function meant to return a dictionary of all the sections for a specific schedule and a dictionary for which courses an instructor is able to teach
# def get_sections_and_instructor_qualifications(supabase_client, schedule_id):
#     return get_sections_by_schedule(supabase_client, schedule_id), get_instructor_course_qualifications(supabase_client)


# #this function will return a dictionary of all the course sections that an instructor is eligible to teach
# def instructor_section_eligibility(sections, instructor_qualifications):
#     instructor_courses = {} #dictionary to hold courses and the instructors who can teach those courses

#     # map instructors to courses
#     for instructor in instructor_qualifications:
#         course_id = instructor['course_id']
#         instructor_id = instructor['instructor_id']

#         if course_id not in instructor_courses:
#             instructor_courses[course_id] = []
        
#         instructor_courses[course_id].append(instructor_id)

#     section_eligibiity = {} # dictionary to map which instructors can teach each section

#     for section in sections:
#         course_id = section['course_id']
#         section_id = section['id']

#         # list to hold the eligible instructors for the section in section_eligibility
#         eligible_instructors = instructor_courses.get(course_id, [])

#         # update the section_eligibility dictionary to map which instructors can teach which sections per section_id
#         section_eligibiity[section_id] = eligible_instructors
    
#     return section_eligibiity

# # this function will generate timeslots for each course section taking into account: weeky_hours_required, sessions_per_week, instructor availability
# def generate_section_timeslots(sections, instructor_availability):
#     timeslots = {}

#     # CONSTANTS
#     DAY_START = 8 * 60 # *60 gets the minute value of the hour
#     DAY_END = 18 * 60
#     MINUTES_IN_DAY  =1440

#     for section in sections:
#         section_id = section["id"]
#         weekly_hours = section["weekly_hours_required"]
#         sessions_per_week = section["sessions_per_week"]
#         instructor_id = section.get("instructors_id")

#         if not instructor_id:
#             print(f"Skipping section {section_id}: no assigned instructor")
#             continue

#         # we will divide weekly hours evenly for each session at the moment
#         session_duration = (weekly_hours * 60) // sessions_per_week
#         assigned_times = []

#         available_times = instructor_availability.get(instructor_id, [])
        


# # def generate_time_slots():
# #     time_slots{}

# #     for section in sections:
# #         course_id = section["course_id"]
# #         section_id = section["section_id"]

# #         #get the course duraton in hours and convert to minutes
# #         duration_minutes = 

# #         #Generate a random start time between 8:00am and 6:00pm (in minutes)
# #         #8:00am = 480 minutes, 6:00pm = 1080 minutes
# #         start_time_minutes = random.randint(480,1080)


# def find_compatible_courses(instructor, all_courses, time_slots, assignments, solver, course_duration_hours):
#     instructor_courses = []
#     total_instructor_hours = 0
    
#     # Get instructor's current courses and calculate total hours
#     for c in all_courses:
#         if solver.Value(assignments[(instructor, c)]):
#             instructor_courses.append(c)
#             total_instructor_hours += course_duration_hours[c]

#     time_compatible_courses = []
    
#     # Get the instructor's current time slots
#     instructor_slots = []
#     for course in instructor_courses:
#         if course in time_slots:
#             instructor_slots.append(time_slots[course])
    
#     # Check each course not taught by the instructor for time conflicts
#     for course in all_courses:
#         if course not in instructor_courses and course in time_slots:
#             course_start, course_end = time_slots[course]
            
#             # Check if this course conflicts with any of the instructor's courses
#             conflict_found = False
#             for inst_start, inst_end in instructor_slots:
#                 # Check for overlap
#                 if not (course_end <= inst_start or inst_end <= course_start):
#                     conflict_found = True
#                     break
            
#             if not conflict_found:
#                 time_compatible_courses.append(course)
    
#     # Separate courses into two categories
#     time_and_hour_compatible = []
#     time_only_compatible = []
    
#     for course in time_compatible_courses:
#         if course_duration_hours[course] <= (20 - total_instructor_hours):
#             time_and_hour_compatible.append(course)
#         else:
#             time_only_compatible.append(course)
    
#     return time_and_hour_compatible, time_only_compatible


# # def create_scheduling_model(instructors, courses, course_duration_hours):
# #     # Create the model
# #     model = cp_model.CpModel()

# #     # a dictionary that will hold all the bool var objects the solver will be working with.
# #     assignments = {}
# #     for i in instructors:
# #         for c in courses:
# #             assignments[(i, c)] = model.NewBoolVar(f'{i}_{c}')

# #     # Constraint: Each course must be assigned to exactly one instructor
# #     for c in courses:
# #         model.AddExactlyOne(assignments[(i, c)] for i in instructors)

# #     total_cost = 0

# #     for i in instructors:
# #         # Calculate total hours for this instructor
# #         weekly_hours = sum(assignments[(i, c)] * course_duration_hours[c] for c in courses)
        
# #         # Deviation variables
# #         under_deviation = model.NewIntVar(0, 100, f'under_{i}')
# #         over_deviation = model.NewIntVar(0, 100, f'over_{i}')
        
# #         # Deviation constraints - I want to keep this visually simple for the prototype but
# #         # for the real thing it will make a lot more sense to have escalating punishments for 
# #         # deviating more from the 18-20 range so we don't end up with an instructor getting 
# #         # 40 hours or something.
# #         model.Add(under_deviation >= 18 - weekly_hours)
# #         model.Add(over_deviation >= weekly_hours - 20)
        
# #         # Add to total cost (going over is twice as bad as going under)
# #         total_cost += under_deviation * 1 + over_deviation * 2

# #     model.Minimize(total_cost)
    
# #     return model, assignments

# # this function will save the instructor assignments back to the database if at least a feasible solution is found
# def save_instructor_assignments(supabase_client, solver, assignments, sections, status):
#     if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
#         updated_count = 0

#         for section in sections:
#             section_id = section['id']

#             assigned_instructor = None
#             for (section_key, instructor_id), var in assignments.items():
#                 if section_key == section_id and solver.Value(var):
#                     assigned_instructor = instructor_id
#                     break
            
#             if assigned_instructor:
#                 response = supabase_client.table("sections").update({"instructor_id": assigned_instructor}).eq("id", section_id).execute()

#                 updated_count += 1
            
#         print(f"Updated {updated_count} section(s) in the database.")

#     else:
#         print("\nNo feasible solution found.")



#     #     for (section_id, instructor_id), var in assignments.items():
#     #         if solver.Value(var):
#     #             updates.append({
#     #                 "id": section_id,
#     #                 "instructor_id": instructor_id
#     #             })
        
#     #     if updates:
#     #         response = supabase_client.table("sections").upsert(updates).execute()
#     #         print("Supabase response:", response)
#     #         print(f"\nUpdated {len(updates)} section(s) in the database.")
#     #     else:
#     #         print("\nNo assignments to update in the database.")
#     # else:
#     #     print("\nNo feasible solution found.")


# #this function will build the constraint programming model (this version will not incorporate timeslots)
# def create_scheduling_model(sections, section_eligibility):
#     model = cp_model.CpModel()
#     assignments = {}

#     #get the eligible instructors for each section and create the variable for the assignments array
#     for section in sections:
#         section_id = section['id']
#         eligible_instructors = section_eligibility.get(section_id, [])

#         for instructor in eligible_instructors:
#             assignments[(section_id, instructor)] = model.NewBoolVar(f"{section_id}_{instructor}")
        
#     # Constraint: only one instructor assigned per section
#     for section in sections:
#         section_id = section['id']
#         eligible_instructors = section_eligibility.get(section_id, [])

#         if eligible_instructors:
#             model.AddExactlyOne(assignments[(section_id, instructor)] for instructor in eligible_instructors)
#         else:
#             print(f"No qualified instructors for section {section_id}")
    
#     #Constraint: Use numeric weighting system to prioritize sections with smaller number of eligible instructors
#     weighted_assignments = []
#     for section in sections:
#         section_id = section['id']
#         eligible_instructors = section_eligibility.get(section_id, [])

#         if not eligible_instructors:
#             continue
        
#         # equation to assign higher numeric weight to sections with less eligible instructors
#         weight = 1 / len(eligible_instructors)

#         for instructor in eligible_instructors:
#             weighted_assignments.append(weight * assignments[(section_id, instructor)])
    
#     # think of maximizing like getting to choose a limited amount coins with various values with the goal of getting the most return, so you choose the coins with the highest value first
#     model.Maximize(sum(weighted_assignments))
    
#     return model, assignments


# # def solve_schedule(model, assignments, instructors, courses, course_duration_hours):
# #     # Solve the model
# #     solver = cp_model.CpSolver()
# #     status = solver.Solve(model)

# #     # Print results
# #     if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
# #         print("Solution found")
# #         print("Instructor Assignments:")
        
# #         for i in instructors:
# #             assigned_courses = []
# #             total_hours = 0
            
# #             for c in courses:
# #                 if solver.Value(assignments[(i, c)]):
# #                     assigned_courses.append(c)
# #                     total_hours += course_duration_hours[c]
            
# #             print(f"\n{i}: {total_hours} hours")
# #             for course in assigned_courses:
# #                 print(f"  - {course} ({course_duration_hours[course]} hours)")
        
# #         print(f"\nTotal cost: {solver.ObjectiveValue()}")
        
# #     else:
# #         print("No solution found!")
        
# #     return solver, status

# def solve_schedule(model, assignments, sections):
#     solver = cp_model.CpSolver()
#     status = solver.Solve(model)

#     if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
#         print("Solution Found")
#         print("\nInstructor Assignments by Section:\n")

#         for section in sections:
#             section_id = section['id']
#             course_id = section['course_id']

#             assigned_instructor = None
#             for (section_key, instructor) in assignments:
#                 if section_key == section_id and solver.Value(assignments[(section_key, instructor)]):
#                     assigned_instructor = instructor
#                     break
            
#             if assigned_instructor:
#                 print(f"Section {section_id} ({course_id}) → Instructor {assigned_instructor}")
#             else:
#                 print(f"No instructor assigned for section {section_id} ({course_id})")

#         print(f"\nObjective Value (weighted priority): {solver.ObjectiveValue()}")
#     else:
#         print("No solution found!")

#     return solver, status                


# # def main():
# #     # Create and solve the initial schedule
# #     model, assignments = create_scheduling_model(instructors, courses, course_duration_hours)
# #     solver, status = solve_schedule(model, assignments, instructors, courses, course_duration_hours)
    
# #     if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
# #         return
    
# #     # Now, the initial schedule has been created. The ACs review and modify it and submit it
# #     # to the OTR team to assign timeslots which we import into the system.
# #     # Later, they want to add a section to a course.
    
# #     # Generate the time slots
# #     time_slots = generate_time_slots(courses, course_duration_hours)
    
# #     # Find compatible courses for instructor_1
# #     time_and_hour_compatible, time_only_compatible = find_compatible_courses(
# #         'instructor_1', courses, time_slots, assignments, solver, course_duration_hours
# #     )

# #     print("\nCOMPATIBLE (Time and Hours):\n---------------")
# #     if time_and_hour_compatible:
# #         for course in time_and_hour_compatible:
# #             print(f"  - {course} ({course_duration_hours[course]} hours)")
# #     else:
# #         print("  No courses available that fit both time and hour constraints")

# #     print("\nCOMPATIBLE (Time Only - Would Exceed Hour Limit):\n---------------")
# #     if time_only_compatible:
# #         for course in time_only_compatible:
# #             print(f"  - {course} ({course_duration_hours[course]} hours)")
# #     else:
# #         print("  No courses that fit time-wise but exceed hour limits")

# #     print("\nINCOMPATIBLE (Time Conflicts):\n---------------")
# #     all_time_compatible = time_and_hour_compatible + time_only_compatible
# #     incompatible_courses = [course for course in courses if course not in all_time_compatible]
    
# #     # Remove courses already assigned to instructor_1
# #     instructor_courses = []
# #     for c in courses:
# #         if solver.Value(assignments[('instructor_1', c)]):
# #             instructor_courses.append(c)
    
# #     incompatible_courses = [course for course in incompatible_courses if course not in instructor_courses]
    
# #     if incompatible_courses:
# #         for course in incompatible_courses:
# #             print(f"  - {course} ({course_duration_hours[course]} hours)")
# #     else:
#         # print("  No courses with time conflicts")


# # if __name__ == "__main__":
# #     main()

# def main(schedule_id):
#     # fetch all scheduled courses for this schedule
#     scheduled_courses_response = supabase_client.table("scheduled_courses").select("*").eq("schedule_id", schedule_id).execute()
#     scheduled_courses = scheduled_courses_response.data

#     if not scheduled_courses:
#         print(f"No scheduled courses found for schedule {schedule_id}")
#         return

#     # create sections for each scheduled course
#     for scheduled_course in scheduled_courses:
#         response = create_sections(scheduled_course)
#         #print(f"Inserted sections for course_id {scheduled_course['course_id']}: {response}")


#     #get all the sections and instructor qualifications for this schedule
#     sections, qualifications = get_sections_and_instructor_qualifications(supabase_client, schedule_id)
#     print("Sections:", sections)
#     print("Instructor Qualifications:", qualifications)

#     if not sections:
#         print(f"No sections found for schedule {schedule_id}")
#         return

#     if not qualifications:
#         print("No instructor qualifications found.")
#         return
    
#     # get instructor eligibility for each section
#     section_eligibility = instructor_section_eligibility(sections, qualifications)

#     # build the scheduling model 
#     model, assignments = create_scheduling_model(sections, section_eligibility)

#     # solve the schedule model
#     solver, status = solve_schedule(model, assignments, sections)

#     # save the assigned instructors to the sections table in supabase
#     save_instructor_assignments(supabase_client, solver, assignments, sections, status)
    
# if __name__ == "__main__": 
#     schedule_id = "baeb5107-e272-4fbf-bb5f-65d3f4f0d5ce" 
#     main(schedule_id)



# ------------------------------------------------------------
# Utility printing
# ------------------------------------------------------------
def print_header(title):
    print("\n" + "=" * len(title))
    print(title)
    print("=" * len(title) + "\n")

# ------------------------------------------------------------
# Data Fetching
# ------------------------------------------------------------
def get_sections(schedule_id):
    print_header(f"Fetching Sections for Schedule: {schedule_id}")
    response = (
        supabase_client.table("sections")
        .select("*")
        .eq("schedule_id", schedule_id)
        .order("course_id")      # optional but nicer output
        .order("section_letter")
        .execute()
    )

    sections = response.data or []
    print(f"Found {len(sections)} sections")

    for s in sections:
        print(f"  - Section {s['id']} | Course {s['course_id']} | Letter {s['section_letter']} | Instructor {s.get('instructor_id')}")

    return sections


def get_active_instructors():
    print_header("Fetching Active Instructors")
    response = (
        supabase_client.table("instructors")
        .select("*")
        .ilike("instructor_status", "%active%")
        .execute()
    )

    instructors = response.data or []
    print(f"Found {len(instructors)} active instructors")

    for i in instructors:
        print(f"  - Instructor {i['instructor_id']} | {i.get('full_name')}")

    return instructors


def count_current_assignments(sections):
    print_header("Counting Current Assignments")

    instructor_load = {}

    for section in sections:
        instr_id = section.get("instructor_id")
        if instr_id:
            instructor_load[instr_id] = instructor_load.get(instr_id, 0) + 1

    for instr, load in instructor_load.items():
        print(f"  - Instructor {instr} currently teaching {load} section(s)")

    return instructor_load


def build_section_eligibility(sections, instructors):
    print_header("Building Section Eligibility")

    instructor_ids = [i["instructor_id"] for i in instructors]
    eligibility = {}

    for s in sections:
        sec_id = s["id"]

        # You can filter by course, discipline, credentials here later.
        eligibility[sec_id] = instructor_ids.copy()

        print(f"  - Section {sec_id} eligible instructors: {eligibility[sec_id]}")

    return eligibility

# ------------------------------------------------------------
# Model Construction
# ------------------------------------------------------------
def create_model(sections, section_eligibility, instructor_load, instructors):
    print_header("Creating OR-Tools Model")

    model = cp_model.CpModel()
    assignments = {}

    print("Creating assignment variables...")
    for section in sections:
        sec_id = section["id"]
        for instr_id in section_eligibility[sec_id]:
            assignments[(sec_id, instr_id)] = model.NewBoolVar(f"{sec_id}_{instr_id}")

    print("Adding section assignment constraints...")
    for section in sections:
        sec_id = section["id"]
        eligible = section_eligibility[sec_id]

        if len(eligible) == 0:
            print(f"  [WARNING] Section {sec_id} has NO eligible instructors — solver will allow leaving it unassigned.")
            continue

        model.AddExactlyOne(assignments[(sec_id, instr)] for instr in eligible)

    # Instructor load vars
    print("Building instructor load constraints...")
    all_instructors = {i["instructor_id"] for i in instructors}

    load_vars = {}
    for instr_id in all_instructors:
        load_vars[instr_id] = model.NewIntVar(0, len(sections), f"load_{instr_id}")
        model.Add(
            load_vars[instr_id] ==
            sum(assignments[(s["id"], instr_id)]
                for s in sections
                if (s["id"], instr_id) in assignments)
        )

    L_max = model.NewIntVar(0, len(sections), "L_max")

    for instr_id in load_vars:
        model.Add(load_vars[instr_id] <= L_max)

    print("Setting fairness optimization...")
    model.Minimize(L_max * 1000 + sum(load_vars.values()))

    print("[DEBUG] Model creation complete.\n")
    return model, assignments

# ------------------------------------------------------------
# Solve and Return Results
# ------------------------------------------------------------
def solve_and_save(sections, assignments, model):
    print_header("Solving Model")

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    status_codes = {
        cp_model.OPTIMAL: "OPTIMAL",
        cp_model.FEASIBLE: "FEASIBLE",
        cp_model.INFEASIBLE: "INFEASIBLE",
        cp_model.UNKNOWN: "UNKNOWN",
        cp_model.MODEL_INVALID: "INVALID"
    }
    print(f"[SOLVER STATUS] {status_codes.get(status, status)}")

    # -------------------------
    # Map: scheduled_course_id -> section_letter -> instructor_id
    # -------------------------
    assigned_map = {}

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        print("\nAssignments Found:")

        for sec in sections:
            sec_id = sec["id"]
            scid = sec["scheduled_course_id"]
            letter = sec.get("section_letter")
            course_id = sec.get("course_id")

            if not letter or not course_id:
                print(f"[WARNING] Skipping section {sec_id}: missing section_letter or course_id")
                continue

            # Find assigned instructor
            assigned_instr = None
            for (s_id, instr_id), var in assignments.items():
                if s_id == sec_id and solver.Value(var) == 1:
                    assigned_instr = instr_id
                    break

            # Build map
            if scid not in assigned_map:
                assigned_map[scid] = {}
            assigned_map[scid][letter] = assigned_instr

            print(f"  - Section {sec_id} ({course_id}-{letter}) → Instructor {assigned_instr}")

        # -------------------------
        # Upsert to sections table (safely handling NOT NULL columns)
        # -------------------------
        upserts = []
        for sec in sections:
            scid = sec.get("scheduled_course_id")
            letter = sec.get("section_letter")
            course_id = sec.get("course_id")
            delivery_mode = sec.get("delivery_mode") or "TBD"  # default if null

            if not letter or not course_id:
                print(f"[WARNING] Skipping section {sec['id']}: missing section_letter or course_id")
                continue

            instructor_id = assigned_map.get(scid, {}).get(letter)

            upserts.append({
                "id": sec["id"],
                "schedule_id": sec["schedule_id"],
                "course_id": course_id,
                "section_letter": letter,
                "delivery_mode": delivery_mode,  # now included
                "instructor_id": instructor_id
            })

        if upserts:
            supabase_client.table("sections").upsert(upserts).execute()
            print_header(f"Updated {len(upserts)} sections in Supabase")

        # -------------------------
        # Upsert to scheduled_instructors table
        # -------------------------
        si_upserts = []
        for scid, sec_dict in assigned_map.items():
            for letter, instr_id in sec_dict.items():
                if not instr_id:
                    continue
                si_upserts.append({
                    "schedule_id": sections[0]["schedule_id"],  # assumes all sections have same schedule_id
                    "scheduled_course_id": scid,
                    "section_letter": letter,
                    "instructor_id": instr_id
                })

        if si_upserts:
            supabase_client.table("scheduled_instructors").upsert(
                si_upserts, on_conflict="schedule_id,scheduled_course_id,section_letter"
            ).execute()
            print_header(f"Upserted {len(si_upserts)} scheduled_instructors rows")

        # -------------------------
        # Remove outdated scheduled_instructors assignments
        # -------------------------
        existing_res = supabase_client.table("scheduled_instructors").select(
            "scheduled_course_id, section_letter"
        ).eq("schedule_id", sections[0]["schedule_id"]).execute()

        existing_pairs = {(row["scheduled_course_id"], row["section_letter"]) for row in existing_res.data}
        assigned_pairs = {(scid, letter) for scid, sec_dict in assigned_map.items() for letter in sec_dict.keys()}
        to_delete = existing_pairs - assigned_pairs

        for scid, letter in to_delete:
            print(f"[AUTO ASSIGN] Removing outdated assignment scid={scid}, letter={letter}")
            supabase_client.table("scheduled_instructors") \
                .delete() \
                .eq("scheduled_course_id", scid) \
                .eq("section_letter", letter) \
                .eq("schedule_id", sections[0]["schedule_id"]) \
                .execute()

        print("[AUTO ASSIGN] Sync complete")

    else:
        print("\n[WARNING] Solver could not find a feasible solution.")
        return {}

    print_header("Solver Completed")
    return assigned_map
# ------------------------------------------------------------
# Public entry point — this is what Flask should call
# ------------------------------------------------------------
def solver_main(schedule_id):
    print_header(f"Running Auto-Assign Solver for Schedule {schedule_id}")

    sections = get_sections(schedule_id)
    if not sections:
        print("[SOLVER] No sections found — returning empty result")
        return {}

    instructors = get_active_instructors()
    if not instructors:
        print("[SOLVER] No instructors found — returning empty result")
        return {}

    instructor_load = count_current_assignments(sections)
    eligibility = build_section_eligibility(sections, instructors)

    model, assignments = create_model(
        sections, eligibility, instructor_load, instructors
    )

    result = solve_and_save(sections, assignments, model)

    if not result:
        print("[SOLVER] No assignment results — returning {}")

    return result


# ------------------------------------------------------------
# CLI
# ------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python solver.py <schedule_id>")
        sys.exit(1)

    schedule_id = sys.argv[1]
    output = solver_main(schedule_id)
    print("\nFinal Output:", output)
