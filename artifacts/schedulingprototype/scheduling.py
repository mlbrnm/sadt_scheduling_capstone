from ortools.sat.python import cp_model
import random

# Test Data
instructors = ['instructor_1', 'instructor_2', 'instructor_3', 'instructor_4', 'instructor_5', 'instructor_6', 'instructor_7', 'instructor_8', 'instructor_9']

# used AI to generate most of these, prompt:
# ------------------------------------------------------------------------------------------
# courses = [
#    'Object Oriented Programming 1',
#    'Database Design', 
#    'Web Development',
#    'Technical Communication',
#    'Data Structures',
#    'Network Systems',
#    'Mathematics',
#    'Machine Learning'
# ]
#
# course_duration_hours = {
#    'Object Oriented Programming 1': 4,
#    'Database Design': 3,
#    'Web Development': 5,
#    'Technical Communication': 4,
#    'Data Structures': 4,
#    'Network Systems': 5,
#    'Mathematics': 3,
#    'Machine Learning': 4
# }
#
# Please extend these lists with additional fake data, about quadruple the amount.
# ------------------------------------------------------------------------------------------

courses = [
    'Object Oriented Programming 1',
    'Database Design', 
    'Web Development',
    'Technical Communication',
    'Data Structures',
    'Network Systems',
    'Mathematics',
    'Machine Learning',
    'Object Oriented Programming 2',
    'Advanced Database Design',
    'Frontend Web Development',
    'Professional Technical Communication',
    'Advanced Data Structures',
    'Network Security',
    'Discrete Mathematics',
    'Deep Learning',
    'Software Engineering Principles',
    'Cloud Infrastructure',
    'Mobile App Development',
    'Agile Methodology',
    'Computer Architecture',
    'Distributed Systems',
    'Calculus II',
    'Natural Language Processing',
    'Object Oriented Programming 3',
    'Database Administration',
    'Backend Web Development',
    'Scientific Communication',
    'Algorithm Design',
    'Wireless Networks',
    'Linear Algebra',
    'Reinforcement Learning',
    'Software Testing',
    'Big Data Analytics',
    'DevOps Practices',
    'Project Management',
    'Operating Systems',
    'Cryptography',
    'Probability Theory',
    'Computer Vision'
]

course_duration_hours = {
    'Object Oriented Programming 1': 4,
    'Database Design': 3,
    'Web Development': 5,
    'Technical Communication': 4,
    'Data Structures': 4,
    'Network Systems': 5,
    'Mathematics': 3,
    'Machine Learning': 4,
    'Object Oriented Programming 2': 4,
    'Advanced Database Design': 4,
    'Frontend Web Development': 5,
    'Professional Technical Communication': 3,
    'Advanced Data Structures': 5,
    'Network Security': 4,
    'Discrete Mathematics': 3,
    'Deep Learning': 5,
    'Software Engineering Principles': 4,
    'Cloud Infrastructure': 5,
    'Mobile App Development': 4,
    'Agile Methodology': 3,
    'Computer Architecture': 4,
    'Distributed Systems': 5,
    'Calculus II': 4,
    'Natural Language Processing': 5,
    'Object Oriented Programming 3': 4,
    'Database Administration': 3,
    'Backend Web Development': 5,
    'Scientific Communication': 4,
    'Algorithm Design': 4,
    'Wireless Networks': 5,
    'Linear Algebra': 3,
    'Reinforcement Learning': 4,
    'Software Testing': 3,
    'Big Data Analytics': 5,
    'DevOps Practices': 4,
    'Project Management': 3,
    'Operating Systems': 5,
    'Cryptography': 4,
    'Probability Theory': 3,
    'Computer Vision': 5
}


def minutes_to_time(minutes):
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day = minutes // 1440
    time_in_day = minutes % 1440
    hours = time_in_day // 60
    minutes = time_in_day % 60
    return f"{days[day]} {hours:02d}:{minutes:02d}"


def generate_time_slots(courses, course_durations):
    time_slots = {}
    
    for course in courses:
        duration_minutes = course_durations[course] * 60
        
        # Generate a random day (0-6 for Monday-Friday)
        day = random.randint(0, 4)
        
        # Generate a random start time between 8:00 AM and 6:00 PM (in minutes)
        # 8:00 AM = 480 minutes, 6:00 PM = 1080 minutes
        start_time_minutes = random.randint(480, 1080)
        
        # Calculate total minutes from start of week
        total_start_minutes = day * 1440 + start_time_minutes
        total_end_minutes = total_start_minutes + duration_minutes
        
        time_slots[course] = (total_start_minutes, total_end_minutes)
        print(course, ":", minutes_to_time(total_start_minutes), "-", minutes_to_time(total_end_minutes))
    return time_slots


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


