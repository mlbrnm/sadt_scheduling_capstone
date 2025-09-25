"use client";

export default function AssignmentGrid({
  addedInstructors,
  addedCourses,
  assignments,
  onToggleSection,
  workingSemester,
}) {
  const maxSections = 6; // A–F

  const isSectionAssigned = (instructorId, courseId, section) => {
    const key = `${instructorId}-${courseId}`;
    const entry = assignments[key];
    if (!entry) return false;

    const list = entry.sectionsBySemester[workingSemester] || [];
    return list.includes(section);
  };

  if (addedInstructors.length === 0 || addedCourses.length === 0) {
    return (
      <p className="text-gray-500 text-center p-4">
        {addedInstructors.length === 0 ? "Add instructors" : "Add courses"} to
        start assigning sections.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header Row: Section Letters */}
      <div className="flex">
        {addedCourses.map((course) => (
          <div key={course.Course_ID} className="w-36 h-8 grid grid-cols-6">
            {Array.from({ length: maxSections }, (_, i) => (
              <div
                key={i}
                className="text-center text-sm font-semibold bg-gray-100 border"
                title={`${course.Course_Code} * Section ${String.fromCharCode(
                  65 + i
                )}`}
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
          {addedCourses.map((course) => (
            <div key={course.Course_ID} className="w-36 h-9 grid grid-cols-6">
              {Array.from({ length: maxSections }, (_, i) => {
                const section = String.fromCharCode(65 + i);
                const assigned = isSectionAssigned(
                  instructor.Instructor_ID,
                  course.Course_ID,
                  section
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
                        workingSemester
                      )
                    }
                    title={`Click to ${
                      assigned ? "Remove" : "Assign"
                    } Section ${section} (${workingSemester}) from ${
                      instructor.Instructor_Name +
                      " " +
                      instructor.Instructor_LastName
                    } for ${course.Course_Code}`}
                  >
                    {assigned ? `${course.Online + course.Class}h` : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
