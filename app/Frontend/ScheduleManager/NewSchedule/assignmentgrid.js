"use client";
import React, { useState } from "react";

const semester_list = ["winter", "spring", "summer", "fall"];
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
  onToggleSectionAssignment,
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

  // Build course list with sections
  const coursesWithAdd = (semester) => {
    console.log(
      "Semester courses:",
      semester,
      addedCoursesBySemester[semester]
    );

    const courses = (addedCoursesBySemester?.[semester] || []).map(
      (course) => ({
        ...course,
        sectionsCount: Math.min(course.sections?.length || 0, maxSections),
        sections: course.sections?.slice(0, maxSections) || [],
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
                              : `Section ${
                                  course.sections[i] ||
                                  String.fromCharCode(65 + i)
                                } header`
                          }
                        >
                          {course.sections[i] || String.fromCharCode(65 + i)}
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
                      {(course.sections || []).map((sectionLetter, i) => {
                        const scid =
                          course.scheduled_course_id || course.course_id;
                        const key = `${instructor.instructor_id}-${scid}-${sectionLetter}`;
                        const assignedSec = assignedSections[key];
                        const isAssigned = !!assignedSec;
                        const { total: weeklyHrs } = getSectionHours(
                          instructor.instructor_id,
                          course,
                          sectionLetter
                        );
                        const label = weeklyHrs > 0 ? `${weeklyHrs}h` : "";

                        const baseClasses =
                          "relative border box-border text-[11px] flex items-center justify-center";
                        const bgClasses = course.__isAdd
                          ? "bg-gray-50 opacity-50 cursor-not-allowed"
                          : isAssigned
                          ? "bg-green-200 hover:bg-green-300 font-semibold cursor-pointer"
                          : "hover:bg-green-100 font-semibold cursor-pointer";

                        return (
                          <button
                            key={key}
                            disabled={course.__isAdd}
                            aria-pressed={isAssigned}
                            className={`${baseClasses} ${bgClasses}`}
                            onClick={(e) => {
                              if (course.__isAdd) return;
                              const mode = e.altKey
                                ? "class"
                                : e.shiftKey
                                ? "online"
                                : "both";
                              onToggleSectionAssignment(
                                instructor.instructor_id,
                                course,
                                sectionLetter,
                                semester,
                                mode
                              );
                            }}
                            title={`Section ${sectionLetter}, ${weeklyHrs} hrs`}
                          >
                            {label}
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
