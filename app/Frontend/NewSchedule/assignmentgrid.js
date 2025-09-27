"use client";

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

  const isSectionAssigned = (instructorId, courseId, section, semester) => {
    const key = `${instructorId}-${courseId}`;
    const entry = assignments[key];
    if (!entry) return false;
    const list = entry.sectionsBySemester?.[semester] || [];
    return list.includes(section);
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
        {addedInstructors.length === 0 ? "Add instructors" : "Add courses"} to
        start assigning sections.
      </p>
    );
  }

  return (
    <div className="flex flex-row">
      {visibleSemesters.map((semester) => (
        <div key={semester}>
          {/* Header Row: Section Letters */}
          <div className="flex">
            {(addedCoursesBySemester[semester] || []).map((course) => (
              <div key={course.Course_ID} className="w-36 h-8 grid grid-cols-6">
                {Array.from({ length: maxSections }, (_, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-semibold bg-gray-100 border"
                    title={`${
                      course.Course_Code
                    } * Section ${String.fromCharCode(65 + i)} (${
                      semester_titles[semester]
                    })`}
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
              {(addedCoursesBySemester[semester] || []).map((course) => (
                <div
                  key={course.Course_ID}
                  className="w-36 h-9 grid grid-cols-6"
                >
                  {Array.from({ length: maxSections }, (_, i) => {
                    const section = String.fromCharCode(65 + i);
                    const assigned = isSectionAssigned(
                      instructor.Instructor_ID,
                      course.Course_ID,
                      section,
                      semester
                    );
                    return (
                      <div
                        key={section}
                        role="button"
                        aria-pressed={assigned}
                        className={`text-center cursor-pointer text-sm border ${
                          assigned ? "bg-green-200 font-semibold" : "bg-gray-50"
                        }`}
                        onClick={() =>
                          onToggleSection(
                            instructor.Instructor_ID,
                            course,
                            section,
                            semester
                          )
                        }
                        title={`Click to ${
                          assigned ? "Remove" : "Assign"
                        } Section ${section} (${
                          semester_titles[semester]
                        }) from ${
                          instructor.Instructor_Name +
                          " " +
                          instructor.Instructor_LastName
                        } for ${course.Course_Code}`}
                      >
                        {assigned
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
