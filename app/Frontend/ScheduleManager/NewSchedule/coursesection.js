"use client";
import { useState } from "react";

const sectionLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export default function CourseSection({
  semester,
  courses = [],
  onAddCourse,
  onRemoveCourse,
  onToggleSection,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRemoveCourse = (course) => {
    const ok = window.confirm(
      `Remove ${course.course_code} - ${course.title}?`
    );
    if (ok) onRemoveCourse(course, semester);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 w-full p-2">
      <ul className="flex flex-nowrap">
        {courses.map((course) => (
          <li
            key={course.course_id}
            onClick={() => handleRemoveCourse(course)}
            className="p-2 text-sm cursor-pointer flex flex-col justify-between items-center group border border-gray-300 w-40 h-44 shrink-0 text-center hover:bg-red-100"
            title={`Remove ${course.course_code}`}
          >
            <span className="font-bold">{course.course_code}</span>
            <span className="text-xs">{course.title}</span>

            {/* Sections */}
            <div className="flex flex-col items-center mt-2">
              <span className="font-semibold text-xs">Sections</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const count = course.sections?.length || 0;
                    if (count > 0) {
                      const removeLetter = sectionLetters[count - 1];
                      onToggleSection(course.course_id, removeLetter);
                    }
                  }}
                  className="px-2 py-1 text-sm border rounded bg-gray-200 hover:bg-gray-300"
                >
                  −
                </button>

                <span className="w-6 text-center font-bold text-sm">
                  {course.sections?.length || 0}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const count = course.sections?.length || 0;
                    if (count < sectionLetters.length) {
                      const addLetter = sectionLetters[count];
                      onToggleSection(course.course_id, addLetter);
                    }
                  }}
                  className="px-2 py-1 text-sm border rounded bg-gray-200 hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          </li>
        ))}

        {/* Add Course */}
        <li
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-sm cursor-pointer flex flex-col justify-center items-center border border-dashed border-gray-400 w-40 h-44 shrink-0 text-center hover:bg-green-100"
        >
          <span className="text-xl font-bold">+</span>
          <span className="text-xs font-semibold">Add Course</span>
          <span className="text-xs">
            {semester === "springSummer"
              ? "Spring/Summer"
              : semester[0].toUpperCase() + semester.slice(1)}
          </span>
        </li>
      </ul>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />

          <div
            className="relative bg-white p-4 rounded-md w-3/4 max-h-3/4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex justify-end">
              <button
                className="text-gray-600 hover:text-gray-800 text-xl px-2"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="flex justify-center my-3">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 bg-gray-100 rounded-lg w-64 focus:outline-none focus:ring"
              />
            </div>

            {/* Table */}
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 border">Course ID</th>
                  <th className="px-2 py-1 border">Name</th>
                  <th className="px-2 py-1 border">Program</th>
                  <th className="px-2 py-1 border">Contact Hrs</th>
                  <th className="px-2 py-1 border">Delivery</th>
                  <th className="px-2 py-1 border">Online</th>
                  <th className="px-2 py-1 border">Class</th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => (
                  <tr
                    key={course.course_id}
                    onClick={() => handleAdd(course)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-2 py-1 border">{course.course_id}</td>
                    <td className="px-2 py-1 border">
                      {course.course?.course_name}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.program_major}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.contact_hours || 0}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.delivery_method}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.online_hrs || 0}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.class_hrs || 0}
                    </td>
                  </tr>
                ))}

                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No matching courses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
