"use client";
import { useState } from "react";

export default function CourseSection({
  courses,
  onAddCourse,
  onRemoveCourse,
  addedCourses,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const courseListHeaders = [
    "Course ID",
    "Course Name",
    "Program",
    "Contact Hours",
    "Delivery",
    "Online",
    "Class",
  ];

  // Handler function to add the selected course
  const handleAddCourse = (course) => {
    onAddCourse(course);
    setIsModalOpen(false);
  };

  // Handler function to remove a course
  const handleRemoveCourse = (course) => {
    // USED AI Q: how can we add a confirmation message for removing an added instructor without making a custom modal? (https://chat.deepseek.com/a/chat/s/cdbd0a66-d6f9-47e0-b1da-c564f09c6e7d)
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${course.Course_Name}?`
    );
    if (confirmRemove) {
      onRemoveCourse(course);
    }
  };

  // Filter courses based on search term and if already added
  const filteredCourses = courses.filter((course) => {
    // Check if course is already added
    // USED AI Q: How do I make sure the same instructor isn't added twice? (https://chat.deepseek.com/a/chat/s/d165c209-61dc-4b75-943f-4d97dfa24eb5)
    const isAlreadyAdded = addedCourses.some(
      (c) => c.Course_ID === course.Course_ID
    );

    // Filter by searching name
    const matchesName = course.Course_Name.toLowerCase().includes(
      searchTerm.toLowerCase()
    );

    // Filter by searching course Code
    const matchesCode = course.Course_Code.toLowerCase()
      .toString()
      .includes(searchTerm.toLowerCase());

    return (matchesName || matchesCode) && !isAlreadyAdded;
  });

  return (
    <div>
      {/* Added Courses + Add Course Button */}
      <div className="max-w-auto p-2 bg-gray-50 rounded-md">
        <button
          className="cursor-pointer hover:bg-green-100 p-2"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Course
        </button>

        {/* Display added courses */}
        <div>
          {addedCourses.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">No courses added yet.</p>
          ) : (
            <div>
              {/* Course list */}
              <ul className="flex">
                {addedCourses.map((course) => (
                  <li
                    key={course.Course_ID}
                    onClick={() => handleRemoveCourse(course)}
                    className="p-2 text-sm cursor-pointer hover:bg-red-100 flex flex-col justify-between items-center group border border-gray-300 w-36"
                    title="Click to remove"
                  >
                    <span className="font-semibold">{course.Course_Code}</span>
                    <span>{course.Course_Name}</span>
                    <span>{course.Delivery}</span>
                    <span>{`Online ${course.Online}h`}</span>
                    <span>{`Class ${course.Class}h`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding courses */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gray-100 p-4 rounded-md w-3/4 max-h-3/4 overflow-y-auto"
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

            {/* Search Bar */}
            <div className="flex justify-center my-2">
              <input
                type="text"
                placeholder="Search courses by name or course code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-xs"
              />
            </div>

            {/* Course List */}
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="bg-gray-200">
                    {courseListHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-300"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-sm text-center">
                        {searchTerm
                          ? "No courses match your search."
                          : "All available courses have been added."}
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr
                        key={course.Course_ID}
                        onClick={() => handleAddCourse(course)}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.Course_ID}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.Course_Name}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.Program}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.Contact_Hours} h
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.Delivery}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {`${course.Online} h`}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {`${course.Class} h`}
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
