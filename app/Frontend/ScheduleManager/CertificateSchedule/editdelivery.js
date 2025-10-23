"use client";
import { useState, useEffect } from "react";
export default function EditDelivery({
  deliveries,
  onSave,
  onCancel,
  onAddSiblingDelivery,
}) {
  /**
 * deliveries prop:
 * - Array of original delivery objects from CertificateSchedule
 * - Days represented as 'X' or ''
 * - Used to initialize drafts

 * drafts state:
 * - Same shape as deliveries, but:
 *   - days -> object { m, t, w, th, f, s } as booleans
 *   - editable fields for dates/times
 * - Updated as user edits
 * - Converted back to delivery shape on Save
 */
  const [drafts, setDrafts] = useState([]);

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
        return deliveries.map((d) => ({
          ...d,
          start_date: d.start_date || "",
          end_date: d.end_date || "",
          start_time: d.start_time || "",
          end_time: d.end_time || "",
          days: flagsToDays(d),
        }));
      }
      // Append newly added deliveries
      if (deliveries.length > prevDrafts.length) {
        const newDrafts = [...prevDrafts];
        for (let i = prevDrafts.length; i < deliveries.length; i++) {
          const d = deliveries[i];
          newDrafts.push({
            ...d,
            start_date: d.start_date || "",
            end_date: d.end_date || "",
            start_time: d.start_time || "",
            end_time: d.end_time || "",
            days: flagsToDays(d),
          });
        }
        return newDrafts;
      }
      return prevDrafts;
    });
  }, [deliveries]);

  // Update a specific field (start/end dates and time) in a draft
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

  // Toggle day selection in a draft delivery
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
    }));
    onSave(updated);
  };

  // BACKEND DECIDE ON DATE FORMAT SO WE CAN CHANGE INPUT FROM TEXT TO DATE!!!
  // NEED TO FIGURE OUT HOW TO DO 24-HOUR TIME INPUT AS WELL!!!
  return (
    <div className="p-4">
      <div>
        <span className="text-lg font-semibold">
          Section {drafts[0]?.section} - {drafts[0]?.course_name} (
          {drafts[0]?.course_code})
        </span>
      </div>
      {drafts.map((draft, index) => (
        <div key={draft.deliveryId} className="bg-white p-4">
          <div>
            <div className="flex flex-row gap-4 mb-4">
              {/* Start Date */}
              <div>
                <label className="text-sm font-medium mb-1">Start Date</label>
                <input
                  type="text" // Using type="text" for now use "type=date"
                  className="border border-gray-300 rounded p-1 w-full"
                  value={draft.start_date}
                  onChange={(e) =>
                    updateField(index, "start_date", e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                />
              </div>
              {/* End Date */}
              <div>
                <label className="text-sm font-medium mb-1">End Date</label>
                <input
                  type="text" // USING type="text" FOR NOW, USE "type=date"!!!
                  className="border border-gray-300 rounded p-1 w-full"
                  value={draft.end_date}
                  onChange={(e) =>
                    updateField(index, "end_date", e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                />
              </div>
              {/* Start Time */}
              <div>
                <label className="text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  className="border border-gray-300 rounded p-1 w-full"
                  value={draft.start_time}
                  onChange={(e) =>
                    updateField(index, "start_time", e.target.value)
                  }
                />
              </div>
              {/* End Time */}
              <div>
                <label className="text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  className="border border-gray-300 rounded p-1 w-full"
                  value={draft.end_time}
                  onChange={(e) =>
                    updateField(index, "end_time", e.target.value)
                  }
                />
              </div>
              {/* Days Selection */}
              <div>
                <label className="text-sm font-medium mb-1 block">Days</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    ["m", "Mon"],
                    ["t", "Tue"],
                    ["w", "Wed"],
                    ["th", "Thu"],
                    ["f", "Fri"],
                    ["s", "Sat"],
                  ].map(([key, label]) => (
                    <label key={key} className="inline-flex items-center gap-2">
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
            </div>
          </div>
        </div>
      ))}
      {/* Add Delivery Button */}
      <div className="mt-4">
        <button
          className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          onClick={onAddSiblingDelivery}
        >
          Add Delivery to Edit
        </button>
      </div>
      <div className="mt-4">
        <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          Add Section to Edit
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
    </div>
  );
}
