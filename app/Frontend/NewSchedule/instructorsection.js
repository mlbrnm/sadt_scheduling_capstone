"use client";
import { useState } from "react";
import { getUtilizationColor } from "../_Utils/utilizationColorsUtil";

export default function InstructorSection({ instructors, onAddInstructor }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handler function to add the selected instructor
  const handleAddInstructor = (instructor) => {
    onAddInstructor(instructor);
    setIsModalOpen(false);
    setSearchTerm("");
  };

  // Filter instructors based on search term
  const filteredInstructors = instructors.filter((instructor) => {
    // Filter by searching name
    const name =
      instructor.Instructor_Name + " " + instructor.Instructor_LastName;
    const matchesName = name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by searching ID
    const matchesID = instructor.Instructor_ID.toString().includes(searchTerm);

    return matchesID || matchesName;
  });

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Instructors</h2>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={() => setIsModalOpen(true)}
      >
        + Add Instructor
      </button>

      {/* Modal for selecting instructors */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="flex justify-end">
              <button
                className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
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
            <div className="max-h-60 overflow-y-auto">
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
                  {filteredInstructors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-sm text-center">
                        No instructors found.
                      </td>
                    </tr>
                  ) : (
                    filteredInstructors.map((instructor) => (
                      <tr
                        key={instructor.Instructor_ID}
                        onClick={() => {
                          handleAddInstructor(instructor);
                        }}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <td className="px-6 py-4 text-sm">
                          {instructor.Instructor_ID}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {instructor.Instructor_Name}{" "}
                          {instructor.Instructor_LastName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {instructor.Contract_Type}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {`${instructor.Semester_Hours} h`}
                        </td>
                        <td className="px-2 py-1 text-sm font-semibold rounded-full">
                          <span className={getUtilizationColor(instructor)}>
                            {`${instructor.Total_Hours}/${
                              instructor.Contract_Type === "CS" ? "800" : "615"
                            } h`}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-sm font-semibold rounded-full">
                          <span
                            className={`${
                              instructor.Instructor_Status === "Available"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            } rounded-sm p-2`}
                          >
                            {instructor.Instructor_Status}
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
      )}
    </div>
  );
}
