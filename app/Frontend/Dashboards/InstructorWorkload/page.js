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
      name: "Robert Chen",
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
      totalHours: 615,
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
    <div className="p-8">
      <h1 className="text-2xl text-center font-bold mb-6">
        Instructor Workload
      </h1>
      <div>
        <h2>Semester: Spring 2025 | Program: SD</h2>
      </div>
      {/* Summary */}
      <div className="flex gap-6 mb-6 text-sm">
        <span>Total Instructors: {totalInstructors}</span>
        <span>Over Max Hours: {overMaxHours}</span>
        <span>On Break: {onBreak}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col mb-4 p-4">
        <div>
          <span>Instructors:</span>
        </div>
      </div>

      {/* Instructor Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contract</th>
            <th>Semester Hours</th>
            <th>Total Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((instructor) => (
            <tr key={instructor.id}>
              <td>{instructor.id}</td>
              <td>{instructor.name}</td>
              <td>{instructor.contract}</td>
              <td>{instructor.semesterHours}</td>
              <td>{instructor.totalHours}</td>
              <td>{instructor.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
