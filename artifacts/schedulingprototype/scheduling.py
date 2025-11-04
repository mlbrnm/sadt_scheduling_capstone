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


# # Test Data
# instructors = ['instructor_1', 'instructor_2', 'instructor_3', 'instructor_4', 'instructor_5', 'instructor_6', 'instructor_7', 'instructor_8', 'instructor_9']

# # used AI to generate most of these, prompt:
# # ------------------------------------------------------------------------------------------
# # courses = [
# #    'Object Oriented Programming 1',
# #    'Database Design', 
# #    'Web Development',
# #    'Technical Communication',
# #    'Data Structures',
# #    'Network Systems',
# #    'Mathematics',
# #    'Machine Learning'
# # ]
# #
# # course_duration_hours = {
# #    'Object Oriented Programming 1': 4,
# #    'Database Design': 3,
# #    'Web Development': 5,
# #    'Technical Communication': 4,
# #    'Data Structures': 4,
# #    'Network Systems': 5,
# #    'Mathematics': 3,
# #    'Machine Learning': 4
# # }
# #
# # Please extend these lists with additional fake data, about quadruple the amount.
# # ------------------------------------------------------------------------------------------

# courses = [
#     'Object Oriented Programming 1',
#     'Database Design', 
#     'Web Development',
#     'Technical Communication',
#     'Data Structures',
#     'Network Systems',
#     'Mathematics',
#     'Machine Learning',
#     'Object Oriented Programming 2',
#     'Advanced Database Design',
#     'Frontend Web Development',
#     'Professional Technical Communication',
#     'Advanced Data Structures',
#     'Network Security',
#     'Discrete Mathematics',
#     'Deep Learning',
#     'Software Engineering Principles',
#     'Cloud Infrastructure',
#     'Mobile App Development',
#     'Agile Methodology',
#     'Computer Architecture',
#     'Distributed Systems',
#     'Calculus II',
#     'Natural Language Processing',
#     'Object Oriented Programming 3',
#     'Database Administration',
#     'Backend Web Development',
#     'Scientific Communication',
#     'Algorithm Design',
#     'Wireless Networks',
#     'Linear Algebra',
#     'Reinforcement Learning',
#     'Software Testing',
#     'Big Data Analytics',
#     'DevOps Practices',
#     'Project Management',
#     'Operating Systems',
#     'Cryptography',
#     'Probability Theory',
#     'Computer Vision'
# ]

# course_duration_hours = {
#     'Object Oriented Programming 1': 4,
#     'Database Design': 3,
#     'Web Development': 5,
#     'Technical Communication': 4,
#     'Data Structures': 4,
#     'Network Systems': 5,
#     'Mathematics': 3,
#     'Machine Learning': 4,
#     'Object Oriented Programming 2': 4,
#     'Advanced Database Design': 4,
#     'Frontend Web Development': 5,
#     'Professional Technical Communication': 3,
#     'Advanced Data Structures': 5,
#     'Network Security': 4,
#     'Discrete Mathematics': 3,
#     'Deep Learning': 5,
#     'Software Engineering Principles': 4,
#     'Cloud Infrastructure': 5,
#     'Mobile App Development': 4,
#     'Agile Methodology': 3,
#     'Computer Architecture': 4,
#     'Distributed Systems': 5,
#     'Calculus II': 4,
#     'Natural Language Processing': 5,
#     'Object Oriented Programming 3': 4,
#     'Database Administration': 3,
#     'Backend Web Development': 5,
#     'Scientific Communication': 4,
#     'Algorithm Design': 4,
#     'Wireless Networks': 5,
#     'Linear Algebra': 3,
#     'Reinforcement Learning': 4,
#     'Software Testing': 3,
#     'Big Data Analytics': 5,
#     'DevOps Practices': 4,
#     'Project Management': 3,
#     'Operating Systems': 5,
#     'Cryptography': 4,
#     'Probability Theory': 3,
#     'Computer Vision': 5
# }


def minutes_to_time(minutes):
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day = minutes // 1440
    time_in_day = minutes % 1440
    hours = time_in_day // 60
    minutes = time_in_day % 60
    return f"{days[day]} {hours:02d}:{minutes:02d}"

#this function should be used when courses are saved to the schedule_courses table
def create_sections(scheduled_course):
    num_sections = scheduled_course["num_sections"]
    sections_to_insert = []

    for i in range(1, num_sections + 1):
        section_letter = chr(64 + i) #creates ASCII code number which corresponds to a letter and then chr converts that code num to the letter (ex. 65 = 'A')
        sections_to_insert.append({
            "schedule_id": scheduled_course["schedule_id"],
            "course_id": scheduled_course["course_id"],
            "term": scheduled_course["term"],
            "section_letter": section_letter,
            "delivery_mode": scheduled_course["delivery_mode"],
            "timeslots": [],
            "instructor_id": None,
            "weekly_hours_required": scheduled_course.get("weekly_hours_required"),
            "sessions_per_week": scheduled_course.get("sessions_per_week")
        })
    response = supabase_client.table("sections").insert(sections_to_insert).execute()
    return response

