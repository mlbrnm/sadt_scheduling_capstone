"use client";
import { useState } from "react";
import mockCertificates from "./mockcertificates.json"; // MOCK DATA - REMOVE LATER
import CertificatesTable from "./certificatestable";
import DeliveryPicker from "./deliverypicker";

export default function CertificateSchedule() {
  // ADD deliveryId INDEX IS FINE FOR NOW!!!
  const [certificatesData, setCertificatesData] = useState(
    mockCertificates.map((row, idx) => ({ ...row, deliveryId: idx })) // Currently holds Mock data for certificates - REPLACE WITH API CALL
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Editor draft state
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [draftStartTime, setDraftStartTime] = useState("");
  const [draftEndTime, setDraftEndTime] = useState("");
  const [draftDays, setDraftDays] = useState({
    m: false,
    t: false,
    w: false,
    th: false,
    f: false,
    s: false,
  });
  // Dropdowns state STATIC HARDCODED FOR NOW!!!
  const [year, setYear] = useState("2026");
  const [semester, setSemester] = useState("Winter");
  const [program, setProgram] = useState("ISS");

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
  };

  const handleSelectDelivery = (deliveryId) => {
    const foundDelivery = certificatesData.find(
      (r) => r.deliveryId === deliveryId
    );
    if (!foundDelivery) return;
    // Populate draft state with selected delivery data
    setDraftStartDate(foundDelivery.start_date || "");
    setDraftEndDate(foundDelivery.end_date || "");
    setDraftStartTime(foundDelivery.start_time || "");
    setDraftEndTime(foundDelivery.end_time || "");
    setDraftDays({
      m: (foundDelivery.m || "").toUpperCase() === "X",
      t: (foundDelivery.t || "").toUpperCase() === "X",
      w: (foundDelivery.w || "").toUpperCase() === "X",
      th: (foundDelivery.th || "").toUpperCase() === "X",
      f: (foundDelivery.f || "").toUpperCase() === "X",
      s: (foundDelivery.s || "").toUpperCase() === "X",
    });

    setSelectedDeliveryId(deliveryId);
    setIsPickerOpen(false);
  };

  const handleToggleDay = (day) => {
    setDraftDays((prevDays) => ({
      ...prevDays,
      [day]: !prevDays[day],
    }));
  };

  const handleCancelEdit = () => {
    setSelectedDeliveryId(null);
  };

  const handleSaveEdit = () => {
    if (selectedDeliveryId === null) return;
    const updatedCertificates = certificatesData.map((r) => {
      if (r.deliveryId !== selectedDeliveryId) return r;
      return {
        ...r,
        start_date: draftStartDate,
        end_date: draftEndDate,
        start_time: draftStartTime,
        end_time: draftEndTime,
        m: draftDays.m ? "X" : "",
        t: draftDays.t ? "X" : "",
        w: draftDays.w ? "X" : "",
        th: draftDays.th ? "X" : "",
        f: draftDays.f ? "X" : "",
        s: draftDays.s ? "X" : "",
      };
    });
    setCertificatesData(updatedCertificates);
    setSelectedDeliveryId(null);
  };

  // Edit Delivery View
  if (selectedDeliveryId !== null) {
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
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
            {/* End Date */}
            <div>
              <label className="text-sm font-medium mb-1">End Date</label>
              <input
                type="text" // USING type="text" FOR NOW, USE "type=date"!!!
                className="border border-gray-300 rounded p-1 w-full"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
            {/* Start Time */}
            <div>
              <label className="text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                className="border border-gray-300 rounded p-1 w-full"
                value={draftStartTime}
                onChange={(e) => setDraftStartTime(e.target.value)}
              />
            </div>
            {/* End Time */}
            <div>
              <label className="text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                className="border border-gray-300 rounded p-1 w-full"
                value={draftEndTime}
                onChange={(e) => setDraftEndTime(e.target.value)}
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
                      checked={!!draftDays[key]}
                      onChange={() => handleToggleDay(key)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Save & Cancel Buttons */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-2 rounded-md border hover:bg-gray-50"
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Selection Dropdowns */}
      <div className="flex justify-center space-x-20 mb-4">
        <label className="flex flex-col">
          Academic Year:
          <select
            className="border border-gray-300 rounded p-1 bg-white"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2026">2026</option>
          </select>
        </label>
        <label className="flex flex-col">
          Semester:
          <select
            className="border border-gray-300 rounded p-1 bg-white"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="Winter">Winter</option>
          </select>
        </label>
        <label className="flex flex-col">
          Program:
          <select
            className="border border-gray-300 rounded p-1 bg-white"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          >
            <option value="ISS">ISS</option>
          </select>
        </label>
        {/* Edit Course Button */}
        <button
          onClick={handleOpenPicker}
          className="button-primary hover:button-hover text-white cursor-pointer px-2 rounded-lg inline-block text-center"
        >
          Edit Course
        </button>
      </div>
      {/* Certificate Table */}
      <CertificatesTable certificatesData={certificatesData} />
      {/* Delivery Picker Modal */}
      {isPickerOpen && (
        <DeliveryPicker
          certificatesData={certificatesData}
          onSelectDelivery={handleSelectDelivery}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
