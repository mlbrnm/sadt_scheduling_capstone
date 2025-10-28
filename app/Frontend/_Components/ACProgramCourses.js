"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ACProgramCourses({ academicChairId }) {
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

  // Get courses for a specific program
  const getCoursesForProgram = (programId) => {
    return courses.filter((course) => course.program_id === programId);
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
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Programs & Courses
      </h3>
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

              {/* Courses List */}
              {isExpanded && (
                <div className="bg-white p-3">
                  {programCourses.length > 0 ? (
                    <div className="space-y-2">
                      {programCourses.map((course) => (
                        <div
                          key={course.course_id}
                          className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {course.course_code}
                            </div>
                            <div className="text-xs text-gray-600">
                              {course.course_name}
                            </div>
                            {course.credits && (
                              <div className="text-xs text-gray-500 mt-1">
                                Credits: {course.credits}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
