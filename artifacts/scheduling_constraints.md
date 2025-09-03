1. **All course sections must have an instructor.** - HARD
2. **An instructor cannot teach multiple overlapping sections.** - HARD
3. **All instructors should be qualified to teach the courses.** - HARD
3. All instructors should have 18-20 instructional hours per week. - SOFT
4. All instructors should have less than 615 (specific number depends on the instructor contract type) hours per academic year. - SOFT
5. Priority should be given to assign instructors to courses that they want to teach or have taught before. - SOFT
6. *Might be some rules about breaks between courses or number of instructional hours in a day as well?*

## Notes:

We will need to use the CP-SAT solver from OR-Tools. This is a tool used for solving "constraint programming" problems, which is basically where instead of using traditional strict conditional logic, your goal is instead to find ideal and/or feasible solutions to meet a set of constraints.

Guide: https://developers.google.com/optimization/cp/cp_solver

Detailed Docs: https://github.com/google/or-tools/tree/stable/ortools/sat/docs

Principles:

1. There are hard constraints and soft constraints, a hard constraint must not be violated. A soft constraint can be violated, but doing so incurs a "cost".
2. The goal of the solver is to find a solution which meets all the hard constraints, and minimizes (or maximizes) the "cost" of the soft violations.
3. Everything has to be an integer I guess. So if we have decimal values involved we'll have to multiply them by 10/100 or whatever to eliminate the decimal, and the timeslots will require something like storing them as "minutes from the start of the week" or something, which actually seems like a good way to do it in general when we are working with schedules that are anchored to the day of the week.

### Basic overview:
```python
from ortools.sat.python import cp_model
```

**Step 1. Initialize the solver.**

Just initializing an instance of the constraint solver model.

```python
model = cp_model.CpModel()
```

**Step 2. Create a boolean for every possible combination of an instructor and section.**

(During this loop, we will do the initial filtering to exclude instructors that are unrelated to a specific program or unqualfied to teach a course. That is necesarry to fulfill the desired business logic and will improve performance since we are eliminating a bunch of impossible assignments before they are processed by the solver.)

Each of these booleans is basically saying "Will this instructor teach this section at this time?" I imagine we will end up with millions of these permutations when using the real data.

That'll look like this kind of thing, but with the desired conditions added so we don't bother trying to add sections for instructors that can't teach them:

```python
assignments = {} # a dictionary that will hold all the bool var objects the solver will be working with.
for i in instructors:
  for s in sections:
    for t in time_slots:
      assignments[(i, s, t)] = model.NewBoolVar(f'{i}_{s}_{t}') # creates the object which represents a specific possible combination of instructor/section/timesot, and adds it to the dictionary
                                                                # the formatted string is apparently basically for debugging and represents the name of the variable
```

**Step 2. Create all the constraints.**

Here are some examples:

1. All sections must have an instructor.
```python
for s in sections:
    for t in time_slots:
        # for this specific timeslot of this specific section, exactly one instructor must be true (which means it is assigned)
        model.AddExactlyOne( # generator expression inside the AddExactlyOne statement
            assignments[(i, s, t)] for i in instructors if (i, s, t) in assignments # need the if statement to make sure we don't try to do one of the impossible combinations we elininated in Step 2.
        )
```



# It was at this point in my research that I realized the above is flawed because sections have multiple timeslots, not just one, so it'll need to be a bit different. I also realized I should go to bed for now.

# I also just realized that I need to keep in mind that there are sort of two situations we need to account for (and more if you include the certificate scheduling):
## 1 - creating a fresh schedule. Timeslots don't matter here, we're only concerned with qualifications, instructional hours, and ensuring every section has an instructor.
## 2 - modifying a schedule. At this point we will have timeslots, and need the system to be able to recommend instructors to fill an empty section, or sections to fill an empty instructor.
