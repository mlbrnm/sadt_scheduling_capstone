"use client";
import { useState, useEffect } from "react";
export default function EditDelivery({ selectedDelivery, onSave, onCancel }) {
  // Editor draft state
  const [startDate, setStartDate] = useState(selectedDelivery.start_date || "");
  const [endDate, setEndDate] = useState(selectedDelivery.end_date || "");
  const [startTime, setStartTime] = useState(selectedDelivery.start_time || "");
  const [endTime, setEndTime] = useState(selectedDelivery.end_time || "");
  const [days, setDays] = useState({
    m: (selectedDelivery.m || "").toUpperCase() === "X",
    t: (selectedDelivery.t || "").toUpperCase() === "X",
    w: (selectedDelivery.w || "").toUpperCase() === "X",
    th: (selectedDelivery.th || "").toUpperCase() === "X",
    f: (selectedDelivery.f || "").toUpperCase() === "X",
    s: (selectedDelivery.s || "").toUpperCase() === "X",
  });

  const handleToggleDay = (day) => {
    setDays((prevDays) => ({
      ...prevDays,
      [day]: !prevDays[day],
    }));
  };

  const handleSaveEdit = () => {
    const updatedDelivery = {
      ...selectedDelivery,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      m: days.m ? "X" : "",
      t: days.t ? "X" : "",
      w: days.w ? "X" : "",
      th: days.th ? "X" : "",
      f: days.f ? "X" : "",
      s: days.s ? "X" : "",
    };
    onSave(updatedDelivery);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg p-4">
        {/* Dates & Times */}
        {/* Start Date */}
        <div className="flex flex-row gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1">Start Date</label>
            <input
              type="text" // Using type="text" for now use "type=date"
              className="border border-gray-300 rounded p-1 w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </div>
          {/* End Date */}
          <div>
            <label className="text-sm font-medium mb-1">End Date</label>
            <input
              type="text" // USING type="text" FOR NOW, USE "type=date"!!!
              className="border border-gray-300 rounded p-1 w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </div>
          {/* Start Time */}
          <div>
            <label className="text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              className="border border-gray-300 rounded p-1 w-full"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          {/* End Time */}
          <div>
            <label className="text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              className="border border-gray-300 rounded p-1 w-full"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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
                    checked={!!days[key]}
                    onChange={() => handleToggleDay(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Add delivery button */}
        <div className="mt-4">
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
            Add Delivery
          </button>
        </div>
      </div>
      {/* Save & Cancel Buttons */}
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-md bg-white hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveEdit}
          className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
