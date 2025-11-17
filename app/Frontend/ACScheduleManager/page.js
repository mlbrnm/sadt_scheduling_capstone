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
  const router = useRouter();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch schedules and programs
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch schedules for the current academic chair
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("schedules")
          .select("*")
          .eq("academic_chair_id", currentUser)
          .order("academic_year", { ascending: false });

        if (schedulesError) throw schedulesError;

        // Fetch all programs and filter by UUID in academic_chair field
        const { data: allPrograms, error: programsError } = await supabase
          .from("programs")
          .select("*");

        if (programsError) throw programsError;

        // Filter programs where the academic_chair field contains this user's UUID
        const programsData = allPrograms.filter((program) => {
          const academicChairField = program.academic_chair || "";
          return academicChairField.includes(currentUser);
        });

        setSchedules(schedulesData || []);
        setPrograms(programsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Get status badge styling
  const getStatusBadgeStyle = (status, type) => {
    const baseStyle = "px-3 py-1 rounded-full text-sm font-medium";

    if (type === "completion") {
      if (status === "not_started") {
        return `${baseStyle} bg-gray-100 text-gray-800`;
      } else if (status === "in_progress") {
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      } else if (status === "completed") {
        return `${baseStyle} bg-green-100 text-green-800`;
      }
    } else if (type === "submission") {
      if (status === "not_submitted") {
        return `${baseStyle} bg-gray-100 text-gray-800`;
      } else if (status === "submitted") {
        return `${baseStyle} bg-blue-100 text-blue-800`;
      }
    } else if (type === "approval") {
      if (status === "pending") {
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      } else if (status === "approved") {
        return `${baseStyle} bg-green-100 text-green-800`;
      } else if (status === "rejected") {
        return `${baseStyle} bg-red-100 text-red-800`;
      }
    } else if (type === "timeslots") {
      if (status === "not_attached") {
        return `${baseStyle} bg-gray-100 text-gray-800`;
      } else if (status === "attached") {
        return `${baseStyle} bg-green-100 text-green-800`;
      }
    }

    return `${baseStyle} bg-gray-100 text-gray-800`;
  };

  // Format status text for display
  const formatStatusText = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Generate schedules handler
  const handleGenerateSchedules = async () => {
    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch("http://localhost:5000/admin/schedules/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ academic_year: parseInt(academicYear) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate schedules");
      }

      setGenerateMessage({
        type: "success",
        text: `${data.message}. Created: ${data.created}, Skipped: ${data.skipped}`,
      });

      // Refresh the schedules list
      if (!currentUser) return;
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .eq("academic_chair_id", currentUser)
        .order("academic_year", { ascending: false });
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error("Error generating schedules:", error);
      setGenerateMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  // Clear all schedules function for debugging purposes
  const handleClearSchedules = async () => {
    if (!confirm("Are you sure you want to delete all the schedules?")) {
      return;
    }

    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch("http://localhost:5000/admin/schedules/clear", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete schedules");
      }

      setGenerateMessage({
        type: "success",
        text: `${data.message}. Deleted ${data.deleted_count} schedule(s).`,
      });

      // Refresh schedules list
      setSchedules([]);
    } catch (error) {
      console.error("Error clearing schedules:", error);
      setGenerateMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  // Navigate to NewSchedule page with schedule_id
  const handleCreateModifySchedule = (scheduleId) => {
    // OLD CODE - keeping for reference:
    // console.log("Create/Modify schedule:", scheduleId);
    
    router.push(`/Frontend/ScheduleManager/NewSchedule?schedule_id=${scheduleId}`);
  };

  const handleSubmitSchedule = async (scheduleId) => {
    if (!confirm("Are you sure you want to submit this schedule? You will need to recall it to make further changes.")) {
      return;
    }

    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch(`http://localhost:5000/schedules/${scheduleId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit schedule");
      }

      setGenerateMessage({
        type: "success",
        text: data.message,
      });

      // Refresh the schedules list
      if (!currentUser) return;
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .eq("academic_chair_id", currentUser)
        .order("academic_year", { ascending: false });
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error("Error submitting schedule:", error);
      setGenerateMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRecallSchedule = async (scheduleId) => {
    if (!confirm("Are you sure you want to recall this schedule? This will allow you to make changes again.")) {
      return;
    }

    try {
      setGenerating(true);
      setGenerateMessage(null);

      const response = await fetch(`http://localhost:5000/schedules/${scheduleId}/recall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to recall schedule");
      }

      setGenerateMessage({
        type: "success",
        text: data.message,
      });

      // Refresh the schedules list
      if (!currentUser) return;
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .eq("academic_chair_id", currentUser)
        .order("academic_year", { ascending: false });
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error("Error recalling schedule:", error);
      setGenerateMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 px-80">
      {/* Header Section */}
      <div className="flex flex-col mb-6">
        <h1 className="text-xl font-bold text-center mb-4">
          Manage Schedules
        </h1>
        
        {/* Debug: Generate Schedules */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Debug: Generate Schedules
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md p-4 bg-red-50 text-red-700">
          Error loading schedules: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading schedules...
        </div>
      )}

      {/* Schedules List */}
      {!loading && !error && (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-lg p-6 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              {/* Academic Year Header */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Academic Year {schedule.academic_year}
                </h2>
              </div>

              {/* Programs Section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Assigned Programs:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {programs.length > 0 ? (
                    programs.map((program) => (
                      <span
                        key={program.program_id}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm"
                      >
                        {program.acronym || program.program}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No programs assigned
                    </span>
                  )}
                </div>
              </div>

              {/* Programs & Courses Detail */}
              <div className="mb-4">
                <ACProgramCourses academicChairId={schedule.academic_chair_id} />
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
                  className={`button-primary text-white px-4 py-2 rounded-lg font-medium transition-colors ${
                    schedule.submission_status === "submitted"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "hover:bg-red-700 cursor-pointer"
                  }`}
                  disabled={schedule.submission_status === "submitted"}
                >
                  {schedule.submission_status === "submitted" ? "Schedule Locked" : "Create/Modify Schedule"}
                </button>
                
                {schedule.submission_status === "not_submitted" ? (
                  <button
                    onClick={() => handleSubmitSchedule(schedule.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={schedule.completion_status !== "completed"}
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

          {/* If no schedules */}
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
