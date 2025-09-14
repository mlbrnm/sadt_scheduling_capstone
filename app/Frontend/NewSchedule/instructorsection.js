"use client";
import { useState } from "react";
import { getUtilizationColor } from "../_Utils/utilizationColorsUtil";

export default function InstructorSection({
  instructors,
  onAddInstructor,
  onRemoveInstructor,
  addedInstructors,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const instructorCardHeaders = [
    "Contract",
    "Win",
    "Sp/Su",
    "Fall",
    "Total",
    "Instructor",
  ];
  const instructorListHeaders = [
    "ID",
    "Name",
    "Contract",
    "Semester Hours",
    "Total Hours",
    "Status",
  ];

  // Handler function to add the selected instructor
  const handleAddInstructor = (instructor) => {
    onAddInstructor(instructor);
    setIsModalOpen(false);
    setSearchTerm("");
  };

  // Handler function to remove an instructor
  const handleRemoveInstructor = (instructor) => {
    // USED AI Q: how can we add a confirmation message for removing an added instructor without making a custom modal? (https://chat.deepseek.com/a/chat/s/cdbd0a66-d6f9-47e0-b1da-c564f09c6e7d)
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${instructor.Instructor_Name} ${instructor.Instructor_LastName}?`
    );
    if (confirmRemove) {
      onRemoveInstructor(instructor);
    }
  };

  // Filter instructors based on search term
  const filteredInstructors = instructors.filter((instructor) => {
    // Check if instructor is already added
    // USED AI Q: How do I make sure the same instructor isn't added twice? (https://chat.deepseek.com/a/chat/s/d165c209-61dc-4b75-943f-4d97dfa24eb5)
    const isAlreadyAdded = addedInstructors.some(
      (i) => i.Instructor_ID === instructor.Instructor_ID
    );

    // Filter by searching name
    const name =
      instructor.Instructor_Name + " " + instructor.Instructor_LastName;
    const matchesName = name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by searching ID
    const matchesID = instructor.Instructor_ID.toString().includes(searchTerm);

    return (matchesID || matchesName) && !isAlreadyAdded;
  });

  return (
    <div>
      {/* Added Instructors + Add Instructor Button */}
      <div className="max-w-auto p-2 bg-gray-50 rounded-md">
        <button
          className="cursor-pointer hover:bg-green-100 p-2"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Instructor
        </button>

        {/* Display added instructors */}
        <div>
          {addedInstructors.length === 0 ? (
            <table>
              <thead className="bg-gray-50">
                <tr>
                  {instructorCardHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-1 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  {instructorCardHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {addedInstructors.map((instructor) => (
                  <tr
                    key={instructor.Instructor_ID}
                    onClick={() => handleRemoveInstructor(instructor)}
                    className="cursor-pointer hover:bg-red-100"
                  >
                    <td className="px-3 py-2 text-sm">
                      {instructor.Contract_Type}
                    </td>
                    {/* Placeholder for Winter Hours - REPLACE!!! */}
                    <td className="px-3 py-2 text-sm">0</td>
                    {/* Placeholder for Spring/Summer Hours - REPLACE!!! */}
                    <td className="px-3 py-2 text-sm">0</td>
                    {/* Placeholder for Fall Hours - REPLACE!!! */}
                    <td className="px-3 py-2 text-sm">0</td>
                    <td
                      className={`px-3 py-2 text-sm ${getUtilizationColor(
                        instructor
                      )}`}
                    >
                      {`${instructor.Total_Hours} h`}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {instructor.Instructor_Name +
                        " " +
                        instructor.Instructor_LastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for selecting instructors */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gray-100 p-4 rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
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
                    {instructorListHeaders.map((header) => (
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