def create_scheduling_model(instructors, courses, course_duration_hours):
    # Create the model
    model = cp_model.CpModel()

    # a dictionary that will hold all the bool var objects the solver will be working with.
    assignments = {}
    for i in instructors:
        for c in courses:
            assignments[(i, c)] = model.NewBoolVar(f'{i}_{c}')

    # Constraint: Each course must be assigned to exactly one instructor
    for c in courses:
        model.AddExactlyOne(assignments[(i, c)] for i in instructors)

    total_cost = 0

    for i in instructors:
        # Calculate total hours for this instructor
        weekly_hours = sum(assignments[(i, c)] * course_duration_hours[c] for c in courses)
        
        # Deviation variables
        under_deviation = model.NewIntVar(0, 100, f'under_{i}')
        over_deviation = model.NewIntVar(0, 100, f'over_{i}')
        
        # Deviation constraints - I want to keep this visually simple for the prototype but
        # for the real thing it will make a lot more sense to have escalating punishments for 
        # deviating more from the 18-20 range so we don't end up with an instructor getting 
        # 40 hours or something.
        model.Add(under_deviation >= 18 - weekly_hours)
        model.Add(over_deviation >= weekly_hours - 20)
        
        # Add to total cost (going over is twice as bad as going under)
        total_cost += under_deviation * 1 + over_deviation * 2

    model.Minimize(total_cost)
    
    return model, assignments


def solve_schedule(model, assignments, instructors, courses, course_duration_hours):
    # Solve the model
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    # Print results
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print("Solution found")
        print("Instructor Assignments:")
        
        for i in instructors:
            assigned_courses = []
            total_hours = 0
            
            for c in courses:
                if solver.Value(assignments[(i, c)]):
                    assigned_courses.append(c)
                    total_hours += course_duration_hours[c]
            
            print(f"\n{i}: {total_hours} hours")
            for course in assigned_courses:
                print(f"  - {course} ({course_duration_hours[course]} hours)")
        
        print(f"\nTotal cost: {solver.ObjectiveValue()}")
        
    else:
        print("No solution found!")
        
    return solver, status


def main():
    # Create and solve the initial schedule
    model, assignments = create_scheduling_model(instructors, courses, course_duration_hours)
    solver, status = solve_schedule(model, assignments, instructors, courses, course_duration_hours)
    
    if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
        return
    
    # Now, the initial schedule has been created. The ACs review and modify it and submit it
    # to the OTR team to assign timeslots which we import into the system.
    # Later, they want to add a section to a course.
    
    # Generate the time slots
    time_slots = generate_time_slots(courses, course_duration_hours)
    
    # Find compatible courses for instructor_1
    time_and_hour_compatible, time_only_compatible = find_compatible_courses(
        'instructor_1', courses, time_slots, assignments, solver, course_duration_hours
    )

    print("\nCOMPATIBLE (Time and Hours):\n---------------")
    if time_and_hour_compatible:
        for course in time_and_hour_compatible:
            print(f"  - {course} ({course_duration_hours[course]} hours)")
    else:
        print("  No courses available that fit both time and hour constraints")

    print("\nCOMPATIBLE (Time Only - Would Exceed Hour Limit):\n---------------")
    if time_only_compatible:
        for course in time_only_compatible:
            print(f"  - {course} ({course_duration_hours[course]} hours)")
    else:
        print("  No courses that fit time-wise but exceed hour limits")

    print("\nINCOMPATIBLE (Time Conflicts):\n---------------")
    all_time_compatible = time_and_hour_compatible + time_only_compatible
    incompatible_courses = [course for course in courses if course not in all_time_compatible]
    
    # Remove courses already assigned to instructor_1
    instructor_courses = []
    for c in courses:
        if solver.Value(assignments[('instructor_1', c)]):
            instructor_courses.append(c)
    
    incompatible_courses = [course for course in incompatible_courses if course not in instructor_courses]
    
    if incompatible_courses:
        for course in incompatible_courses:
            print(f"  - {course} ({course_duration_hours[course]} hours)")
    else:
        print("  No courses with time conflicts")


if __name__ == "__main__":
    main()
