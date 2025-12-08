"use client";
import React, { useMemo, useState, useEffect } from "react";

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
    const scid = course.scheduled_course_id || course.course_id;
    const key = `${instructorId}-${scid}-${sectionLetter}`;
    const assignedSec = assignedSections[key];

    if (!assignedSec) return { class: 0, online: 0, total: 0 };

    // Use existing hours if they exist (preloaded assignment)
    if (
      typeof assignedSec.class_hrs === "number" &&
      typeof assignedSec.online_hrs === "number"
    ) {
      return {
        class: assignedSec.class_hrs,
        online: assignedSec.online_hrs,
        total: assignedSec.class_hrs + assignedSec.online_hrs,
      };
    }

    // Fallback: calculate from course hours and delivery_mode
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

  const headerH = ((headerHeight ?? 32) | 0) + "px";

  console.log("assignedSections", assignedSections);
  console.log("addedInstructors", addedInstructors);
  console.log("addedCoursesBySemester", addedCoursesBySemester);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // useEffect(() => {
  //   console.log("=== SANITY CHECK ===");
  //   console.log(
  //     "addedInstructors:",
  //     addedInstructors.map((i) => i.instructor_id)
  //   );
  //   console.log("addedCoursesBySemester:", Object.keys(addedCoursesBySemester));

  //   const allKeys = [];
  //   Object.entries(addedCoursesBySemester).forEach(([semester, courses]) => {
  //     courses.forEach((course) => {
  //       const scid = course.scheduled_course_id || course.course_id;
  //       const sectionsCount = course.num_sections || 1;
  //       for (let i = 0; i < sectionsCount; i++) {
  //         const sectionLetter = String.fromCharCode(65 + i);
  //         addedInstructors.forEach((instr) => {
  //           allKeys.push(`${instr.instructor_id}-${scid}-${sectionLetter}`);
  //         });
  //       }
  //     });
  //   });
  //   console.log("Expected assignedSections keys:", allKeys);

  //   console.log("Actual assignedSections keys:", Object.keys(assignedSections));
  //   console.log("Assigned sections data:", assignedSections);
  // }, [addedInstructors, addedCoursesBySemester, assignedSections]);

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
                          const scid =
                            course.scheduled_course_id || course.course_id;
                          const key = `${instructor.instructor_id}-${scid}-${sectionLetter}`;

                          // Check assignment
                          const assignedSec = assignedSections[key];
                          const isAssigned = !!assignedSec;
                          const assignedMode = assignedSec?.delivery_mode;

                          // Determine label
                          const { total: weeklyHrs } = getSectionHours(
                            instructor.instructor_id,
                            course,
                            sectionLetter
                          );
                          const label = weeklyHrs > 0 ? `${weeklyHrs}h` : "";
                          // Classes for button
                          const baseClasses =
                            "relative border box-border text-[11px] flex items-center justify-center";
                          const bgClasses = isAdd
                            ? "bg-gray-50 opacity-50 cursor-not-allowed"
                            : isAssigned
                            ? "bg-green-200 hover:bg-green-300 font-semibold cursor-pointer"
                            : "hover:bg-green-100 font-semibold cursor-pointer";

                          return (
                            <button
                              key={`${instructor.instructor_id}-${scid}-${sectionLetter}`}
                              disabled={isAdd}
                              aria-pressed={isAssigned}
                              className={`${baseClasses} ${bgClasses}`}
                              onClick={(e) => {
                                if (isAdd) return;
                                const mode = e.altKey
                                  ? "class"
                                  : e.shiftKey
                                  ? "online"
                                  : "both";
                                onToggleSection(
                                  instructor.instructor_id,
                                  course,
                                  sectionLetter,
                                  semester,
                                  mode
                                );
                              }}
                              title={JSON.stringify(
                                {
                                  instructor: instructor.instructor_id,
                                  course:
                                    course.course_code || course.course_id,
                                  section_id: scid,
                                  section: sectionLetter,
                                  assigned: !!assignedSec,
                                  mode: assignedSec?.delivery_mode || "none",
                                  weekly_hours: assignedSec?.weekly_hours || 0,
                                  class_hours: assignedSec?.class_hrs || 0,
                                  online_hours: assignedSec?.online_hrs || 0,
                                },
                                null,
                                2
                              )}
                            >
                              {label}
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
    </div>
  );
}
