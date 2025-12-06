"use client";
import React, { useMemo, useState } from "react";

const semester_list = ["winter", "springSummer", "fall"];
const semester_titles = {
  winter: "Winter",
  springSummer: "Spring/Summer",
  fall: "Fall",
};

const maxSections = 6; // sanity cap

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
  addedInstructors = [],
  assignedSections = {},
  addedCoursesBySemester = {},
  sections = [],
  onToggleSection,
  activeSemesters = {},
  rowHeights = {},
  headerHeight = 32,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  // Visible semesters
  const visibleSemesters = semester_list.filter(
    (sem) => activeSemesters?.[sem]
  );
  if (visibleSemesters.length === 0) visibleSemesters.push(...semester_list);

  // Build lookup maps from initial sections
  const byInstructor = useMemo(() => {
    const map = {};
    for (const s of sections || []) {
      if (!s.instructor_id) continue;
      const iid = s.instructor_id;
      const scid = s.scheduled_course_id;
      const letter = s.section_letter;
      if (!map[iid]) map[iid] = {};
      if (!map[iid][scid]) map[iid][scid] = {};
      map[iid][scid][letter] = s;
    }
    return map;
  }, [sections]);

  const coursesWithAdd = (semester) => {
    const courses = (addedCoursesBySemester?.[semester] || []).map(
      (course) => ({
        ...course,
        sectionsCount:
          Math.min(Math.max(course.num_sections || 0, 0), maxSections) || 0,
      })
    );
    courses.push({ __isAdd: true, course_id: `__add-${semester}` });
    return courses;
  };

  const getSectionHours = (instructorId, course, sectionLetter) => {
    const key = `${instructorId}-${course.course_id}-${sectionLetter}`;
    const assignedSec = assignedSections[key];

    if (!assignedSec) return { class: 0, online: 0, total: 0 };

    const ownsClass =
      assignedSec.delivery_mode === "class" ||
      assignedSec.delivery_mode === "both";
    const ownsOnline =
      assignedSec.delivery_mode === "online" ||
      assignedSec.delivery_mode === "both";

    const classHrs = ownsClass ? course.class_hrs || 0 : 0;
    const onlineHrs = ownsOnline ? course.online_hrs || 0 : 0;

    return { class: classHrs, online: onlineHrs, total: classHrs + onlineHrs };
  };
  const handleToggleSection = (
    instructorId,
    course,
    sectionLetter,
    semester,
    mode
  ) => {
    onToggleSection?.(instructorId, course, sectionLetter, semester, mode);
  };

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
    <div className="flex flex-row relative">
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
                <div
                  className="grid h-full"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(
                      course.sectionsCount,
                      1
                    )}, 1fr)`,
                  }}
                >
                  {Array.from(
                    { length: Math.max(course.sectionsCount, 1) },
                    (_, i) => {
                      const bgColor = getSectionBgColor(
                        i,
                        true,
                        course.__isAdd
                      );
                      const inlineStyle = bgColor
                        ? {}
                        : getSectionInlineStyle(i);
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
                    }
                  )}
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
                        gridTemplateColumns: `repeat(${Math.max(
                          course.sectionsCount,
                          1
                        )}, 1fr)`,
                      }}
                    >
                      {Array.from(
                        { length: Math.max(course.sectionsCount, 1) },
                        (_, i) => {
                          const sectionLetter = String.fromCharCode(65 + i);
                          const isAdd = !!course.__isAdd;

                          const {
                            class: ownsClass,
                            online: ownsOnline,
                            total,
                          } = !isAdd
                            ? getSectionHours(
                                instructor.instructor_id,
                                course,
                                sectionLetter
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
                            ? "bg-green-200 hover:bg-green-300 font-semibold cursor-pointer"
                            : ownsAny
                            ? "bg-green-200 hover:bg-green-300 font-semibold cursor-pointer"
                            : `${
                                gradientBgColor || ""
                              } hover:bg-green-100 font-semibold cursor-pointer`;

                          return (
                            <button
                              key={`${instructor.instructor_id}-${course.scheduled_course_id}-${sectionLetter}`}
                              disabled={isAdd}
                              aria-pressed={ownsAny}
                              className={`${baseClasses} ${bgClasses} group`}
                              style={gradientInlineStyle}
                              onClick={(e) => {
                                if (isAdd) return;
                                const mode = e.altKey
                                  ? "class"
                                  : e.shiftKey
                                  ? "online"
                                  : "both";
                                handleToggleSection(
                                  instructor.instructor_id,
                                  course,
                                  sectionLetter,
                                  semester,
                                  mode
                                );
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  instructorId: instructor.instructor_id,
                                  course,
                                  section: sectionLetter,
                                  semester,
                                });
                              }}
                              title={
                                isAdd
                                  ? ""
                                  : `Click to assign Section ${sectionLetter} (${
                                      semester_titles[semester]
                                    }) ${
                                      course.course_code || course.course_id
                                    } to ${
                                      instructor.full_name ||
                                      instructor.instructor_name
                                    }`
                              }
                            >
                              {!isAdd ? label : ""}
                            </button>
                          );
                        }
                      )}
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
              handleToggleSection(
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
              handleToggleSection(
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
