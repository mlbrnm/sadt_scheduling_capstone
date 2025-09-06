"use client";
import { useState } from "react";
import mockdata from "./mockdata.json";

export default function InstructorWorkload() {
  const [searchInstructor, setSearchInstructor] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hoursFilter, setHoursFilter] = useState("All");
  const [instructorWorkloadData, setInstructorWorkloadData] =
    useState(mockdata);
  const [selectedSemester, setSelectedSemester] = useState("");

  const mockSemesters = ["Fall 2025", "Spring 2025", "Summer 2025"];

  // Filter the list of instructors
  const filteredInstructors = instructorWorkloadData.filter((instructor) => {
    // Filter by searching name
    const matchesName = instructor.name
      .toLowerCase()
      .includes(searchInstructor.toLowerCase());

    // Filter by searching ID
    const matchesID = instructor.id.toString().includes(searchInstructor);

    // Filter by status
    const matchesStatus =
      statusFilter === "All" || instructor.status === "Available";

    // Filter by hours
    let matchesHours = true;
    if (hoursFilter === "hasRemaining") {
      const yearlyMax = instructor.contract === "C" ? 800 : 615;
      matchesHours = instructor.totalHours < yearlyMax;
    }

    return (matchesID || matchesName) && matchesStatus && matchesHours;
  });

  // Summary details
  const totalInstructors = instructorWorkloadData.length;
  const overMaxHours = instructorWorkloadData.filter(
    (instructor) =>
      instructor.totalHours >= (instructor.contract === "C" ? 800 : 615)
  ).length;
  const onBreak = instructorWorkloadData.filter(
    (instructor) => instructor.status === "On Break"
  ).length;

  // Determine color based on total hours utilization
  const getUtilizationColor = (instructor) => {
    const yearlyMax = instructor.contract === "C" ? 800 : 615;
    const utilization = (instructor.totalHours / yearlyMax) * 100;

    if (utilization >= 100) {
      return "bg-red-300 rounded-sm p-2";
    } else if (utilization > 60) {
      return "bg-yellow-300 rounded-sm p-2";
    } else {
      return "bg-green-300 rounded-sm p-2";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl text-center font-bold mb-6">
        Instructor Workload
      </h1>

      {/* Filter + Main Content Container */}
      <div className="flex flex-row">
        {/* Filter Container */}
        <div className="flex flex-col gap-2 p-4 bg-white rounded-lg w-60 h-100 mt-29 mr-4">
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
                  id="status-available"
                  name="status-filter"
                  type="radio"
                  checked={statusFilter === "Available"}
                  onChange={() => setStatusFilter("Available")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="status-available"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show Available Instructors
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
          {/* Contract legend */}
          <div className="flex flex-col text-sm text-gray-600">
            <p className="font-bold">Contract Types:</p>
            <p>P = Permanent</p>
            <p>TS = Temp Salaried</p>
            <p>C = Contract</p>
            <p>Ad = Adjunct</p>
          </div>
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
          <div className="flex gap-6 mb-2 text-sm">
            <span>Total Instructors: {totalInstructors}</span>
            <span>Over Max Hours: {overMaxHours}</span>
            <span>On Break: {onBreak}</span>
          </div>

          {/* Instructor Table */}
          <div className="bg-white rounded-lg overflow-auto max-h-125">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    Contract
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    Semester Hours
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    Total Hours
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-black">
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor.id}>
                    <td className="px-6 py-4 text-sm">{instructor.id}</td>
                    <td className="px-6 py-4 text-sm">{instructor.name}</td>
                    <td className="px-6 py-4 text-sm">{instructor.contract}</td>
                    <td className="px-6 py-4 text-sm">
                      {`${instructor.semesterHours} h`}
                    </td>
                    <td className="px-2 py-1 text-sm font-semibold rounded-full">
                      <span className={getUtilizationColor(instructor)}>
                        {`${instructor.totalHours}/${
                          instructor.contract === "C" ? "800" : "615"
                        } h`}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-sm font-semibold rounded-full">
                      <span
                        className={`${
                          instructor.status === "Available"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        } rounded-sm p-2`}
                      >
                        {instructor.status}
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
