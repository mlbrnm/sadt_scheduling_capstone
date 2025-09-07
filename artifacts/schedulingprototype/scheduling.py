from ortools.sat.python import cp_model

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
