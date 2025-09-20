"use client";
import { useState, useEffect } from "react";

export default function AssignmentGrid({ addedInstructors, addedCourses }) {
  const [assignments, setAssignments] = useState({});
  const maxSections = 6; // A–F

  // Toggle section assignment
  const toggleSection = (instructorId, course, section) => {
    const key = `${instructorId}-${course.Course_ID}`;
    const hoursPerSection = (course.Class || 0) + (course.Online || 0);

    // Update assignments state
    setAssignments((prev) => {
      const current = prev[key] || { sections: [], totalHours: 0 };

      let updatedSections;
      if (current.sections.includes(section)) {
        // remove if already assigned
        updatedSections = current.sections.filter((s) => s !== section);
      } else {
        // add new section
        updatedSections = [...current.sections, section];
      }

      return {
        ...prev,
        [key]: {
          sections: updatedSections,
          totalHours: updatedSections.length * hoursPerSection,
        },
      };
    });
  };

  const isSectionAssigned = (instructorId, courseId, section) => {
    const key = `${instructorId}-${courseId}`;
    return assignments[key]?.sections.includes(section);
  };

  // Clean up assignments if instructors or courses are removed
  useEffect(() => {
    setAssignments((prev) => {
      const validInstructorIds = addedInstructors.map((i) => i.Instructor_ID);
      const validCourseIds = addedCourses.map((c) => c.Course_ID);

      // Create a new assignments object with only valid keys
      const updatedAssignments = {};

      // Loop through keys in previous state and updateAssignments to include only the ones still in the addedInstructors and addedCourses
      for (const key in prev) {
        const [instructorId, courseId] = key.split("-");

        if (
          validInstructorIds.includes(parseInt(instructorId)) &&
          validCourseIds.includes(courseId)
        ) {
          updatedAssignments[key] = prev[key];
        }
      }
      return updatedAssignments;
    });
  }, [addedInstructors, addedCourses]);

  return (
    <div>
      {addedInstructors.length === 0 || addedCourses.length === 0 ? (
        <p className="text-gray-500 text-center p-4">
          {addedInstructors.length === 0 ? "Add instructors" : "Add courses"} to
          start assigning sections.
        </p>
      ) : (
        <div className="flex flex-col">
          {/* Header Row: Section Letters */}
          <div className="flex">
            {addedCourses.map((course) => (
              <div key={course.Course_ID} className="w-36 h-8 grid grid-cols-6">
                {Array.from({ length: maxSections }, (_, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-semibold bg-gray-100 border"
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
                <div
                  key={course.Course_ID}
                  className="w-36 h-9 grid grid-cols-6"
                >
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
                        className={`text-center cursor-pointer text-sm border ${
                          assigned ? "bg-green-200 font-semibold" : "bg-gray-50"
                        }`}
                        onClick={() =>
                          toggleSection(
                            instructor.Instructor_ID,
                            course,
                            section
                          )
                        }
                        title={`Click to ${
                          assigned ? "remove" : "assign"
                        } section ${section}`}
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
      )}
    </div>
  );
}