#this function will return a dictionary of all the sections for a specific schedule
def get_sections_by_schedule(supabase_client, schedule_id):
    sections = (
        supabase_client.table('sections').select('*').eq('schedule_id', schedule_id).execute().data
        )
    return sections

#this function willl return all instructor course qualifications - a dictionary of who can teach which courses
def get_instructor_course_qualifications(supabase_client):
    qualifications = (
        supabase_client.table('instructor_course_qualifications').select('*').execute().data
    )
    return qualifications

#this function is a helper function meant to return a dictionary of all the sections for a specific schedule and a dictionary for which courses an instructor is able to teach
def get_sections_and_instructor_qualifications(supabase_client, schedule_id):
    return get_sections_by_schedule(supabase_client, schedule_id), get_instructor_course_qualifications(supabase_client)


#this function will return a dictionary of all the course sections that an instructor is eligible to teach
def instructor_section_eligibility(sections, instructor_qualifications):
    instructor_courses = {} #dictionary to hold courses and the instructors who can teach those courses

    # map instructors to courses
    for instructor in instructor_qualifications:
        course_id = instructor['course_id']
        instructor_id = instructor['instructor_id']

        if course_id not in instructor_courses:
            instructor_courses[course_id] = []
        
        instructor_courses[course_id].append(instructor_id)

    section_eligibiity = {} # dictionary to map which instructors can teach each section

    for section in sections:
        course_id = section['course_id']
        section_id = section['id']

        # list to hold the eligible instructors for the section in section_eligibility
        eligible_instructors = instructor_courses.get(course_id, [])

        # update the section_eligibility dictionary to map which instructors can teach which sections per section_id
        section_eligibiity[section_id] = eligible_instructors
    
    return section_eligibiity

# this function will generate timeslots for each course section taking into account: weeky_hours_required, sessions_per_week, instructor availability
def generate_section_timeslots(sections, instructor_availability):
    timeslots = {}

    # CONSTANTS
    DAY_START = 8 * 60 # *60 gets the minute value of the hour
    DAY_END = 18 * 60
    MINUTES_IN_DAY  =1440

    for section in sections:
        section_id = section["id"]
        weekly_hours = section["weekly_hours_required"]
        sessions_per_week = section["sessions_per_week"]
        instructor_id = section.get("instructors_id")

        if not instructor_id:
            print(f"Skipping section {section_id}: no assigned instructor")
            continue

        # we will divide weekly hours evenly for each session at the moment
        session_duration = (weekly_hours * 60) // sessions_per_week
        assigned_times = []

        available_times = instructor_availability.get(instructor_id, [])
        


# def generate_time_slots():
#     time_slots{}

#     for section in sections:
#         course_id = section["course_id"]
#         section_id = section["section_id"]

#         #get the course duraton in hours and convert to minutes
#         duration_minutes = 

#         #Generate a random start time between 8:00am and 6:00pm (in minutes)
#         #8:00am = 480 minutes, 6:00pm = 1080 minutes
#         start_time_minutes = random.randint(480,1080)


def find_compatible_courses(instructor, all_courses, time_slots, assignments, solver, course_duration_hours):
    instructor_courses = []
    total_instructor_hours = 0
    
    # Get instructor's current courses and calculate total hours
    for c in all_courses:
        if solver.Value(assignments[(instructor, c)]):
            instructor_courses.append(c)
            total_instructor_hours += course_duration_hours[c]

    time_compatible_courses = []
    
    # Get the instructor's current time slots
    instructor_slots = []
    for course in instructor_courses:
        if course in time_slots:
            instructor_slots.append(time_slots[course])
    
    # Check each course not taught by the instructor for time conflicts
    for course in all_courses:
        if course not in instructor_courses and course in time_slots:
            course_start, course_end = time_slots[course]
            
            # Check if this course conflicts with any of the instructor's courses
            conflict_found = False
            for inst_start, inst_end in instructor_slots:
                # Check for overlap
                if not (course_end <= inst_start or inst_end <= course_start):
                    conflict_found = True
                    break
            
            if not conflict_found:
                time_compatible_courses.append(course)
    
    # Separate courses into two categories
    time_and_hour_compatible = []
    time_only_compatible = []
    
    for course in time_compatible_courses:
        if course_duration_hours[course] <= (20 - total_instructor_hours):
            time_and_hour_compatible.append(course)
        else:
            time_only_compatible.append(course)
    
    return time_and_hour_compatible, time_only_compatible


