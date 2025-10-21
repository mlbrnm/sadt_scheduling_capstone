"use client";
import { useState } from "react";

const courseListHeaders = [
  "Course ID",
  "Course Name",
  "Program",
  "Contact Hours",
  "Delivery",
  "Online",
  "Class",
];

export default function CourseSection({
  semester,
  courses,
  onAddCourse,
  onRemoveCourse,
  addedCourses,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handler function to add the selected course
  const handleAddCourse = (course) => {
    onAddCourse(course, semester);
    setIsModalOpen(false);
  };

  // Handler function to remove a course
  const handleRemoveCourse = (course) => {
    // USED AI Q: how can we add a confirmation message for removing an added instructor without making a custom modal? (https://chat.deepseek.com/a/chat/s/cdbd0a66-d6f9-47e0-b1da-c564f09c6e7d)
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${course.course_name}?`
    );
    if (confirmRemove) {
      onRemoveCourse(course, semester);
    }
  };

  // Filter courses based on search term and if already added
  const filteredCourses = courses.filter((course) => {
    // Check if course is already added
    // USED AI Q: How do I make sure the same instructor isn't added twice? (https://chat.deepseek.com/a/chat/s/d165c209-61dc-4b75-943f-4d97dfa24eb5)
    const isAlreadyAdded = addedCourses.some(
      (c) => c.course_id === course.course_id
    );

    // Filter by searching name
    const matchesName = course.course_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by searching course Code
    const matchesCode = course.course_code
      .toLowerCase()
      .toString()
      .includes(searchTerm.toLowerCase());

    return (matchesName || matchesCode) && !isAlreadyAdded;
  });

  // Add sentinel course to end of addedCourses for "+ Add Course" button
  // USED AI Q: How can I add a button at the end of a list that opens a modal to add more items to the list? (SENTINEL ADD COURSE CARD)
  const coursesWithAdd = [
    ...addedCourses,
    { __isAdd: true, course_id: `__add-${semester}` },
  ];

  return (
    <div>
      {/* Added Courses */}
      <div className="bg-gray-50 w-full">
        {/* Display added courses */}
        {/* Course list */}
        <ul className="flex flex-nowrap">
          {coursesWithAdd.map((course) => (
            <li
              key={course.course_id}
              onClick={() => {
                if (course.__isAdd) {
                  setIsModalOpen(true);
                  return;
                }
                handleRemoveCourse(course);
              }}
              className={`p-2 text-sm cursor-pointer hover:bg-green-100 flex flex-col justify-between items-center group border border-gray-300 w-36 h-36 shrink-0 text-center
                    ${course.__isAdd ? "border-dashed" : "hover:bg-red-100"}`}
              title={
                course.__isAdd
                  ? "Add Course"
                  : `Click to remove ${course.course_code} - ${course.course_name}`
              }
            >
              {course.__isAdd ? (
                <>
                  <span className="text-xl font-bold">+</span>
                  <span className="text-xs font-semibold">Add Course</span>
                  <span className="text-xs">
                    {semester === "springSummer"
                      ? "Spring/Summer"
                      : semester[0].toUpperCase() + semester.slice(1)}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold">{course.course_code}</span>
                  <span>{course.course_name}</span>
                  <span>{course.delivery_method}</span>
                  <span>{`Online: ${course.online_hrs}hrs`}</span>
                  <span>{`Class: ${course.class_hrs}hrs`}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Modal for adding courses */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gray-800 opacity-50" />
          {/* Modal Content */}
          <div
            className="relative bg-gray-100 p-4 rounded-md w-3/4 max-h-3/4 overflow-y-auto"
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
                        key={course.course_id}
                        onClick={() => handleAddCourse(course)}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.course_id}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.course_name}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.program_major}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.contact_hours} h
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {course.delivery_method}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {`${course.online_hrs} h`}
                        </td>
                        <td className="px-3 py-2 text-sm border-b border-gray-300">
                          {`${course.class_hrs} h`}
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
