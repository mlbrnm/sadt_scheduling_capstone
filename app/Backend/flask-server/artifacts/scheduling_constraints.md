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
4. When we write the constraints, we are not actually working with real integers. They're all weird expression objects that the solver uses to do the minimization. For example, when we're adding up the weekly hours for the instructors with `total_hours = sum(weekly_hours)`, it's not adding a bunch of integers together. It is adding a bunch of expression objects together. This means you have to do things weirdly and can't do usual imperative programming things like accumulating integers in a loop.

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

**Step 3. Create all the constraints.**

Here are some examples:

1. All sections must have an instructor - an example of a hard constraint.
```python
for s in sections:
    for t in time_slots:
        # for this specific timeslot of this specific section, exactly one instructor must be true (which means it is assigned)
        model.AddExactlyOne( # generator expression inside the AddExactlyOne statement
            assignments[(i, s, t)] for i in instructors if (i, s, t) in assignments # need the if statement to make sure we don't try to do one of the impossible combinations we elininated in Step 2.
        )
```
2. Instructors should have 18-20 instructional hours per week - an example of a soft constraint.
```python
for i in instructors:
  weekly_hours = [] # this isn't a list of integers, it's a list of expressions
  for s in sections:
    if (i, s) in assignments:
      weekly_hours.append(assignments[(i, s)] * section_duration_hours[s]) # assignments[x] will be 1 if it is assigned, 0 if not as previously discussed
  total_hours = sum(weekly_hours) # summing up expressions, not integers

# now for some more strange constraint programming fun:
# again, we cannot be working with real integers here and just increment the cost, because it's all expressions

under_deviation = model.NewIntVar(0, 100, f'under_{i}') # 0 is lower bound, 100 is upper bound, string is the debug name
over_deviation = model.NewIntVar(0, 100, f'over_{i})

# these are sort of like if statements in constraint programming. The model is set to minimize so these will basically be 0 if it's ideal, and get further from 0 the more the hours differ from the ideal.
model.Add(under_deviation >= 18 - total_hours)  # Will be 0 if total_hours >= 18
model.Add(over_deviation >= total_hours - 20)   # Will be 0 if total_hours <= 20

total_hour_cost += under_deviation
total_hour_cost += over_deviation
```

**Step 4. Create a variable to hold the "cost" of the schedule which we want to minimize.**

Violating our soft constraints will incur a cost. We can manipulate the costs to change the weighting of things. For example, if the goal is to have 18-20 instructional hours per instructor per week, we'd want a schedule that resulted in an instructor having only 12 hours per week (unacceptable) to be much "costlier" than 17 hours (not ideal, but tolerable). And if these instructional hour constraints take precedence over instructor preference for courses, we might multiply all the instructional hour related costs by 2 so they factor into the calculation more than the preference costs.

Note that this is STILL a wacky expression, not an integer.

```python
cost = total_hour_cost + other_hypothetical_soft_constraint * 2 + anotha_one * 3 # we can still change the weighting here by multiplying
```

**Step 5. Tell the model we're trying to minimize the cost.**

It still hasn't run, we're just telling it what its supposed to do.

```python
model.Minimize(total_cost)
```

**Step 6. Initialize the solver.**
```python
solver = cp_model.CpSolver()
```

**Step 7. Run the solver with the model.**
```python
status = solver.Solve(model)
```

The return value of the Solve() method is OPTIMAL, FEASIBLE

## Prototype:

Create an example with fake hardcoded data for the following use cases:

1. Optimal initial schedule generation using OR-Tools.
2. Modifying a schedule - find teachers available to fill a section.
3. Modifying a schedule - show sections an instructor is available to fill.

Present in a table somewhat similar to our final goal design.

Data Incorporated:
1. Instructors with just first name, last name, list of qualified courses.
2. Courses with timeslots (I'll ignore sections for now.)
3. Timeslots with days, start time, end time.

## Notes As I Continue To Learn This:
* I don't think we actually need the OR-Tools solver for our later modifications to schedules, only the initial optimization. The later modifications can just be done with normal filters to flag/highlight available instructors/sections.
