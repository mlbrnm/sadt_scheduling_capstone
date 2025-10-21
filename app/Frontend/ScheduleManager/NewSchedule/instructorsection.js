"use client";
import { useState, useEffect, useRef } from "react";
import { getUtilizationColor } from "../../_Utils/utilizationColorsUtil";

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

// Hook to observe size changes of an element
function useResizeObserver(el, onSize) {
  useEffect(() => {
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.ceil(entry.contentRect.height);
        onSize(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [el, onSize]);
}

export default function InstructorSection({
  instructors,
  onAddInstructor,
  onRemoveInstructor,
  addedInstructors,
  assignments,
  addedCoursesBySemester,
  onRowResize,
  onHeaderResize,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handler function to add the selected instructor
  const handleAddInstructor = (instructor) => {
    onAddInstructor(instructor);
    setIsModalOpen(false);
    setSearchTerm("");
  };

  // Handler function to remove an instructor
  const handleRemoveInstructor = (instructor) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${instructor.instructor_name} ${instructor.instructor_lastName}?`
    );
    if (confirmRemove) {
      onRemoveInstructor(instructor);
    }
  };

  // Filter instructors based on search term and if already added
  const filteredInstructors = instructors.filter((instructor) => {
    // Check if instructor is already added
    // USED AI Q: How do I make sure the same instructor isn't added twice? (https://chat.deepseek.com/a/chat/s/d165c209-61dc-4b75-943f-4d97dfa24eb5)
    const isAlreadyAdded = addedInstructors.some(
      (i) => i.instructor_id === instructor.instructor_id
    );

    // Filter by searching name
    const name =
      instructor.instructor_name + " " + instructor.instructor_lastName;
    const matchesName = name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by searching ID
    const matchesID = instructor.instructor_id.toString().includes(searchTerm);
    return (matchesID || matchesName) && !isAlreadyAdded;
  });

  // Helper function to get per-week hours for this course
  const hoursPerSection = (semester, courseId) => {
    const courses = addedCoursesBySemester?.[semester] || [];
    const course = courses.find(
      (c) => String(c.course_id) === String(courseId)
    );
    return {
      classHrs: course?.class_hrs || 0,
      onlineHrs: course?.online_hrs || 0,
    };
  };

  // Helper Function to Sum per-week hours for an instructor in a semester
  const sumHours = (instructorId, semester) => {
    let sum = 0;
    const iId = String(instructorId);
    for (const [key, value] of Object.entries(assignments || {})) {
      const [iid, cid, sem] = key.split("-");
      if (iid !== iId || sem !== semester) continue;

      const { classHrs, onlineHrs } = hoursPerSection(sem, cid);
      const sections = value?.sections || {};
      for (const sec of Object.values(sections)) {
        if (sec.class) sum += classHrs;
        if (sec.online) sum += onlineHrs;
      }
    }
    return sum;
  };

  // Helper Function to Sum total assigned hours for an instructor across all semesters and add to current total hours
  const sumTotal = (instructorId) => {
    // base hours for this instructor
    const base =
      addedInstructors.find(
        (i) => String(i.instructor_id) === String(instructorId)
      )?.total_hours || 0;

    // add up assigned hours from all semesters
    let assigned = 0;
    for (const sem of ["winter", "springSummer", "fall"]) {
      assigned += sumHours(instructorId, sem);
    }
    // 15 for number of weeks in a semester
    return base + assigned * 15;
  };

  // Measure header + each row height and report up
  const headerRef = useRef(null);
  useResizeObserver(headerRef.current, (h) => onHeaderResize?.(h));

  const rowRefs = useRef(new Map());
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observers = [];
    rowRefs.current.forEach((node, id) => {
      if (!node) return;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const h = Math.ceil(entry.contentRect.height);
          onRowResize?.(id, h);
        }
      });
      ro.observe(node);
      observers.push(ro);
    });
    return () => observers.forEach((ro) => ro.disconnect());
  }, [addedInstructors, onRowResize]);

  return (
    <div>
      {/* Added Instructors */}
      <div className="bg-gray-50">
        {/* Display added instructors */}
        <div>
          {addedInstructors.length === 0 ? (
            <table>
              <thead className="bg-gray-50">
                <tr ref={headerRef}>
                  {instructorCardHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
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
                <tr ref={headerRef}>
                  {instructorCardHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {addedInstructors.map((instructor) => (
                  <tr
                    key={instructor.instructor_id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(instructor.instructor_id, el);
                      else rowRefs.current.delete(instructor.instructor_id);
                    }}
                    onClick={() => handleRemoveInstructor(instructor)}
                    className="cursor-pointer hover:bg-red-100"
                    title={`Click to remove ${instructor.instructor_name} ${instructor.instructor_lastName}`}
                  >
                    <td className="px-3 py-2 text-sm">
                      {instructor.contract_type}
                    </td>
                    {/* Winter Hours */}
                    <td className="px-3 py-2 text-sm">
                      {`${sumHours(instructor.instructor_id, "winter")}`}
                    </td>
                    {/* Spring/Summer Hours */}
                    <td className="px-3 py-2 text-sm">
                      {`${sumHours(instructor.instructor_id, "springSummer")}`}
                    </td>
                    {/* Fall Hours */}
                    <td className="px-3 py-2 text-sm">
                      {`${sumHours(instructor.instructor_id, "fall")}`}
                    </td>
                    <td
                      className={`px-3 py-2 text-sm ${getUtilizationColor({
                        ...instructor,
                        total_hours: sumTotal(instructor.instructor_id),
                      })}`}
                    >
                      {`${sumTotal(instructor.instructor_id)}h`}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {instructor.instructor_name +
                        " " +
                        instructor.instructor_lastName}
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
      )}
      {/* Add Instructor Button */}
      <div>
        <button
          className="cursor-pointer text-sm font-semibold p-2"
          onClick={() => setIsModalOpen(true)}
          title="Add Instructor"
        >
          + Add Instructor
        </button>
      </div>
    </div>
  );
}
