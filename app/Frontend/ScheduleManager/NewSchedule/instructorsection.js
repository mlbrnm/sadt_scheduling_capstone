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
  "Win",
  "Sp/Su",
  "Fall",
  "Total",
  "Status",
];

export default function InstructorSection({
  instructors = [],
  onAddInstructor,
  onRemoveInstructor,
  addedInstructors = [],
  assignments,
  addedCoursesBySemester,
  onRowResize,
  onHeaderResize,
}) {
  useEffect(() => {
    console.log("instructors prop =", instructors);
  }, [instructors]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Normalize instructors to ensure CCH fields exist ---
  const normalizeInstructor = (instr) => ({
    ...instr,
    total_cch: instr.total_cch || "0:00:00",
    winter_cch: instr.winter_cch || "0:00:00",
    spring_summer_cch: instr.spring_summer_cch || "0:00:00",
    fall_cch: instr.fall_cch || "0:00:00",
    full_name:
      instr.full_name ||
      `${instr.instructor_name || ""} ${instr.instructor_lastname || ""}`,
  });

  const normalizedAddedInstructors = addedInstructors.map(normalizeInstructor);
  const normalizedInstructors = instructors.map(normalizeInstructor);

  // --- Add/remove handlers ---
  const handleAddInstructor = (instructor) => {
    onAddInstructor(normalizeInstructor(instructor));
    setIsModalOpen(false);
    setSearchTerm("");
  };

  const handleRemoveInstructor = (instructor) => {
    if (
      window.confirm(
        `Remove ${instructor.full_name || instructor.instructor_id}?`
      )
    ) {
      onRemoveInstructor(instructor);
    }
  };

  // --- Filter modal list ---
  const filteredInstructors = normalizedInstructors.filter((instr) => {
    const isAdded = normalizedAddedInstructors.some(
      (i) => i.instructor_id === instr.instructor_id
    );
    return (
      !isAdded &&
      (instr.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(instr.instructor_id).includes(searchTerm))
    );
  });

  // --- Resize hooks ---
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
  }, [normalizedAddedInstructors, onRowResize]);

  // Accept string "HH:MM:SS" or number of hours
  const parseCCH = (cch) => {
    if (typeof cch === "number") return cch; // already hours
    if (typeof cch !== "string") return 0;
    const [h, m, s] = cch.split(":").map(Number);
    return h + m / 60 + s / 3600;
  };

  return (
    <div>
      {/* Added Instructors Table */}
      <div className="bg-gray-50">
        <table className="min-w-full border border-gray-200">
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
            {normalizedAddedInstructors.map((instr) => (
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
                <td className="px-3 py-2 text-sm">{instr.winter_cch}</td>
                <td className="px-3 py-2 text-sm">{instr.spring_summer_cch}</td>
                <td className="px-3 py-2 text-sm">{instr.fall_cch}</td>
                <td
                  className={`px-3 py-2 text-sm ${getUtilizationColor({
                    ...instr,
                    total_hours: parseCCH(instr.total_cch),
                  })}`}
                >
                  {instr.total_cch}
                </td>
                <td className="px-3 py-2 text-sm">{instr.full_name}</td>
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
            className="relative bg-gray-100 p-4 rounded-md w-11/12 max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Instructors by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-full my-2"
            />

            {/* Scrollable Table */}
            <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
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
                          {instr.full_name}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-300">
                          {instr.contract_type}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-300">
                          {instr.winter_cch}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-300">
                          {instr.spring_summer_cch}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-300">
                          {instr.fall_cch}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-gray-300">
                          {instr.total_cch}
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
