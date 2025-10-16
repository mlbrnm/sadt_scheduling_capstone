"use client";
import { useState } from "react";
import mockdata from "./mockdata.json";
import { getUtilizationColor } from "../../_Utils/utilizationColorsUtil";

const tableHeaders = [
  "ID",
  "Name",
  "Contract",
  "Semester Hours",
  "Total Hours",
  "Status",
];
const mockSemesters = ["Fall 2025", "Spring 2025", "Summer 2025"];

export default function InstructorWorkload() {
  const [searchInstructor, setSearchInstructor] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hoursFilter, setHoursFilter] = useState("All");
  const [instructorWorkloadData, setInstructorWorkloadData] =
    useState(mockdata);
  const [selectedSemester, setSelectedSemester] = useState("Fall 2025");

  // Filter the list of instructors
  const filteredInstructors = instructorWorkloadData.filter((instructor) => {
    // Filter by searching name
    const name =
      instructor.instructor_name + " " + instructor.instructor_lastName;
    const matchesName = name
      .toLowerCase()
      .includes(searchInstructor.toLowerCase());

    // Filter by searching ID
    const matchesID = instructor.instructor_id
      .toString()
      .includes(searchInstructor);

    // Filter by status
    const matchesStatus =
      statusFilter === "All" || instructor.instructor_status === statusFilter;

    // Filter by hours
    let matchesHours = true;
    if (hoursFilter === "hasRemaining") {
      const yearlyMax = instructor.contract_type === "Casual" ? 800 : 615;
      matchesHours = instructor.total_hours < yearlyMax;
    }

    return (matchesID || matchesName) && matchesStatus && matchesHours;
  });

  // Summary details
  const totalInstructors = instructorWorkloadData.length;
  const underUtilized = instructorWorkloadData.filter(
    (instructor) =>
      instructor.total_hours <
      (instructor.contract_type === "Casual" ? 480 : 369)
  ).length;
  const overUtilized = instructorWorkloadData.filter(
    (instructor) =>
      instructor.total_hours >=
        (instructor.contract_type === "Casual" ? 480 : 369) &&
      instructor.total_hours <
        (instructor.contract_type === "Casual" ? 800 : 615)
  ).length;
  const overMaxHours = instructorWorkloadData.filter(
    (instructor) =>
      instructor.total_hours >=
      (instructor.contract_type === "Casual" ? 800 : 615)
  ).length;
  const onLeave = instructorWorkloadData.filter(
    (instructor) => instructor.instructor_status === "On Leave"
  ).length;

  return (
    <div className="p-4">
      {/* Filter + Main Content Container */}
      <div className="flex flex-row">
        {/* Filter Container */}
        <div className="flex flex-col gap-2 p-4 bg-white rounded-lg w-60 h-60 mt-29 mr-4">
          {/* Status filter */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-700 mb-1">
              Availability:
            </legend>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="status-all"
                  name="status-filter"
                  type="radio"
                  checked={statusFilter === "All"}
                  onChange={() => setStatusFilter("All")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="status-all"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show All Instructors
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="status-active"
                  name="status-filter"
                  type="radio"
                  checked={statusFilter === "Active"}
                  onChange={() => setStatusFilter("Active")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="status-active"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show Active Instructors
                </label>
              </div>
            </div>
          </fieldset>
          {/* Hours filter */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-700 mb-1">
              Hours:
            </legend>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="hours-all"
                  name="hours-filter"
                  type="radio"
                  checked={hoursFilter === "All"}
                  onChange={() => setHoursFilter("All")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="hours-all"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show All Instructors
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="hours-remaining"
                  name="hours-filter"
                  type="radio"
                  checked={hoursFilter === "hasRemaining"}
                  onChange={() => setHoursFilter("hasRemaining")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="hours-remaining"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show Instructors With Remaining Hours
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Main Content Container */}
        <div className="flex-1">
          {/* Semester & Program Data */}
          <div className="flex flex-row items-baseline justify-between">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-md"
            >
              {mockSemesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
            <div className="mb-2">
              <h2>Semester: {selectedSemester} | Program: SD</h2>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex justify-center my-2">
            <input
              type="text"
              placeholder="Search Instructors by Name or ID..."
              className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-xs"
              value={searchInstructor}
              onChange={(e) => setSearchInstructor(e.target.value)}
            />
          </div>

          {/* Summary */}
          <div className="flex gap-6 mb-2 text-sm font-bold text-gray-700">
            <span>Total Instructors: {totalInstructors}</span>
            <span>Under Utilized: {underUtilized}</span>
            <span>Over Utilized: {overUtilized}</span>
            <span>Over Max Hours: {overMaxHours}</span>
            <span>On Leave: {onLeave}</span>
          </div>

          {/* Instructor Table */}
          <div className="bg-white rounded-lg overflow-auto max-h-125">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-black">
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor.instructor_id}>
                    <td className="px-6 py-4 text-sm">
                      {instructor.instructor_id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {instructor.instructor_name}{" "}
                      {instructor.instructor_lastName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {instructor.contract_type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {`${instructor.semester_hours} h`}
                    </td>
                    <td className="px-6 py-1 text-sm font-semibold rounded-full">
                      <span className={getUtilizationColor(instructor)}>
                        {`${instructor.total_hours}/${
                          instructor.contract_type === "Casual" ? "800" : "615"
                        } h`}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-sm font-semibold rounded-full">
                      <span
                        className={`${
                          instructor.instructor_status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        } rounded-sm p-2`}
                      >
                        {instructor.instructor_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInstructors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No instructors found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