# def create_scheduling_model(instructors, courses, course_duration_hours):
#     # Create the model
#     model = cp_model.CpModel()

#     # a dictionary that will hold all the bool var objects the solver will be working with.
#     assignments = {}
#     for i in instructors:
#         for c in courses:
#             assignments[(i, c)] = model.NewBoolVar(f'{i}_{c}')

#     # Constraint: Each course must be assigned to exactly one instructor
#     for c in courses:
#         model.AddExactlyOne(assignments[(i, c)] for i in instructors)

#     total_cost = 0

#     for i in instructors:
#         # Calculate total hours for this instructor
#         weekly_hours = sum(assignments[(i, c)] * course_duration_hours[c] for c in courses)
        
#         # Deviation variables
#         under_deviation = model.NewIntVar(0, 100, f'under_{i}')
#         over_deviation = model.NewIntVar(0, 100, f'over_{i}')
        
#         # Deviation constraints - I want to keep this visually simple for the prototype but
#         # for the real thing it will make a lot more sense to have escalating punishments for 
#         # deviating more from the 18-20 range so we don't end up with an instructor getting 
#         # 40 hours or something.
#         model.Add(under_deviation >= 18 - weekly_hours)
#         model.Add(over_deviation >= weekly_hours - 20)
        
#         # Add to total cost (going over is twice as bad as going under)
#         total_cost += under_deviation * 1 + over_deviation * 2

#     model.Minimize(total_cost)
    
#     return model, assignments

# this function will save the instructor assignments back to the database if at least a feasible solution is found
def save_instructor_assignments(supabase_client, solver, assignments, sections, status):
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        updated_count = 0

        for section in sections:
            section_id = section['id']

            assigned_instructor = None
            for (section_key, instructor_id), var in assignments.items():
                if section_key == section_id and solver.Value(var):
                    assigned_instructor = instructor_id
                    break
            
            if assigned_instructor:
                response = supabase_client.table("sections").update({"instructor_id": assigned_instructor}).eq("id", section_id).execute()

                updated_count += 1
            
        print(f"Updated {updated_count} section(s) in the database.")

    else:
        print("\nNo feasible solution found.")



    #     for (section_id, instructor_id), var in assignments.items():
    #         if solver.Value(var):
    #             updates.append({
    #                 "id": section_id,
    #                 "instructor_id": instructor_id
    #             })
        
    #     if updates:
    #         response = supabase_client.table("sections").upsert(updates).execute()
    #         print("Supabase response:", response)
    #         print(f"\nUpdated {len(updates)} section(s) in the database.")
    #     else:
    #         print("\nNo assignments to update in the database.")
    # else:
    #     print("\nNo feasible solution found.")


#this function will build the constraint programming model (this version will not incorporate timeslots)
def create_scheduling_model(sections, section_eligibility):
    model = cp_model.CpModel()
    assignments = {}

    #get the eligible instructors for each section and create the variable for the assignments array
    for section in sections:
        section_id = section['id']
        eligible_instructors = section_eligibility.get(section_id, [])

        for instructor in eligible_instructors:
            assignments[(section_id, instructor)] = model.NewBoolVar(f"{section_id}_{instructor}")
        
    # Constraint: only one instructor assigned per section
    for section in sections:
        section_id = section['id']
        eligible_instructors = section_eligibility.get(section_id, [])

        if eligible_instructors:
            model.AddExactlyOne(assignments[(section_id, instructor)] for instructor in eligible_instructors)
        else:
            print(f"No qualified instructors for section {section_id}")
    
    #Constraint: Use numeric weighting system to prioritize sections with smaller number of eligible instructors
    weighted_assignments = []
    for section in sections:
        section_id = section['id']
        eligible_instructors = section_eligibility.get(section_id, [])

        if not eligible_instructors:
            continue
        
        # equation to assign higher numeric weight to sections with less eligible instructors
        weight = 1 / len(eligible_instructors)

        for instructor in eligible_instructors:
            weighted_assignments.append(weight * assignments[(section_id, instructor)])
    
    # think of maximizing like getting to choose a limited amount coins with various values with the goal of getting the most return, so you choose the coins with the highest value first
    model.Maximize(sum(weighted_assignments))
    
    return model, assignments


# def solve_schedule(model, assignments, instructors, courses, course_duration_hours):
#     # Solve the model
#     solver = cp_model.CpSolver()
#     status = solver.Solve(model)

#     # Print results
#     if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
#         print("Solution found")
#         print("Instructor Assignments:")
        
#         for i in instructors:
#             assigned_courses = []
#             total_hours = 0
            
#             for c in courses:
#                 if solver.Value(assignments[(i, c)]):
#                     assigned_courses.append(c)
#                     total_hours += course_duration_hours[c]
            
