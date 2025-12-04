"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ACProgramCourses({ academicChairId }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [sectionsData, setSectionsData] = useState({});

  useEffect(() => {
    if (!academicChairId) {
      return setLoading(false);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch schedules for this AC
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("schedules")
          .select("*")
          .eq("academic_chair_id", academicChairId);

        if (schedulesError) throw schedulesError;

        if (!schedulesData?.length) {
          setPrograms([]);
          return;
        }

        const scheduleIds = schedulesData.map((s) => s.id);

        // Fetch scheduled courses with course info
        const { data: scheduledData, error: scheduledError } = await supabase
          .from("scheduled_courses")
          .select(
            `
            *,
            courses (
              course_id,
              course_code,
              course_name,
              credits,
              program_id
            )
          `
          )
          .in("schedule_id", scheduleIds);

        if (scheduledError) throw scheduledError;

        if (!scheduledData?.length) {
          setPrograms([]);
          return;
        }

        // Fetch sections data to determine instructor assignments
        const { data: sectionsDataRaw, error: sectionsError } = await supabase
          .from("sections")
          .select("id, schedule_id, course_id, term, instructor_id")
          .in("schedule_id", scheduleIds);

        if (sectionsError) throw sectionsError;

        // Build a map of sections grouped by scheduled_course_id + term
        const sectionsMap = {};
        if (sectionsDataRaw) {
          sectionsDataRaw.forEach((section) => {
            const key = `${section.schedule_id}_${section.course_id}_${section.term}`;
            if (!sectionsMap[key]) {
              sectionsMap[key] = {
                total: 0,
                withInstructor: 0,
              };
            }
            sectionsMap[key].total++;
            if (section.instructor_id !== null) {
              sectionsMap[key].withInstructor++;
            }
          });
        }
        setSectionsData(sectionsMap);

        // Fetch all program names for mapping
        const { data: programsData, error: programsError } = await supabase
          .from("programs")
          .select("program_id, program");

        if (programsError) throw programsError;

        const programNameMap = {};
        programsData.forEach((p) => {
          programNameMap[p.program_id] = p.program;
        });

        // Map programs to scheduled courses
        const programMap = {};
        scheduledData.forEach((sc) => {
          const course = sc.courses;

          if (course?.program_id && !programMap[course.program_id]) {
            programMap[course.program_id] = {
              program_id: course.program_id,
              program_name:
                programNameMap[course.program_id] || course.program_id,
              courses: [],
            };
          }
          if (course && course.program_id) {
            programMap[course.program_id].courses.push(sc);
          }
        });

        const finalPrograms = Object.values(programMap);
        setPrograms(finalPrograms);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academicChairId]);

  const toggleProgram = (programId) => {
    setExpandedPrograms((prev) => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  const getRelevantSemesters = (scheduledCourse) => {
    const terms = scheduledCourse.term || "";
    const semesters = [];
    if (terms.toLowerCase().includes("winter"))
      semesters.push({ key: "Winter", label: "W" });
    if (terms.toLowerCase().includes("spring"))
      semesters.push({ key: "Spring", label: "S" });
    if (terms.toLowerCase().includes("fall"))
      semesters.push({ key: "Fall", label: "F" });
    return semesters;
  };

  const getScheduledCourseStatus = (scheduledCourse, termKey) => {
    // Build key to look up sections data
    const key = `${scheduledCourse.schedule_id}_${scheduledCourse.course_id}_${termKey}`;
    const sectionInfo = sectionsData[key];

    // Case 1: No sections exist for this course
    if (!sectionInfo || sectionInfo.total === 0) {
      return { status: "no_sections", total: 0, withInstructor: 0 };
    }

    // Case 2: Sections exist
    const total = sectionInfo.total;
    const withInstructor = sectionInfo.withInstructor;

    // All sections have instructors
    if (withInstructor === total && total > 0) {
      return { status: "complete", total, withInstructor };
    }
    // Some sections have instructors
    else if (withInstructor > 0) {
      return { status: "partial", total, withInstructor };
    }
    // No sections have instructors
    else {
      return { status: "unassigned", total, withInstructor };
    }
  };

  if (!academicChairId) return null;

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center text-gray-600">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading programs and scheduled courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
        No scheduled courses for this academic chair.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Programs & Scheduled Courses
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>{" "}
            <span>No sections / No instructors</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>{" "}
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>{" "}
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {programs.map((program) => {
          const isExpanded = expandedPrograms[program.program_id];
          return (
            <div
              key={program.program_id}
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <button
                onClick={() => toggleProgram(program.program_id)}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">
                    {program.program_name}
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    {program.courses.length} course
                    {program.courses.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-blue-700 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="bg-white p-3">
                  {program.courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {program.courses.map((sc) => {
                        const course = sc.courses;
                        const semesters = getRelevantSemesters(sc);
                        return (
                          <div
                            key={sc.scheduled_course_id}
                            className="p-2 bg-gray-50 rounded border border-gray-200"
                          >
                            <div className="font-medium text-sm text-gray-900">
                              {course.course_code}
                            </div>
                            <div className="text-xs text-gray-600 line-clamp-2">
                              {course.course_name}
                            </div>
                            {course.credits && (
                              <div className="text-xs text-gray-500 mt-1">
                                Credits: {course.credits}
                              </div>
                            )}

                            <div className="flex items-center gap-1 mt-2">
                              {semesters.map((sem) => {
                                const statusInfo = getScheduledCourseStatus(
                                  sc,
                                  sem.key
                                );
                                
                                let dotColor = "bg-gray-400";
                                let tooltipText = "";
                                
                                if (statusInfo.status === "no_sections") {
                                  dotColor = "bg-gray-400";
                                  tooltipText = `${sem.label}: Admin has not yet assigned sections`;
                                } else if (statusInfo.status === "complete") {
                                  dotColor = "bg-green-400";
                                  tooltipText = `${sem.label}: Complete (${statusInfo.withInstructor}/${statusInfo.total} sections assigned)`;
                                } else if (statusInfo.status === "partial") {
                                  dotColor = "bg-yellow-400";
                                  tooltipText = `${sem.label}: Partial (${statusInfo.withInstructor}/${statusInfo.total} sections assigned)`;
                                } else {
                                  // unassigned - sections exist but no instructors
                                  dotColor = "bg-gray-400";
                                  tooltipText = `${sem.label}: No instructors assigned (0/${statusInfo.total} sections)`;
                                }
                                
                                return (
                                  <div
                                    key={sem.key}
                                    className="flex items-center gap-0.5"
                                    title={tooltipText}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-full ${dotColor}`}
                                    ></div>
                                    <span className="text-xs text-gray-500">
                                      {sem.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No scheduled courses for this program.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
