// Note: Portions of this file were developed with assistance from AI tools for organization, debugging, and code suggestions.
// All architectural decisions and final implementation were done by the developer.

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";
import ACProgramCourses from "../_Components/ACProgramCourses";

export default function ACScheduleManage() {
  const [schedules, setSchedules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState(null);
  const [scheduleAssignments, setScheduleAssignments] = useState({}); // Store assignments by schedule_id
  const router = useRouter();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUser(user.id);
    };
    getCurrentUser();
  }, []);

  // fetch schedules, programs, courses, and scheduled_courses
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        //Fetch schedules for current AC
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("schedules")
          .select("*")
          .eq("academic_chair_id", currentUser)
          .order("academic_year", { ascending: false });
        if (schedulesError) throw schedulesError;

        setSchedules(schedulesData || []);

        //Fetch all programs and filter by current AC
        const { data: allPrograms, error: programsError } = await supabase
          .from("programs")
          .select("*");
        if (programsError) throw programsError;

        const programsData = allPrograms.filter((p) =>
          (p.academic_chair_ids || []).includes(currentUser)
        );
        setPrograms(programsData || []);

        // Fetch courses for assigned programs
        const assignedProgramIds = programsData.map((p) => p.program_id);
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("course_id, program_id")
          .in("program_id", assignedProgramIds);
        if (coursesError) throw coursesError;

        // Fetch scheduled_courses for these schedules
        const scheduleIds = schedulesData.map((s) => s.id);
        const { data: scheduledCourses, error: scheduledError } = await supabase
          .from("scheduled_courses")
          .select("course_id, num_sections, schedule_id")
          .in("schedule_id", scheduleIds);
        if (scheduledError) throw scheduledError;

        // Build assignment map per schedule
        const assignmentsMap = {};
        for (const schedule of schedulesData) {
          const scheduleCourses = scheduledCourses.filter(
            (sc) => sc.schedule_id === schedule.id
          );

          const programAssignments = programsData.map((program) => {
            const programCourses = coursesData.filter(
              (c) => c.program_id === program.program_id
            );
            const totalCourses = programCourses.length;
            const expectedSections = totalCourses * 6; // adjust as needed
            const actualSections = scheduleCourses
              .filter((sc) =>
                programCourses.some((c) => c.course_id === sc.course_id)
              )
              .reduce((sum, sc) => sum + (sc.num_sections || 0), 0);

            return {
              program_id: program.program_id,
              program_name: program.program,
              acronym: program.acronym,
              credential: program.credential,
              total_courses: totalCourses,
              expected_sections: expectedSections,
              actual_sections: actualSections,
              progress_percentage: totalCourses
                ? Math.round((actualSections / expectedSections) * 100)
                : 0,
            };
          });

          assignmentsMap[schedule.id] = programAssignments;
        }
        setScheduleAssignments(assignmentsMap);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Status badge helpers
  const getStatusBadgeStyle = (status, type) => {
    const base = "px-3 py-1 rounded-full text-sm font-medium";
    const map = {
      completion: {
        not_started: "bg-gray-100 text-gray-800",
        in_progress: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
      },
      submission: {
        not_submitted: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
      },
      approval: {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
      },
      timeslots: {
        not_attached: "bg-gray-100 text-gray-800",
        attached: "bg-green-100 text-green-800",
      },
    };
    return `${base} ${map[type]?.[status] || "bg-gray-100 text-gray-800"}`;
  };

  const formatStatusText = (status) =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Handlers for generate/clear/submit/recall schedules
  const handleGenerateSchedules = async () => {
    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ academic_year: parseInt(academicYear) }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate schedules");
      }

      setGenerateMessage({
        type: "success",
        text: `${data.message}. Created: ${data.created}, Skipped: ${data.skipped}`,
      });

      // Refresh schedules list
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .eq("academic_chair_id", currentUser)
        .order("academic_year", { ascending: false });

      setSchedules(schedulesData || []);
    } catch (error) {
      setGenerateMessage({ type: "error", text: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleClearSchedules = async () => {
    if (!confirm("Are you sure you want to delete all schedules?")) return;

    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/clear`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to clear schedules");

      setGenerateMessage({
        type: "success",
        text: `${data.message}. Deleted ${data.deleted_count} schedule(s).`,
      });

      setSchedules([]);
    } catch (error) {
      setGenerateMessage({ type: "error", text: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateModifySchedule = (scheduleId) => {
    router.push(
      `/Frontend/ScheduleManager/NewSchedule?schedule_id=${scheduleId}`
    );
  };

  const handleSubmitSchedule = async (scheduleId) => {
    if (!confirm("Are you sure you want to submit this schedule?")) return;

    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/submit`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to submit schedule");

      setGenerateMessage({ type: "success", text: data.message });

      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .eq("academic_chair_id", currentUser)
        .order("academic_year", { ascending: false });
      setSchedules(schedulesData || []);
    } catch (error) {
      setGenerateMessage({ type: "error", text: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleRecallSchedule = async (scheduleId) => {
    if (!confirm("Are you sure you want to recall this schedule?")) return;

    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/recall`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to recall schedule");

      setGenerateMessage({ type: "success", text: data.message });

      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .eq("academic_chair_id", currentUser)
        .order("academic_year", { ascending: false });
      setSchedules(schedulesData || []);
    } catch (error) {
      setGenerateMessage({ type: "error", text: error.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 px-80">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-xl font-bold text-center mb-4">Manage Schedules</h1>

        {/* Generate / Clear Buttons */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Generate Schedules
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-32"
              placeholder="Year"
            />
            <button
              onClick={handleGenerateSchedules}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generating ? "Generating..." : "Generate Schedules"}
            </button>
            <button
              onClick={handleClearSchedules}
              disabled={generating}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear All Schedules
            </button>
          </div>

          {generateMessage && (
            <div
              className={`mt-3 p-3 rounded-md text-sm ${
                generateMessage.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {generateMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-md p-4 bg-red-50 text-red-700">
          Error loading schedules: {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading schedules...
        </div>
      )}

      {/* Schedule List */}
      {!loading && !error && (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-lg p-6 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Academic Year {schedule.academic_year}
                </h2>
              </div>

              {/* Assigned Programs */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Assigned Programs:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(scheduleAssignments[schedule.id] || []).map((program) => (
                    <span
                      key={program.program_id}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm"
                    >
                      {program.acronym || program.program_name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Courses */}
              <div className="mb-4">
                <ACProgramCourses
                  academicChairId={schedule.academic_chair_id}
                  assignments={scheduleAssignments[schedule.id] || {}}
                />
              </div>

              {/* Status Indicators */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600 block mb-1">
                    Completion Status:
                  </span>
                  <span
                    className={getStatusBadgeStyle(
                      schedule.completion_status,
                      "completion"
                    )}
                  >
                    {formatStatusText(schedule.completion_status)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">
                    Submission Status:
                  </span>
                  <span
                    className={getStatusBadgeStyle(
                      schedule.submission_status,
                      "submission"
                    )}
                  >
                    {formatStatusText(schedule.submission_status)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">
                    Approval Status:
                  </span>
                  <span
                    className={getStatusBadgeStyle(
                      schedule.approval_status,
                      "approval"
                    )}
                  >
                    {formatStatusText(schedule.approval_status)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-600 block mb-1">
                    Time Slots:
                  </span>
                  <span
                    className={getStatusBadgeStyle(
                      schedule.time_slots_attached,
                      "timeslots"
                    )}
                  >
                    {formatStatusText(schedule.time_slots_attached)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleCreateModifySchedule(schedule.id)}
                  className={`button-primary text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    schedule.submission_status === "submitted"
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "hover:bg-red-700"
                  }`}
                >
                  {schedule.submission_status === "submitted"
                    ? "View Schedule (Read-Only)"
                    : "Create/Modify Schedule"}
                </button>

                {schedule.submission_status === "not_submitted" ? (
                  <button
                    onClick={() => handleSubmitSchedule(schedule.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={() => handleRecallSchedule(schedule.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Recall Schedule
                  </button>
                )}
              </div>
            </div>
          ))}

          {schedules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No schedules found. Create a new schedule to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