#             print(f"\n{i}: {total_hours} hours")
#             for course in assigned_courses:
#                 print(f"  - {course} ({course_duration_hours[course]} hours)")
        
#         print(f"\nTotal cost: {solver.ObjectiveValue()}")
        
#     else:
#         print("No solution found!")
        
#     return solver, status

def solve_schedule(model, assignments, sections):
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        print("Solution Found")
        print("\nInstructor Assignments by Section:\n")

        for section in sections:
            section_id = section['id']
            course_id = section['course_id']

            assigned_instructor = None
            for (section_key, instructor) in assignments:
                if section_key == section_id and solver.Value(assignments[(section_key, instructor)]):
                    assigned_instructor = instructor
                    break
            
            if assigned_instructor:
                print(f"Section {section_id} ({course_id}) → Instructor {assigned_instructor}")
            else:
                print(f"No instructor assigned for section {section_id} ({course_id})")

        print(f"\nObjective Value (weighted priority): {solver.ObjectiveValue()}")
    else:
        print("No solution found!")

    return solver, status                


# def main():
#     # Create and solve the initial schedule
#     model, assignments = create_scheduling_model(instructors, courses, course_duration_hours)
#     solver, status = solve_schedule(model, assignments, instructors, courses, course_duration_hours)
    
#     if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
#         return
    
#     # Now, the initial schedule has been created. The ACs review and modify it and submit it
#     # to the OTR team to assign timeslots which we import into the system.
#     # Later, they want to add a section to a course.
    
#     # Generate the time slots
#     time_slots = generate_time_slots(courses, course_duration_hours)
    
#     # Find compatible courses for instructor_1
#     time_and_hour_compatible, time_only_compatible = find_compatible_courses(
#         'instructor_1', courses, time_slots, assignments, solver, course_duration_hours
#     )

#     print("\nCOMPATIBLE (Time and Hours):\n---------------")
#     if time_and_hour_compatible:
#         for course in time_and_hour_compatible:
#             print(f"  - {course} ({course_duration_hours[course]} hours)")
#     else:
#         print("  No courses available that fit both time and hour constraints")

#     print("\nCOMPATIBLE (Time Only - Would Exceed Hour Limit):\n---------------")
#     if time_only_compatible:
#         for course in time_only_compatible:
#             print(f"  - {course} ({course_duration_hours[course]} hours)")
#     else:
#         print("  No courses that fit time-wise but exceed hour limits")

#     print("\nINCOMPATIBLE (Time Conflicts):\n---------------")
#     all_time_compatible = time_and_hour_compatible + time_only_compatible
#     incompatible_courses = [course for course in courses if course not in all_time_compatible]
    
#     # Remove courses already assigned to instructor_1
#     instructor_courses = []
#     for c in courses:
#         if solver.Value(assignments[('instructor_1', c)]):
#             instructor_courses.append(c)
    
#     incompatible_courses = [course for course in incompatible_courses if course not in instructor_courses]
    
#     if incompatible_courses:
#         for course in incompatible_courses:
#             print(f"  - {course} ({course_duration_hours[course]} hours)")
#     else:
        # print("  No courses with time conflicts")


# if __name__ == "__main__":
#     main()

def main(schedule_id):
    # fetch all scheduled courses for this schedule
    scheduled_courses_response = supabase_client.table("scheduled_courses").select("*").eq("schedule_id", schedule_id).execute()
    scheduled_courses = scheduled_courses_response.data

    if not scheduled_courses:
        print(f"No scheduled courses found for schedule {schedule_id}")
        return

    # create sections for each scheduled course
    for scheduled_course in scheduled_courses:
        response = create_sections(scheduled_course)
        #print(f"Inserted sections for course_id {scheduled_course['course_id']}: {response}")


    #get all the sections and instructor qualifications for this schedule
    sections, qualifications = get_sections_and_instructor_qualifications(supabase_client, schedule_id)
    print("Sections:", sections)
    print("Instructor Qualifications:", qualifications)

    if not sections:
        print(f"No sections found for schedule {schedule_id}")
        return

    if not qualifications:
        print("No instructor qualifications found.")
        return
    
    # get instructor eligibility for each section
    section_eligibility = instructor_section_eligibility(sections, qualifications)

    # build the scheduling model 
    model, assignments = create_scheduling_model(sections, section_eligibility)

    # solve the schedule model
    solver, status = solve_schedule(model, assignments, sections)

    # save the assigned instructors to the sections table in supabase
    save_instructor_assignments(supabase_client, solver, assignments, sections, status)
    
if __name__ == "__main__": 
    schedule_id = "baeb5107-e272-4fbf-bb5f-65d3f4f0d5ce" 
    main(schedule_id)


