"use client";
import { useState } from "react";
import dummydata from "./dummydata.json";

export default function ScheduleManager() {
  const [submittedSchedulesData, setSubmittedSchedulesData] = useState(dummydata);


  return (
    /*Main Content Container*/
    <div className="p-4">
      {/* Filter/Sort & Search */}
      <div className="flex flex-row m-2">
        {/* Filter/Sort Container */}
        <div className="text-lg text-bold justify-left mb-4 py-1 px-2">Filter/Sort
          <select className="px-3 py-2 ml-3 background-primary rounded-lg border border-tertiary focus:outline-offset-1 focus:outline-2 focus:border-tertiary w-xs">
          </select>
        </div>
        {/* Search */}
        <div className="text-lg text-bold justify-left mb-4 py-1 px-2">Search
          <input
            type="text"
            placeholder="Enter search criteria (e.g. keyword)"
            className="w-40 px-3 py-2 ml-3 background-primary rounded-lg border border-tertiary focus:outline-offset-1 focus:outline-2 focus:border-tertiary w-xs"
          />
          </div>
      </div>
      {/* Table Container */}
        <div className="overflow-x-auto overflow-y-auto bg-gray-100 m-0 rounded-lg shadow-md">
          <table className="table-auto min-w-full">
            <thead className="bg-gray-300">
              <tr className="grid grid-cols-7 sticky top-0 gap-8 py-3 text-left font-sm pl-6">
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
                  <td>{schedule.dateSubmitted}</td>
                  <td>{schedule.title}</td>
                  <td>{schedule.programType}</td>
                  <td>{schedule.status}</td>
                  <td>{schedule.tags}</td>
                  <td>{schedule.timeslots}</td>
                  <td className="flex justify-left mx-12">
                    <button className="button-primary text-white px-4 py-1.5 rounded">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
    );
}