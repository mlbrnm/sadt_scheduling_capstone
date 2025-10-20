"use client";
import { useState } from "react";
import mockCertificates from "./mockcertificates.json"; // MOCK DATA - REMOVE LATER
import CertificatesTable from "./certificatestable";
import DeliveryPicker from "./deliverypicker";
import EditDelivery from "./editdelivery";

export default function CertificateSchedule() {
  // ADD deliveryId INDEX IS FINE FOR NOW!!!
  const [certificatesData, setCertificatesData] = useState(
    mockCertificates.map((row, idx) => ({ ...row, deliveryId: idx })) // Currently holds Mock data for certificates - REPLACE WITH API CALL
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Dropdowns state STATIC HARDCODED FOR NOW!!!
  const [year, setYear] = useState("2026");
  const [semester, setSemester] = useState("Winter");
  const [program, setProgram] = useState("ISS");

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
  };

  const handleSelectDelivery = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
    setIsPickerOpen(false);
  };

  const handleCancelEdit = () => {
    setSelectedDeliveryId(null);
  };

  const handleSaveEdit = (updatedDelivery) => {
    const updatedCertificates = certificatesData.map((r) =>
      r.deliveryId === updatedDelivery.deliveryId ? { ...updatedDelivery } : r
    );
    setCertificatesData(updatedCertificates);
    setSelectedDeliveryId(null);
  };

  // EDIT VIEW
  if (selectedDeliveryId !== null) {
    const selectedDelivery = certificatesData.find(
      (r) => r.deliveryId === selectedDeliveryId
    );
    return (
      <div>
        <h2 className="font-bold px-4 pt-2">
          Section {selectedDelivery.section}
        </h2>
        <EditDelivery
          selectedDelivery={selectedDelivery}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
        {/* Add Delivery Button */}
      </div>
    );
  }

  // TABLE VIEW
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
