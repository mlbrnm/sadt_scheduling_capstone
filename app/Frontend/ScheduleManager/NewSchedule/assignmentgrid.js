"use client";
import { useState, useEffect } from "react";

const semester_list = ["winter", "springSummer", "fall"];
const semester_titles = {
  winter: "Winter",
  springSummer: "Spring/Summer",
  fall: "Fall",
};

const maxSections = 6; // absolute max (A–F)

const getSectionBgColor = (sectionIndex, isHeader = false, isAdd = false) => {
  if (isAdd) return "bg-gray-50 opacity-50";

  const greyValues = [50, 100, 150, 200, 250, 300];
  const greyValue = greyValues[sectionIndex] || 50;

  if (greyValue === 150 || greyValue === 250) return null;

  return isHeader ? `bg-gray-${greyValue}` : `bg-gray-${greyValue}`;
};

const getSectionInlineStyle = (sectionIndex) => {
  const greyValues = [50, 100, 150, 200, 250, 300];
  const greyValue = greyValues[sectionIndex] || 50;

  if (greyValue === 150) return { backgroundColor: "#f1f1f1" };
  if (greyValue === 250) return { backgroundColor: "#d9d9d9" };
  return {};
};

export default function AssignmentGrid({
  addedInstructors,
  addedCoursesBySemester,
  scheduledCourses,
  onToggleSection,
  activeSemesters,
  rowHeights,
  headerHeight,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  // Generate courses with add button for a semester
  const coursesWithAdd = (semester) => [
    ...(addedCoursesBySemester[semester] || []).map((course) => ({
      ...course,
      sectionsCount: course.num_sections ?? maxSections,
    })),
    { __isAdd: true, course_id: `__add-${semester}` },
  ];

  const getSectionHours = (instructorId, course, section, semester) => {
    const key = `${instructorId}-${course.course_id}-${semester}`;
    const sec = scheduledCourses[key]?.sections?.[section] || {};
    const classHrs = course.class_hrs || 0;
    const onlineHrs = course.online_hrs || 0;
    return {
      class: sec.class ? classHrs : 0,
      online: sec.online ? onlineHrs : 0,
      total: (sec.class ? classHrs : 0) + (sec.online ? onlineHrs : 0),
    };
  };

  const visibleSemesters = semester_list.filter(
    (sem) => activeSemesters?.[sem]
  );
  if (visibleSemesters.length === 0) visibleSemesters.push(...semester_list);

  if (
    addedInstructors.length === 0 ||
    Object.values(addedCoursesBySemester).every((c) => c.length === 0)
  ) {
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
        <div key={semester} className="mr-4">
          {/* Header Row */}
          <div className="flex">
            {coursesWithAdd(semester).map((course) => (
              <div
                key={course.course_id}
                className="w-36"
                style={{ height: headerH }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {course.course_code || "New Course"}
                  </span>
                </div>
                <div
                  className="grid h-full"
                  style={{
                    gridTemplateColumns: `repeat(${course.sectionsCount}, 1fr)`,
                  }}
                >
                  {Array.from({ length: course.sectionsCount }, (_, i) => {
                    const bgColor = getSectionBgColor(i, true, course.__isAdd);
                    const inlineStyle = bgColor ? {} : getSectionInlineStyle(i);
                    return (
                      <div
                        key={i}
                        className={`text-center text-sm font-semibold border box-border flex items-center justify-center ${
                          bgColor || ""
                        }`}
                        style={inlineStyle}
                        title={
                          course.__isAdd
                            ? "Add Course to create sections"
                            : `Section ${String.fromCharCode(65 + i)} header`
                        }
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Instructor Rows */}
          {addedInstructors.map((instructor) => {
            const rowH =
              ((rowHeights?.[instructor.instructor_id] ?? 36) | 0) + "px";
            return (
              <div
                key={instructor.instructor_id}
                className="flex items-stretch"
                style={{ height: rowH }}
              >
                {coursesWithAdd(semester).map((course) => (
                  <div key={course.course_id} className="w-36 h-full">
                    <div
                      className="grid h-full"
                      style={{
                        gridTemplateColumns: `repeat(${course.sectionsCount}, 1fr)`,
                      }}
                    >
                      {Array.from({ length: course.sectionsCount }, (_, i) => {
                        const section = String.fromCharCode(65 + i);
                        const isAdd = !!course.__isAdd;
                        const {
                          class: ownsClass,
                          online: ownsOnline,
                          total,
                        } = !isAdd
                          ? getSectionHours(
                              instructor.instructor_id,
                              course,
                              section,
                              semester
                            )
                          : { class: 0, online: 0, total: 0 };
                        const ownsAny = ownsClass || ownsOnline;
                        const ownsBoth = ownsClass && ownsOnline;

                        let label = "";
                        if (!isAdd) {
                          if (ownsBoth) label = `${total}h`;
                          else if (ownsClass) label = `C${ownsClass}h`;
                          else if (ownsOnline) label = `O${ownsOnline}h`;
                        }

                        const baseClasses =
                          "relative border box-border text-[11px] flex items-center justify-center";
                        const gradientBgColor =
                          !ownsAny && !isAdd
                            ? getSectionBgColor(i, false, false)
                            : null;
                        const gradientInlineStyle =
                          gradientBgColor === null && !ownsAny && !isAdd
                            ? getSectionInlineStyle(i)
                            : {};
                        const bgClasses = isAdd
                          ? "bg-gray-50 opacity-50 cursor-not-allowed"
                          : ownsBoth
                          ? "bg-green-200 hover:bg-red-200 font-semibold cursor-pointer"
                          : ownsAny
                          ? "bg-green-200 hover:bg-red-200 font-semibold cursor-pointer"
                          : `${
                              gradientBgColor || ""
                            } hover:bg-green-100 font-semibold cursor-pointer`;

                        return (
                          <button
                            key={section}
                            disabled={isAdd}
                            aria-pressed={ownsAny}
                            className={`${baseClasses} ${bgClasses} group`}
                            style={gradientInlineStyle}
                            onClick={
                              isAdd
                                ? undefined
                                : (e) => {
                                    if (e.altKey)
                                      onToggleSection(
                                        instructor.instructor_id,
                                        course,
                                        section,
                                        semester,
                                        "class"
                                      );
                                    else if (e.shiftKey)
                                      onToggleSection(
                                        instructor.instructor_id,
                                        course,
                                        section,
                                        semester,
                                        "online"
                                      );
                                    else
                                      onToggleSection(
                                        instructor.instructor_id,
                                        course,
                                        section,
                                        semester,
                                        "both"
                                      );
                                  }
                            }
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                instructorId: instructor.instructor_id,
                                course,
                                section,
                                semester,
                              });
                            }}
                            title={
                              isAdd
                                ? ""
                                : `Click to assign Section ${section} (${semester_titles[semester]}) ${course.course_code} to ${instructor.instructor_name} ${instructor.instructor_lastName}.`
                            }
                          >
                            {!isAdd ? label : ""}
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
