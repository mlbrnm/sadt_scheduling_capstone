"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ACProgramCourses({ academicChairId, assignments = {} }) {
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrograms, setExpandedPrograms] = useState({});

  useEffect(() => {
    if (!academicChairId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all programs
        const { data: allPrograms, error: programsError } = await supabase
          .from("programs")
          .select("*");

        if (programsError) throw programsError;

        // Filter programs where academic_chair CSV contains this UUID
        const filteredPrograms = allPrograms.filter((program) => {
          const academicChairField = program.academic_chair || "";
          return academicChairField.includes(academicChairId);
        });

        setPrograms(filteredPrograms);

        // If we have programs, fetch courses for those programs
        if (filteredPrograms.length > 0) {
          const programIds = filteredPrograms.map((p) => p.program_id);

          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select("*")
            .in("program_id", programIds);

          if (coursesError) throw coursesError;

          setCourses(coursesData || []);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching programs/courses:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academicChairId]);

  // Toggle program expansion
  const toggleProgram = (programId) => {
    setExpandedPrograms((prev) => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  // Get courses for a specific program, sorted alphabetically by course name
  const getCoursesForProgram = (programId) => {
    return courses
      .filter((course) => course.program_id === programId)
      .sort((a, b) => {
        const nameA = (a.course_name || "").toLowerCase();
        const nameB = (b.course_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  };

  // Helper function to get relevant semesters for a program based on intakes
  const getRelevantSemesters = (program) => {
    const intakes = program.intakes || "";
    const semesters = [];
    
    if (intakes.includes("Winter")) {
      semesters.push({ key: "winter", label: "W" });
    }
    if (intakes.includes("Spring")) {
      semesters.push({ key: "springSummer", label: "S" });
    }
    if (intakes.includes("Fall")) {
      semesters.push({ key: "fall", label: "F" });
    }
    
    return semesters;
  };

  // Helper function to get assignment status for a course in a specific semester
  // Returns: 'unassigned' (grey), 'partial' (yellow), or 'complete' (green)
  const getCourseAssignmentStatus = (courseId, semester) => {
    const cId = String(courseId);
    const expectedSections = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Track which sections are fully assigned (both class and online)
    const courseSections = {};
    
    for (const [key, value] of Object.entries(assignments)) {
      const parts = key.split("-");
      if (parts.length < 3) continue;
      
      const [, ...rest] = parts;
      const sem = rest[rest.length - 1];
      const assignedCourseId = rest.slice(0, -1).join("-");
      
      if (assignedCourseId !== cId || sem !== semester) continue;

      const sections = value?.sections || {};
      for (const [sectionLetter, sectionData] of Object.entries(sections)) {
        if (!courseSections[sectionLetter]) {
          courseSections[sectionLetter] = { class: false, online: false };
        }
        if (sectionData.class) courseSections[sectionLetter].class = true;
        if (sectionData.online) courseSections[sectionLetter].online = true;
      }
    }

    // Count how many sections are fully assigned (both class and online)
    let fullyAssignedCount = 0;
    let partiallyAssignedCount = 0;
    
    for (const sectionLetter of expectedSections) {
      const sectionData = courseSections[sectionLetter];
      if (sectionData) {
        if (sectionData.class && sectionData.online) {
          fullyAssignedCount++;
        } else if (sectionData.class || sectionData.online) {
          partiallyAssignedCount++;
        }
      }
    }

    // Determine status
    if (fullyAssignedCount === 6) {
      return 'complete'; // All 6 sections fully assigned
    } else if (fullyAssignedCount > 0 || partiallyAssignedCount > 0) {
      return 'partial'; // Some sections assigned
    } else {
      return 'unassigned'; // No sections assigned
    }
  };

  if (!academicChairId) {
    return null;
  }
  // I used AI to do the styling and layout and loading states for this component. Prompt:
  // "Add a loading spinner and dropdown chevron using Tailwind and SVGs."
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
          Loading programs and courses...
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
        No programs assigned to this academic chair.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Programs & Courses
        </h3>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>No assignments</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Partial (1-5 sections)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Complete (6/6 sections)</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {programs.map((program) => {
          const programCourses = getCoursesForProgram(program.program_id);
          const isExpanded = expandedPrograms[program.program_id];

          return (
            <div
              key={program.program_id}
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              {/* Program Header */}
              <button
                onClick={() => toggleProgram(program.program_id)}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">
                    {program.acronym || program.program}
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    {programCourses.length} course{programCourses.length !== 1 ? "s" : ""}
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

              {/* Courses List - Grid Layout */}
              {isExpanded && (
                <div className="bg-white p-3">
                  {programCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {programCourses.map((course) => {
                        const relevantSemesters = getRelevantSemesters(program);
                        
                        return (
                          <div
                            key={course.course_id}
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
                            {/* Assignment Status Dots */}
                            {relevantSemesters.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                {relevantSemesters.map((semester) => {
                                  const status = getCourseAssignmentStatus(
                                    course.course_id,
                                    semester.key
                                  );
                                  const dotColor =
                                    status === 'complete'
                                      ? 'bg-green-400'
                                      : status === 'partial'
                                      ? 'bg-yellow-400'
                                      : 'bg-gray-400';
                                  
                                  return (
                                    <div
                                      key={semester.key}
                                      className="flex items-center gap-0.5"
                                      title={`${semester.label === 'W' ? 'Winter' : semester.label === 'S' ? 'Spring/Summer' : 'Fall'}: ${status === 'complete' ? 'Complete (6/6)' : status === 'partial' ? 'Partial (1-5)' : 'No assignments'}`}
                                    >
                                      <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                                      <span className="text-xs text-gray-500">{semester.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No courses found for this program.
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
