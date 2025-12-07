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

export default function InstructorSection({
  instructors,
  onAddInstructor,
  onRemoveInstructor,
  addedInstructors,
  addedCoursesBySemester,
  onRowResize,
  onHeaderResize,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add/remove handlers
  const handleAddInstructor = (instructor) => {
    onAddInstructor(instructor);
    setIsModalOpen(false);
    setSearchTerm("");
  };
  const handleRemoveInstructor = (instructor) => {
    const name =
      instructor.full_name ||
      `${instructor.instructor_name} ${instructor.instructor_lastName}`;
    if (window.confirm(`Remove ${name}?`)) onRemoveInstructor(instructor);
  };

  // Filter modal list
  const filteredInstructors = instructors.filter((instr) => {
    const isAdded = addedInstructors.some(
      (i) => i.instructor_id === instr.instructor_id
    );
    const name =
      instr.full_name ||
      `${instr.instructor_name} ${instr.instructor_lastName}`;
    return (
      !isAdded &&
      (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(instr.instructor_id).includes(searchTerm))
    );
  });

  // Calculate hours based on sections assigned to this instructor
  const sumHours = (instructorId, semester) => {
    const courses = addedCoursesBySemester?.[semester] || [];
    let total = 0;

    courses.forEach((course) => {
      const classHrs = course.class_hrs || 0;
      const onlineHrs = course.online_hrs || 0;

      (course.sections || []).forEach((sec) => {
        if (
          (sec.assigned_instructors || []).some(
            (i) => i.instructor_id === instructorId
          )
        ) {
          total += classHrs + onlineHrs;
        }
      });
    });

    return total;
  };

  const calculateSemesterHours = (instructorId, semester) =>
    sumHours(instructorId, semester) * 15;
  const sumTotal = (instructorId) =>
    ["winter", "springSummer", "fall"].reduce(
      (acc, sem) => acc + calculateSemesterHours(instructorId, sem),
      0
    );

  // Resize hooks
  const headerRef = useRef(null);
  useEffect(() => {
    if (!headerRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      onHeaderResize?.(Math.ceil(entries[0].contentRect.height));
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, [onHeaderResize]);

  const rowRefs = useRef(new Map());
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observers = [];
    rowRefs.current.forEach((node, id) => {
      if (!node) return;
      const ro = new ResizeObserver((entries) => {
        onRowResize?.(id, Math.ceil(entries[0].contentRect.height));
      });
      ro.observe(node);
      observers.push(ro);
    });
    return () => observers.forEach((ro) => ro.disconnect());
  }, [addedInstructors, onRowResize]);

  return (
    <div>
      {/* Added Instructors Table */}
      <div className="bg-gray-50">
        <table>
          <thead ref={headerRef}>
            <tr>
              {instructorCardHeaders.map((header) => (
                <th
                  key={header}
                  className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {addedInstructors.map((instr) => (
              <tr
                key={instr.instructor_id}
                ref={(el) => {
                  if (el) rowRefs.current.set(instr.instructor_id, el);
                  else rowRefs.current.delete(instr.instructor_id);
                }}
                onClick={() => handleRemoveInstructor(instr)}
                className="cursor-pointer hover:bg-red-100"
              >
                <td className="px-3 py-2 text-sm">{instr.contract_type}</td>
                <td className="px-3 py-2 text-sm">
                  {sumHours(instr.instructor_id, "winter")}
                </td>
                <td className="px-3 py-2 text-sm">
                  {sumHours(instr.instructor_id, "springSummer")}
                </td>
                <td className="px-3 py-2 text-sm">
                  {sumHours(instr.instructor_id, "fall")}
                </td>
                <td
                  className={`px-3 py-2 text-sm ${getUtilizationColor({
                    ...instr,
                    total_hours: sumTotal(instr.instructor_id),
                  })}`}
                >
                  {sumTotal(instr.instructor_id)}h
                </td>
                <td className="px-3 py-2 text-sm">
                  {instr.full_name ||
                    `${instr.instructor_name} ${instr.instructor_lastName}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-800 opacity-50" />
          <div
            className="relative bg-gray-100 p-4 rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <input
              type="text"
              placeholder="Search Instructors by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-xs my-2"
            />
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {instructorListHeaders.map((header) => (
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
                {filteredInstructors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={instructorListHeaders.length}
                      className="px-6 py-4 text-sm text-center"
                    >
                      {searchTerm
                        ? "No instructors match your search."
                        : "All available instructors have been added."}
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((instr) => (
                    <tr
                      key={instr.instructor_id}
                      onClick={() => handleAddInstructor(instr)}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instr.instructor_id}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instr.full_name ||
                          `${instr.instructor_name} ${instr.instructor_lastName}`}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instr.contract_type}
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        0 h
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        0 h
                      </td>
                      <td className="px-6 py-4 text-sm border-b border-gray-300">
                        {instr.instructor_status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        className="cursor-pointer text-sm font-semibold p-2"
        onClick={() => setIsModalOpen(true)}
      >
        + Add Instructor
      </button>
    </div>
  );
}
