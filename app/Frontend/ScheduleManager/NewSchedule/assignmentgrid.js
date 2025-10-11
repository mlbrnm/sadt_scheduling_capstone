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
  rowHeights,
  headerHeight,
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

  const headerH = ((headerHeight ?? 32) | 0) + "px";

  return (
    <div className="flex flex-row">
      {visibleSemesters.map((semester) => (
        <div key={semester}>
          {/* Header Row: Section Letters */}
          <div className="flex">
            {coursesWithAdd(semester).map((course) => (
              <div
                key={course.Course_ID}
                className="w-36"
                style={{ height: headerH }}
              >
                <div className="grid grid-cols-6 h-full">
                  {Array.from({ length: maxSections }, (_, i) => (
                    <div
                      key={i}
                      className={`text-center text-sm font-semibold border box-border flex items-center justify-center ${
                        course.__isAdd ? "bg-gray-50 opacity-50" : "bg-gray-100"
                      }`}
                      title={
                        course.__isAdd
                          ? "Add Course to create sections"
                          : `Section ${String.fromCharCode(65 + i)} header`
                      }
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Instructor Rows */}
          {addedInstructors.map((instructor) => {
            const h =
              ((rowHeights?.[instructor.Instructor_ID] ?? 36) | 0) + "px";
            return (
              <div
                key={instructor.Instructor_ID}
                className="flex items-stretch"
                style={{ height: h }}
              >
                {coursesWithAdd(semester).map((course) => (
                  <div key={course.Course_ID} className="w-36 h-full">
                    <div className="grid grid-cols-6 h-full">
                      {Array.from({ length: maxSections }, (_, i) => {
                        const section = String.fromCharCode(65 + i);
                        const assigned =
                          !course.__isAdd &&
                          isSectionAssigned(
                            instructor.Instructor_ID,
                            course.Course_ID,
                            section,
                            semester
                          );
                        const hours =
                          (course?.Online_hrs || 0) + (course?.Class_hrs || 0);

                        return (
                          <button
                            key={section}
                            disabled={!!course.__isAdd}
                            aria-pressed={assigned}
                            className={`border box-border text-sm flex items-center justify-center cursor-pointer ${
                              course.__isAdd
                                ? "bg-gray-50 opacity-50 cursor-default"
                                : assigned
                                ? "bg-green-200 font-semibold"
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
                                  }) for ${instructor.Instructor_Name} ${
                                    instructor.Instructor_LastName
                                  } for ${course.Course_Code}`
                            }
                          >
                            {course.__isAdd ? "" : assigned ? `${hours}h` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
