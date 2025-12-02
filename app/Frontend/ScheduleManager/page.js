"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";

export default function ScheduleManager() {
  const router = useRouter();
  const [schedulesData, setSchedulesData] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [searchParams, setSearchParams] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [scheduleToReject, setScheduleToReject] = useState(null);

  // Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch schedules from API on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/list`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedules from server");
        }

        const data = await response.json();
        setSchedulesData(data.schedules || []);
      } catch (error) {
        setError("Failed to fetch schedules: " + error.message);
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Helper function to get submission status priority
  const getStatusPriority = (status) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return 1;
      case "recalled":
        return 2;
      case "approved":
        return 3;
      case "rejected":
        return 4;
      case "not submitted":
        return 5;
      default:
        return 6;
    }
  };

  // Sorting the schedules
  const sortData = (data, option) => {
    if (!option) return data;
    else {
      switch (option) {
        case "newest":
          return [...data].sort(
            (a, b) => new Date(b.date_submitted) - new Date(a.date_submitted)
          );
        case "oldest":
          return [...data].sort(
            (a, b) => new Date(a.date_submitted) - new Date(b.date_submitted)
          );
        case "title-a":
          return [...data].sort((a, b) => a.title.localeCompare(b.title));
        case "title-z":
          return [...data].sort((a, b) => b.title.localeCompare(a.title));
        case "program":
          return [...data].sort((a, b) => {
            const programA = a.programs[0] || "";
            const programB = b.programs[0] || "";
            return programA.localeCompare(programB);
          });
        case "status":
          return [...data].sort((a, b) => a.status.localeCompare(b.status));
        default:
          return data;
      }
    }
    
    // Then apply primary sort by submission status priority
    sortedData.sort((a, b) => {
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);
      return priorityA - priorityB;
    });
    
    return sortedData;
  };

  // Searching
  const search = (data, params) => {
    if (!params) return data;
    else {
      const lowercasedParams = params.toLowerCase();
      return data.filter(
        (item) =>
          item.title.toLowerCase().includes(lowercasedParams) ||
          item.status.toLowerCase().includes(lowercasedParams) ||
          item.programs.some((p) => p.toLowerCase().includes(lowercasedParams))
      );
    }
  };

  // Handle sort
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchParams(e.target.value);
  };

  // Get chip colour based on program type, status
  // Status colour conditional rendering
  const getStatusColour = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "chip-approved pl-2 pr-3 py-1.5 rounded border border-1 text-justify-center";
      case "submitted":
        return "chip-submitted px-2 py-1.5 rounded border border-1 text-justify-center";
      case "recalled":
        return "chip-inreview pl-2 pr-4 py-1.5 rounded border border-1 text-justify-center";
      case "rejected":
        return "chip-rejected pl-2 pr-6 py-1.5 rounded border border-1 text-justify-center";
      default:
        return "px-2 py-1.5 rounded border border-1 text-justify-center";
    }
  };

  // Display sorted/searched data
  let displayedData = schedulesData;
  if (searchParams) {
    displayedData = search(schedulesData, searchParams);
  }
  if (sortOption) {
    displayedData = sortData(displayedData, sortOption);
  }

  // Format date to dd/mm/yyyy
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle View button click
  const handleView = (scheduleId) => {
    router.push(
      `/Frontend/ScheduleManager/NewSchedule?schedule_id=${scheduleId}`
    );
  };

  // Handle Approve button click
  const handleApprove = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to approve this schedule?")) {
      return;
    }

    setError(null);
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/${scheduleId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_user_id: currentUserId,
            comment: null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve schedule");
      }

      setSuccessMessage("Schedule approved successfully!");

      // Refresh the schedules list
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/list`
      );
      const refreshData = await refreshResponse.json();
      setSchedulesData(refreshData.schedules || []);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      setError("Failed to approve schedule: " + error.message);
      console.error("Error approving schedule:", error);
    }
  };

  // Handle Reject button click - show modal
  const handleRejectClick = (schedule) => {
    setScheduleToReject(schedule);
    setRejectionComment("");
    setShowRejectModal(true);
  };

  // Handle Reject modal submit
  const handleRejectSubmit = async () => {
    if (!rejectionComment.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    setError(null);
    setSuccessMessage("");
    setShowRejectModal(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/${scheduleToReject.schedule_id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_user_id: currentUserId,
            comment: rejectionComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject schedule");
      }

      setSuccessMessage(
        `Schedule rejected successfully. Academic chair has been notified.`
      );

      // Refresh the schedules list
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schedules/list`
      );
      const refreshData = await refreshResponse.json();
      setSchedulesData(refreshData.schedules || []);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      setError("Failed to reject schedule: " + error.message);
      console.error("Error rejecting schedule:", error);
    }
  };

  // Handle Reject modal cancel
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectionComment("");
    setScheduleToReject(null);
  };

  return (
    <div className="p-8">
      {/* Filter/Sort & Search */}
      <div className="flex flex-row items-center justify-center gap-10 pb-8">
        {/* Filter/Sort Container */}
        <div className="text-lg text-bold flex items-center gap-1">
          Sort by
          <select
            className="px-3 py-2 mx-3 background-primary rounded-lg border border-tertiary focus:outline-offset-1 focus:outline-2 focus:border-tertiary w-xs text-gray-500"
            onChange={handleSortChange}
            value={sortOption}
          >
            <option value="newest" className="text-primary">
              Date Submitted, newest
            </option>
            <option value="oldest" className="text-primary">
              Date Submitted, oldest
            </option>
            <option value="title-a" className="text-primary">
              Title, A-Z
            </option>
            <option value="title-z" className="text-primary">
              Title, Z-A
            </option>
            <option value="program" className="text-primary">
              Program
            </option>
            <option value="status" className="text-primary">
              Status
            </option>
          </select>
        </div>
        {/* Search */}
        <div className="text-lg text-bold flex items-center gap-1">
          Search
          <input
            type="text"
            placeholder="Enter search criteria (e.g. keyword, status...)"
            className="px-3 py-2 ml-3 background-primary rounded-lg border border-tertiary focus:outline-offset-1 focus:outline-2 focus:border-tertiary w-3xl"
            value={searchParams}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-3"
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
          Loading schedules...
        </div>
      )}

      {/* Table Container */}
      <div className="bg-gray-100 m-0 rounded-lg shadow-md">
        <div className="h-[calc(100vh-269px)] overflow-y-auto overflow-x-hidden">
          <table className="table-auto min-w-full">
            <thead className="bg-gray-300 sticky top-0">
              <tr className="grid grid-cols-5 gap-8 py-3 text-left font-sm pl-6">
                <th>Date Submitted</th>
                <th>Title</th>
                <th>Program(s)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No schedules found.
                  </td>
                </tr>
              ) : (
                displayedData.map((schedule, index) => (
                  <tr
                    key={index}
                    className="grid grid-cols-5 gap-8 py-3 border-b pl-6"
                  >
                    <td className="mt-1 self-center">
                      {formatDate(schedule.date_submitted)}
                    </td>
                    <td className="mt-1 self-center">{schedule.title}</td>
                    <td className="mt-1 self-center">
                      {schedule.programs.length > 0 ? (
                        schedule.programs.map((program, idx) => (
                          <div key={idx}>{program}</div>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">
                          No programs
                        </span>
                      )}
                    </td>
                    <td className="mt-1.5 self-center">
                      <span className={getStatusColour(schedule.status)}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="flex gap-2 self-center">
                      <button
                        className="button-primary text-white px-4 py-1.5 rounded hover:button-hover active:button-clicked"
                        onClick={() => handleView(schedule.schedule_id)}
                      >
                        View
                      </button>
                      {schedule.status === "Submitted" && (
                        <>
                          <button
                            className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 active:bg-green-800"
                            onClick={() => handleApprove(schedule.schedule_id)}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 active:bg-red-800"
                            onClick={() => handleRejectClick(schedule)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Reject Schedule</h2>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting this schedule. The academic
              chair will receive this feedback.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-offset-1 focus:outline-2 focus:border-tertiary"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleRejectSubmit}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
