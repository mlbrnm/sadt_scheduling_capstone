"use client";
import { useState, useEffect } from "react";

export default function AcademicYearSummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/api/academic-year-summary");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSummaryData(data || []);
      } catch (error) {
        console.error("Error fetching academic year summary:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Helper function to determine progress bar color
  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 67) return "bg-blue-500";
    if (percentage >= 34) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper function to get text color for percentage
  const getProgressTextColor = (percentage) => {
    if (percentage === 100) return "text-green-700";
    if (percentage >= 67) return "text-blue-700";
    if (percentage >= 34) return "text-yellow-700";
    return "text-red-700";
  };

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
          Loading academic year summary...
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

  if (summaryData.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
        No programs found for the current academic year.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Academic Year Scheduling Summary
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Overview of scheduling progress across all programs
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 bg-gray-50 p-2 rounded">
        <span className="font-semibold">Progress:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>0-33%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span>34-66%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>67-99%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>100%</span>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryData.map((program) => (
          <div
            key={program.program_id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Program Header */}
            <div className="mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {program.acronym || "N/A"}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {program.program_name}
                  </p>
                </div>
                {program.credential && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {program.credential}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Scheduling Progress</span>
                <span
                  className={`text-xs font-semibold ${getProgressTextColor(
                    program.progress_percentage
                  )}`}
                >
                  {program.progress_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getProgressColor(
                    program.progress_percentage
                  )}`}
                  style={{ width: `${Math.min(program.progress_percentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Section Stats */}
            <div className="mb-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Sections Assigned:</span>
                <span className="font-medium text-gray-900">
                  {program.actual_sections} / {program.expected_sections}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Total Courses:</span>
                <span className="font-medium text-gray-900">
                  {program.total_courses}
                </span>
              </div>
            </div>

            {/* Academic Chairs */}
            {program.academic_chairs && program.academic_chairs.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Academic Chairs:</div>
                <div className="flex flex-wrap gap-1">
                  {program.academic_chairs.map((chair, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      {chair}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-6 text-sm text-gray-700">
          <span>
            <strong>Total Programs:</strong> {summaryData.length}
          </span>
          <span>
            <strong>Fully Scheduled:</strong>{" "}
            {summaryData.filter((p) => p.progress_percentage === 100).length}
          </span>
          <span>
            <strong>In Progress:</strong>{" "}
            {
              summaryData.filter(
                (p) => p.progress_percentage > 0 && p.progress_percentage < 100
              ).length
            }
          </span>
          <span>
            <strong>Not Started:</strong>{" "}
            {summaryData.filter((p) => p.progress_percentage === 0).length}
          </span>
        </div>
      </div>
    </div>
  );
}
