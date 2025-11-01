"use client";
import { useState, useEffect } from "react";
import InstructorPicker from "./instructorpicker";

export default function EditDelivery({
  deliveries,
  onSave,
  onCancel,
  onAddSiblingDelivery,
  onAddSection,
  instructors,
}) {
  /**
   * NOTES FOR BACKEND
   * deliveries prop:
   * - Array of original delivery objects from CertificateSchedule
   * - Used to initialize drafts
   * drafts state:
   * - Same shape as deliveries, but:
   *   - days -> object { m, t, w, th, f, s } as booleans
   *   - editable fields for dates/times
   * - Updated as user edits
   * - Converted back to delivery shape on Save
   */
  const [drafts, setDrafts] = useState([]);
  const [pickerForIndex, setPickerForIndex] = useState(null); // which row is currently picking instructor
  const [isInstructorPickerOpen, setIsInstructorPickerOpen] = useState(false);

  // Convert flags to boolean days
  const flagsToDays = (delivery) => ({
    m: (delivery.m || "").toUpperCase() === "X",
    t: (delivery.t || "").toUpperCase() === "X",
    w: (delivery.w || "").toUpperCase() === "X",
    th: (delivery.th || "").toUpperCase() === "X",
    f: (delivery.f || "").toUpperCase() === "X",
    s: (delivery.s || "").toUpperCase() === "X",
  });

  // Initialize/append drafts when deliveries change
  useEffect(() => {
    setDrafts((prevDrafts) => {
      // if editor just opened
      if (prevDrafts.length === 0) {
        return deliveries.map((delivery) => ({
          ...delivery,
          start_date: delivery.start_date || "",
          end_date: delivery.end_date || "",
          start_time: delivery.start_time || "",
          end_time: delivery.end_time || "",
          days: flagsToDays(delivery),
          assigned_instructor_id: delivery.assigned_instructor_id ?? null,
          assigned_instructor_name: delivery.assigned_instructor_name ?? null,
        }));
      }
      // Append newly added deliveries
      if (deliveries.length > prevDrafts.length) {
        const newDrafts = [...prevDrafts];
        for (let i = prevDrafts.length; i < deliveries.length; i++) {
          const delivery = deliveries[i];
          newDrafts.push({
            ...delivery,
            start_date: delivery.start_date || "",
            end_date: delivery.end_date || "",
            start_time: delivery.start_time || "",
            end_time: delivery.end_time || "",
            days: flagsToDays(delivery),
            assigned_instructor_id: delivery.assigned_instructor_id ?? null,
            assigned_instructor_name: delivery.assigned_instructor_name ?? null,
          });
        }
        return newDrafts;
      }
      return prevDrafts;
    });
  }, [deliveries]);

  // Helper to update a specific field (start/end dates and time) in a draft
  const updateField = (deliveryIndex, propertyName, newValue) => {
    setDrafts((prevDrafts) => {
      const updatedDrafts = [...prevDrafts];
      updatedDrafts[deliveryIndex] = {
        ...prevDrafts[deliveryIndex],
        [propertyName]: newValue,
      };
      return updatedDrafts;
    });
  };

  // Toggle day selection in a delivery draft
  const handleToggleDay = (index, day) => {
    setDrafts((prevDrafts) => {
      const updatedDrafts = [...prevDrafts];
      updatedDrafts[index] = {
        ...prevDrafts[index],
        days: {
          ...prevDrafts[index].days,
          [day]: !prevDrafts[index].days[day],
        },
      };
      return updatedDrafts;
    });
  };

  // Open InstructorPicker for a specific delivery row
  const openPickerForInstructor = (index) => {
    setPickerForIndex(index);
    setIsInstructorPickerOpen(true);
  };

  // Helper to set or clear instructor on a row in drafts
  const setInstructorFor = (rowIndex, instructor) => {
    setDrafts((prevDrafts) => {
      const updatedDrafts = [...prevDrafts];
      updatedDrafts[rowIndex] = {
        ...prevDrafts[rowIndex],
        assigned_instructor_id: instructor?.instructor_id ?? null,
        assigned_instructor_name: instructor
          ? `${instructor.instructor_name} ${instructor.instructor_lastName}`
          : null,
      };
      return updatedDrafts;
    });
  };

  // Handle adding instructor from InstructorPicker
  const handleAddInstructor = (instructor) => {
    if (pickerForIndex === null) return;
    setInstructorFor(pickerForIndex, instructor);
    setIsInstructorPickerOpen(false);
    setPickerForIndex(null);
  };

  // Handle saving edits
  const handleSaveEdit = () => {
    // Convert drafts back to delivery shape with 'X' from day booleans
    const updated = drafts.map((d) => ({
      ...d,
      m: d.days.m ? "X" : "",
      t: d.days.t ? "X" : "",
      w: d.days.w ? "X" : "",
      th: d.days.th ? "X" : "",
      f: d.days.f ? "X" : "",
      s: d.days.s ? "X" : "",
      assigned_instructor_id: d.assigned_instructor_id ?? null,
      assigned_instructor_name: d.assigned_instructor_name ?? null,
    }));
    onSave(updated);
  };

  // Helper to convert HH:MM to minutes
  const convertToMinutes = (time) => {
    if (!time || typeof time !== "string") return null;
    const [hours, minutes] = time.split(":").map((number) => Number(number));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  // Calculate hours per delivery based on start/end time
  const getHoursPerDelivery = (draft) => {
    const startMinutes = convertToMinutes(draft.start_time);
    const endMinutes = convertToMinutes(draft.end_time);
    if (
      startMinutes != null &&
      endMinutes != null &&
      endMinutes > startMinutes
    ) {
      return (endMinutes - startMinutes) / 60;
    }
    return Number(draft.hours_class) || 0; // fallback to original hours_class if time is invalid
  };

  // Helper to calculate how many days are selected
  const countSelectedDays = (days) => {
    const dayKeys = ["m", "t", "w", "th", "f", "s"];
    return dayKeys.reduce((count, key) => count + (days[key] ? 1 : 0), 0);
  };

  // Helper to calculate total hours for a draft
  const calculateTotalHours = (draft) => {
    const hoursPerDelivery = getHoursPerDelivery(draft);
    const numOfSelectedDays = countSelectedDays(draft.days);
    const weeks = Number(draft.weeks) || 15;
    return hoursPerDelivery * numOfSelectedDays * weeks;
  };

  // Calculate preview total hours for an instructor
  const getPreviewTotalHours = (instructorId) => {
    if (!instructorId) return null;

    // Find instructor in original list to get their base hours
    const base = Number(
      instructors.find(
        (instructor) => instructor.instructor_id === instructorId
      )?.total_hours || 0
    );

    // Add hours for all drafts assigned to the same instructor
    const extra = drafts
      .filter((draft) => draft.assigned_instructor_id === instructorId)
      .reduce((sum, draft) => sum + calculateTotalHours(draft), 0);

    return base + extra;
  };

  // Group drafts by section
  // USED AI Q: How to group things in Next.js using reduce (GROUP THINGS USING REDUCE)
  const draftsBySection = drafts.reduce((acc, draft) => {
    const key = draft.section || "-";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(draft);
    return acc;
  }, {});

  const sections = Object.keys(draftsBySection).sort();

  // BACKEND DECIDE ON DATE FORMAT SO WE CAN CHANGE INPUT FROM TEXT TO DATE!!!
  // NEED TO FIGURE OUT HOW TO DO 24-HOUR TIME INPUT AS WELL!!!
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <span className="text-lg font-semibold">
          {drafts[0]?.course_name} ({drafts[0]?.course_code})
        </span>
      </div>

      {/* Delivery + Section */}
      {sections.map((section) => (
        <div key={section} className="rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-lg">
            <div className="font-semibold">Section {section}</div>
            <button
              className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              onClick={() => onAddSiblingDelivery?.(section)}
            >
              Add delivery
            </button>
          </div>

          <div className="divide-y divide-gray-300">
            {draftsBySection[section].map((draft) => {
              const index = drafts.findIndex(
                (d) => d.deliveryId === draft.deliveryId
              );
              return (
                <div key={draft.deliveryId} className="bg-white p-4">
                  <div className="flex flex-row gap-4 mb-4">
                    {/* Start Date */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Start Date:
                      </label>
                      <input
                        type="text" // USING type="text" FOR NOW, USE "type=date" once format is decided in the backend!!!
                        className="border border-gray-300 rounded p-1 w-32"
                        value={draft.start_date}
                        onChange={(e) =>
                          updateField(index, "start_date", e.target.value)
                        }
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                    {/* End Date */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        End Date:
                      </label>
                      <input
                        type="text" // USING type="text" FOR NOW, USE "type=date" once format is decided in the backend!!!
                        className="border border-gray-300 rounded p-1 w-32"
                        value={draft.end_date}
                        onChange={(e) =>
                          updateField(index, "end_date", e.target.value)
                        }
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                    {/* Start Time */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Start Time:
                      </label>
                      <input
                        type="time"
                        className="border border-gray-300 rounded p-1 w-32"
                        value={draft.start_time}
                        onChange={(e) =>
                          updateField(index, "start_time", e.target.value)
                        }
                      />
                    </div>
                    {/* End Time */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        End Time:
                      </label>
                      <input
                        type="time"
                        className="border border-gray-300 rounded p-1 w-32"
                        value={draft.end_time}
                        onChange={(e) =>
                          updateField(index, "end_time", e.target.value)
                        }
                      />
                    </div>
                    {/* Days Selection */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Days:
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {[
                          ["m", "Mon"],
                          ["t", "Tue"],
                          ["w", "Wed"],
                          ["th", "Thu"],
                          ["f", "Fri"],
                          ["s", "Sat"],
                        ].map(([key, label]) => (
                          <label
                            key={key}
                            className="inline-flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={!!draft.days[key]}
                              onChange={() => handleToggleDay(index, key)}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Add Instructor Button OR Instructor */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Instructor:
                      </label>
                      {draft.assigned_instructor_id ? (
                        <div className="flex items-center space-x-2">
                          <span className="">
                            {draft.assigned_instructor_name}
                          </span>
                          <span>
                            {getPreviewTotalHours(draft.assigned_instructor_id)}
                            h
                          </span>

                          <button
                            className="text-sm font-semibold hover:text-blue-500 cursor-pointer"
                            onClick={() => openPickerForInstructor(index)}
                            title="Change Instructor"
                          >
                            Change
                          </button>
                          <button
                            className="text-sm font-semibold hover:text-red-500 cursor-pointer"
                            onClick={() => setInstructorFor(index, null)}
                            title="Remove Instructor"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="">
                          <button
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => openPickerForInstructor(index)}
                          >
                            + Add Instructor
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add Section Button */}
      <div className="mt-2">
        <button
          className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          onClick={() => onAddSection && onAddSection()}
        >
          Add Section
        </button>
      </div>

      {/* Save & Cancel Buttons */}
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-md bg-white hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveEdit}
          className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        >
          Save
        </button>
      </div>

      {/* Instructor Picker Modal */}
      {isInstructorPickerOpen && (
        <InstructorPicker
          instructors={instructors}
          onAddInstructor={handleAddInstructor}
          onClose={() => {
            setIsInstructorPickerOpen(false);
            setPickerForIndex(null);
          }}
        />
      )}
    </div>
  );
}
