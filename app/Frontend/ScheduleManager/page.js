"use client";
import { useState } from "react";
import dummydata from "./dummydata.json";

export default function ScheduleManager() {
  const [submittedSchedulesData, setSubmittedSchedulesData] = useState(dummydata);
  const [sortOption, setSortOption] = useState({key: null, direction: "ascending"});
  const [searchParam, setSearchParam] = useState("");

  // Get colour for chips based on program type, status, timeslots

  // Program type colour conditional rendering
  const getProgramTypeColour = (programType) => {
    switch (programType.toLowerCase()) {
      case "diploma":
        return "chip-diploma pl-2 pr-5 py-1.5 rounded border border-1";
      case "certificate":
        return "chip-certificate px-2 py-1.5 rounded border border-1";
      case "bachelors":
        return "chip-bachelors pl-2 pr-3 py-1.5 rounded border border-1";
    }
  };

  // Status colour conditional rendering
  const getStatusColour = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "chip-approved pl-2 pr-3 py-1.5 rounded border border-1 text-justify-center";
      case "submitted":
        return "chip-submitted px-2 py-1.5 rounded border border-1 text-justify-center";
      case "in review":
        return "chip-inreview pl-2 pr-4 py-1.5 rounded border border-1 text-justify-center";
      case "rejected":
        return "chip-rejected pl-2 pr-6 py-1.5 rounded border border-1 text-justify-center";
    }
  };

  // Timeslot colour conditional rendering
  const getTimeslotsColour = (timeslots) => {
    if (timeslots.toLowerCase().includes("uploaded")) {
      return "chip-uploaded px-2.5 py-1.5 rounded border border-1";
    } else if (timeslots.toLowerCase().includes("empty")) {
      return "chip-empty pl-2 pr-4 py-1.5 rounded border border-1";
    } else {
      return "chip-empty pl-2 pr-4 py-1.5 rounded border border-1";
    }
  };

  return (
    /*Main Content Container*/
    <div className="p-8">
      {/* Filter/Sort & Search */}
      <div className="flex flex-row items-center justify-center gap-10 pb-8">
        {/* Filter/Sort Container */}
        <div className="text-lg text-bold flex items-center gap-1">Sort by
          <select className="px-3 py-2 mx-3 background-primary rounded-lg border border-tertiary focus:outline-offset-1 focus:outline-2 focus:border-tertiary w-xs text-gray-500">
            <label>Sort by:</label>
            <option disabled selected defaultValue="Select an option" className="text-gray-400">Select an option</option>
            <option value="newest" className="text-primary">Date Submitted, newest</option>
            <option value="oldest" className="text-primary">Date Submitted, oldest</option>
            <option value="title-a" className="text-primary">Title, A-Z</option>
            <option value="title-z" className="text-primary">Title, Z-A</option>
            <option value="program" className="text-primary">Program Type</option>
            <option value="status" className="text-primary">Status</option>
            <option value="timeslots" className="text-primary">Timeslots uploaded</option>
          </select>
        </div>
        {/* Search */}
        <div className="text-lg text-bold flex items-center gap-1">Search
          <input
            type="text"
            placeholder="Enter search criteria (e.g. keyword, status, tags...)"
            className="px-3 py-2 ml-3 background-primary rounded-lg border border-tertiary focus:outline-offset-1 focus:outline-2 focus:border-tertiary w-3xl"
          />
          </div>
      </div>
      {/* Table Container */}
        <div className="bg-gray-100 m-0 rounded-lg shadow-md">
          <div className="h-[calc(100vh-269px)] overflow-y-auto overflow-x-hidden">
            <table className="table-auto min-w-full">
              <thead className="bg-gray-300 sticky top-0">
                <tr className="grid grid-cols-7 gap-8 py-3 text-left font-sm pl-6">
                  <th>Date Submitted</th>
                  <th>Title</th>
                  <th>Program Type</th>
                  <th>Status</th>
                  {/* Placeholder for now for design of AC sched manager */}
                  <th>Tags</th>
                  <th>Timeslots</th>
                </tr>
              </thead>
              <tbody>
                {submittedSchedulesData.map((schedule, index) => (
                  <tr key={index} className="grid grid-cols-7 gap-8 py-3 border-b pl-6">
                    <td className="mt-1">{schedule.dateSubmitted}</td>
                    <td className="mt-1">{schedule.title}</td>
                    <td className="p-4-md mt-1.5 text-justify-center">
                      <span className={getProgramTypeColour(schedule.programType)}>{schedule.programType}</span>
                    </td>
                    <td className="mt-1.5">
                      <span className={getStatusColour(schedule.status)}>{schedule.status}</span>
                    </td>
                    <td className="text-xs mt-1">{schedule.tags}</td>
                    <td className="mt-1">
                      <span className={getTimeslotsColour(schedule.timeslots)}>{schedule.timeslots}</span>
                    </td>
                    <td className="flex justify-left mx-12">
                      <button className="button-primary text-white px-4 py-1.5 rounded hover:button-hover active:button-clicked">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
    );
}