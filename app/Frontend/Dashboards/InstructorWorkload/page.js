"use client";
import { useState } from "react";

export default function InstructorWorkload() {
  const [searchInstructor, setSearchInstructor] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hoursFilter, setHoursFilter] = useState("All");

  const mockData = [
    {
      id: 16491,
      name: "Elizabeth Moore",
      contract: "P",
      semesterHours: 205,
      totalHours: 205,
      status: "Available",
    },
    {
      id: 23756,
      name: "Sarah Johnson",
      contract: "P",
      semesterHours: 0,
      totalHours: 615,
      status: "On Break",
    },
    {
      id: 48921,
      name: "Michael Brennan",
      contract: "C",
      semesterHours: 205,
      totalHours: 410,
      status: "Available",
    },
    {
      id: 75234,
      name: "Robert Chen",
      contract: "TS",
      semesterHours: 0,
      totalHours: 410,
      status: "On Break",
    },
    {
      id: 91583,
      name: "Daniel Kim",
      contract: "P",
      semesterHours: 205,
      totalHours: 410,
      status: "Available",
    },
    {
      id: 34672,
      name: "Priya Kapoor",
      contract: "P",
      semesterHours: 205,
      totalHours: 205,
      status: "Available",
    },
    {
      id: 62845,
      name: "Ethan Carter",
      contract: "P",
      semesterHours: 0,
      totalHours: 410,
      status: "On Break",
    },
    {
      id: 19387,
      name: "Dill Pickles",
      contract: "C",
      semesterHours: 205,
      totalHours: 800,
      status: "Available",
    },
    {
      id: 50618,
      name: "Taylor Morgan",
      contract: "TS",
      semesterHours: 205,
      totalHours: 410,
      status: "Available",
    },
    {
      id: 87412,
      name: "Olivia Bennett",
      contract: "P",
      semesterHours: 0,
      totalHours: 615,
      status: "Available",
    },
    {
      id: 68753,
      name: "Daniel Warren",
      contract: "P",
      semesterHours: 0,
      totalHours: 615,
      status: "Available",
    },
  ];

  // Filter the list of instructors
  const filteredInstructors = mockData.filter((instructor) => {
    // Filter by searching name
    const matchesName = instructor.name
      .toLowerCase()
      .includes(searchInstructor.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "All" || instructor.status === "Available";

    // Filter by hours
    let matchesHours = true;
    if (hoursFilter === "hasRemaining") {
      const yearlyMax = instructor.contract === "C" ? 800 : 615;
      matchesHours = instructor.totalHours < yearlyMax;
    }

    return matchesName && matchesStatus && matchesHours;
  });

  // Summary details
  const totalInstructors = mockData.length;
  const overMaxHours = mockData.filter(
    (instructor) =>
      instructor.totalHours >= (instructor.contract === "C" ? 800 : 615)
  ).length;
  const onBreak = mockData.filter(
    (instructor) => instructor.status === "On Break"
  ).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl text-center font-bold mb-6">
        Instructor Workload
      </h1>
      <div>
        <h2>Semester: Spring 2025 | Program: SD</h2>
      </div>

      {/* Search bar */}
      <div>
        <input
          type="text"
          placeholder="Search Instructors..."
          className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={searchInstructor}
          onChange={(e) => setSearchInstructor(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="flex gap-6 mb-6 text-sm">
        <span>Total Instructors: {totalInstructors}</span>
        <span>Over Max Hours: {overMaxHours}</span>
        <span>On Break: {onBreak}</span>
      </div>

      {/* Filter Container */}
      <div className="flex flex-col gap-4 mb-4 p-4 bg-white rounded-lg">
        {/* Filters */}
        <div className="flex flex-col gap-4">
          {/* Status filter */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-1">
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
            <legend className="text-sm font-medium text-gray-700 mb-1">
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
          <div className="flex flex-col mb-4 text-sm text-gray-600">
            <p className="font-bold">Contract Types:</p>
            <p>P = Permanent</p>
            <p>TS = Temp Salaried</p>
            <p>C = Contract</p>
            <p>Ad = Adjunct</p>
          </div>
        </div>
      </div>

      {/* Instructor Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Contract
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Semester Hours
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Total Hours
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {filteredInstructors.map((instructor) => (
              <tr key={instructor.id}>
                <td className="px-6 py-4 text-sm">{instructor.id}</td>
                <td className="px-6 py-4 text-sm">{instructor.name}</td>
                <td className="px-6 py-4 text-sm">{instructor.contract}</td>
                <td className="px-6 py-4 text-sm">
                  {`${instructor.semesterHours} h`}
                </td>
                <td className="px-6 py-4 text-sm">{`${instructor.totalHours}/${
                  instructor.contract === "C" ? "800" : "615"
                } h`}</td>
                <td className="px-6 py-4 text-sm">{instructor.status}</td>
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
  );
}
