const semester_list = ["winter", "springSummer", "fall"];
const semester_titles = {
  winter: "Winter",
  springSummer: "Spring/Summer",
  fall: "Fall",
};

export default function AssignmentGrid({
  addedInstructors,
  addedCoursesBySemester,
  assignments,
  onToggleSection,
  activeSemesters,
}) {
  const maxSections = 6; // A–F

  // Helper function to add sentinel course to end of addedCourses for "+ Add Course" button
  const coursesWithAdd = (semester) => [
    ...(addedCoursesBySemester[semester] || []),
    { __isAdd: true, Course_ID: `__add-${semester}` },
  ];

  // Helper function to check if a section is assigned
  const isSectionAssigned = (instructorId, courseId, section, semester) => {
    const key = `${instructorId}-${courseId}-${semester}`;
    const entry = assignments[key];
    return entry ? entry.sections.includes(section) : false;
  };

  const visibleSemesters = semester_list.filter(
    (sem) => activeSemesters?.[sem]
  );

  if (visibleSemesters.length === 0) {
    return (
      <p className="text-gray-500 text-center p-4">
        Select at least one semester to view and edit sections.
      </p>
    );
  }

  const noCoursesAdded = Object.values(addedCoursesBySemester).every(
    (courses) => courses.length === 0
  );

  if (addedInstructors.length === 0 || noCoursesAdded) {
    return (
      <p className="text-gray-500 text-center p-4">
        {addedInstructors.length === 0 ? "Add Instructor(s)" : "Add Course(s)"}{" "}
        to start assigning sections.
      </p>
    );
  }

  return (
    <div className="flex flex-row">
      {visibleSemesters.map((semester) => (
        <div key={semester}>
          {/* Header Row: Section Letters */}
          <div className="flex">
            {coursesWithAdd(semester).map((course) => (
              <div key={course.Course_ID} className="w-36 h-8 grid grid-cols-6">
                {Array.from({ length: maxSections }, (_, i) => (
                  <div
                    key={i}
                    className={`text-center text-sm font-semibold bg-gray-100 border ${
                      course.__isAdd ? "bg-gray-50 opacity-50" : "bg-gray-100"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Instructor Rows */}
          {addedInstructors.map((instructor) => (
            <div key={instructor.Instructor_ID} className="flex items-center">
              {coursesWithAdd(semester).map((course) => (
                <div
                  key={course.Course_ID}
                  className="w-36 h-9 grid grid-cols-6"
                >
                  {Array.from({ length: maxSections }, (_, i) => {
                    const section = String.fromCharCode(65 + i);
                    const assigned = course.__isAdd
                      ? false
                      : isSectionAssigned(
                          instructor.Instructor_ID,
                          course.Course_ID,
                          section,
                          semester
                        );
                    return (
                      <div
                        key={section}
                        role={course.__isAdd ? undefined : "button"}
                        aria-disabled={course.__isAdd ? true : undefined}
                        aria-pressed={course.__isAdd ? undefined : assigned}
                        className={`text-center cursor-pointer text-sm border ${
                          course.__isAdd
                            ? "bg-gray-50 opacity-50 pointer-events-none"
                            : assigned
                            ? "bg-green-200 font-semibold "
                            : "bg-gray-50 hover:bg-green-100"
                        }`}
                        onClick={
                          course.__isAdd
                            ? undefined
                            : () =>
                                onToggleSection(
                                  instructor.Instructor_ID,
                                  course,
                                  section,
                                  semester
                                )
                        }
                        title={
                          course.__isAdd
                            ? "Add Course to create sections"
                            : `Click to ${
                                assigned ? "Remove" : "Assign"
                              } Section ${section} (${
                                semester_titles[semester]
                              }) from ${instructor.Instructor_Name} ${
                                instructor.Instructor_LastName
                              } for ${course.Course_Code}`
                        }
                      >
                        {course.__isAdd
                          ? ""
                          : assigned
                          ? `${(course.Online || 0) + (course.Class || 0)}h`
                          : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
