"use client";
import { useState } from "react";
import { getUtilizationColor } from "../../_Utils/utilizationColorsUtil";
const instructorListHeaders = [
  "ID",
  "Name",
  "Contract",
  "Semester Hours",
  "Total Hours",
  "Status",
];
export default function InstructorPicker({
  instructors,
  onAddInstructor,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter instructors based on search term and if already added
  const filteredInstructors = instructors.filter((instructor) => {
    // Filter by searching name
    const name =
      instructor.instructor_name + " " + instructor.instructor_lastName;
    const matchesName = name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by searching ID
    const matchesID = instructor.instructor_id.toString().includes(searchTerm);
    return matchesID || matchesName; //&& !isAlreadyAdded;
  });

  const handleAddInstructor = (instructor) => {
    onAddInstructor(instructor);
  };

  return (
    <div>
      {/* Modal for selecting instructors */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-50" />
        {/* Modal Content */}
        <div
          className="relative bg-gray-100 p-4 rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button
              className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
              aria-label="Close modal"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          {/* Search bar */}
          <div className="flex justify-center my-2">
            <input
              type="text"
              placeholder="Search Instructors by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-xs"
            />
          </div>

          {/* Instructor List */}
          <div className="overflow-y-auto h-80">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="bg-gray-200">
                  {instructorListHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {filteredInstructors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-sm text-center">
                      {searchTerm
                        ? "No instructors match your search."
                        : "All available instructors have been added."}
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((instructor) => (
                    <tr
                      key={instructor.instructor_id}
                      onClick={() => {
                        handleAddInstructor(instructor);
                      }}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instructor.instructor_id}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instructor.instructor_name}{" "}
                        {instructor.instructor_lastName}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instructor.contract_type}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {`${instructor.semester_hours} h`}
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold border-b border-gray-300">
                        <span className={getUtilizationColor(instructor)}>
                          {`${instructor.total_hours}/${
                            instructor.contract_type === "Casual"
                              ? "800"
                              : "615"
                          } h`}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold border-b border-gray-300">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
