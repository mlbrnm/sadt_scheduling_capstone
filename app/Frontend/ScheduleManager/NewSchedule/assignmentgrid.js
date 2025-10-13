"use client";
import { useState, useEffect } from "react";

const semester_list = ["winter", "springSummer", "fall"];
const semester_titles = {
  winter: "Winter",
  springSummer: "Spring/Summer",
  fall: "Fall",
};
const maxSections = 6; // A–F

export default function AssignmentGrid({
  addedInstructors,
  addedCoursesBySemester,
  assignments,
  onToggleSection,
  activeSemesters,
  rowHeights,
  headerHeight,
}) {
  // contextMenu = { x, y, instructorId, courseId, section, semester } or null
  const [contextMenu, setContextMenu] = useState(null);

  // useEffect to listen for outside clicks (close context menu on any window click)
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Helper function to add sentinel course to end of addedCourses for "+ Add Course" button
  const coursesWithAdd = (semester) => [
    ...(addedCoursesBySemester[semester] || []),
    { __isAdd: true, Course_ID: `__add-${semester}` },
  ];

  // Helper function to check if an instructor owns class or online of a course section
  const owns = (instructorId, courseId, section, semester, comp) => {
    const key = `${instructorId}-${courseId}-${semester}`;
    const sec = assignments[key]?.sections?.[section];
    return !!sec?.[comp];
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
            const rowH =
              ((rowHeights?.[instructor.Instructor_ID] ?? 36) | 0) + "px";
            return (
              <div
                key={instructor.Instructor_ID}
                className="flex items-stretch"
                style={{ height: rowH }}
              >
                {coursesWithAdd(semester).map((course) => {
                  const classHrs = course.Class_hrs || 0;
                  const onlineHrs = course.Online_hrs || 0;
                  const totalHrs = classHrs + onlineHrs;
                  return (
                    <div key={course.Course_ID} className="w-36 h-full">
                      <div className="grid grid-cols-6 h-full">
                        {Array.from({ length: maxSections }, (_, i) => {
                          const section = String.fromCharCode(65 + i);
                          const isAdd = !!course.__isAdd;
                          const ownsClass =
                            !isAdd &&
                            owns(
                              instructor.Instructor_ID,
                              course.Course_ID,
                              section,
                              semester,
                              "class"
                            );
                          const ownsOnline =
                            !isAdd &&
                            owns(
                              instructor.Instructor_ID,
                              course.Course_ID,
                              section,
                              semester,
                              "online"
                            );
                          const ownsAny = ownsClass || ownsOnline;
                          const ownsBoth = ownsClass && ownsOnline;
                          let label = "";
                          if (!isAdd) {
                            if (ownsBoth) {
                              label = `${totalHrs}h`;
                            } else if (ownsClass) {
                              label = `C${classHrs}h`;
                            } else if (ownsOnline) {
                              label = `O${onlineHrs}h`;
                            } else {
                              label = "";
                            }
                          }
                          const baseClasses =
                            "relative border box-border text-[11px] flex items-center justify-center";
                          const bgClasses = isAdd
                            ? "bg-gray-50 opacity-50 cursor-not-allowed"
                            : ownsBoth
                            ? "bg-green-200 hover:bg-red-200 font-semibold cursor-pointer"
                            : ownsAny
                            ? "bg-green-200 hover:bg-red-200 font-semibold cursor-pointer"
                            : "bg-gray-50 hover:bg-green-100 font-semibold cursor-pointer";

                          return (
                            <button
                              key={section}
                              disabled={isAdd}
                              aria-pressed={ownsAny}
                              className={`${baseClasses} ${bgClasses} group`}
                              onClick={
                                isAdd
                                  ? undefined
                                  : (e) => {
                                      if (e.altKey) {
                                        onToggleSection(
                                          instructor.Instructor_ID,
                                          course,
                                          section,
                                          semester,
                                          "class"
                                        );
                                      } else if (e.shiftKey) {
                                        onToggleSection(
                                          instructor.Instructor_ID,
                                          course,
                                          section,
                                          semester,
                                          "online"
                                        );
                                      } else {
                                        onToggleSection(
                                          instructor.Instructor_ID,
                                          course,
                                          section,
                                          semester,
                                          "both"
                                        );
                                      }
                                    }
                              }
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  instructorId: instructor.Instructor_ID,
                                  course,
                                  section,
                                  semester,
                                });
                              }}
                              title={
                                isAdd
                                  ? "Add Course to create sections"
                                  : `Click to assign Section ${section} (${semester_titles[semester]}) ${course.Course_Code} to ${instructor.Instructor_Name} ${instructor.Instructor_LastName}.
                                  `
                              }
                            >
                              {/* Main Label */}
                              {!isAdd ? label : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="absolute bg-white border rounded shadow-lg text-sm z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full px-3 py-1 rounded text-left hover:bg-gray-100"
            onClick={() => {
              onToggleSection(
                contextMenu.instructorId,
                contextMenu.course,
                contextMenu.section,
                contextMenu.semester,
                "class"
              );
              setContextMenu(null);
            }}
          >
            Toggle Class
          </button>
          <button
            className="block w-full px-3 py-1 rounded text-left hover:bg-gray-100"
            onClick={() => {
              onToggleSection(
                contextMenu.instructorId,
                contextMenu.course,
                contextMenu.section,
                contextMenu.semester,
                "online"
              );
              setContextMenu(null);
            }}
          >
            Toggle Online
          </button>
        </div>
      )}
    </div>
  );
}
