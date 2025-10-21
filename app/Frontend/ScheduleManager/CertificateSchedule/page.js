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
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // Dropdowns state STATIC HARDCODED FOR NOW!!!
  const [year, setYear] = useState("2026");
  const [semester, setSemester] = useState("Winter");
  const [program, setProgram] = useState("ISS");

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
  };

  const handleSelectDelivery = (deliveryId) => {
    setSelectedDeliveryIds([deliveryId]);
    setIsPickerOpen(false);
  };

  const handleCancelEdit = () => {
    setSelectedDeliveryIds([]);
  };

  const handleSaveEdit = (updatedDeliveries) => {
    const updatedCertificates = certificatesData.map((r) => {
      const match = updatedDeliveries.find(
        (u) => u.deliveryId === r.deliveryId
      );
      return match ? match : r;
    });
    setCertificatesData(updatedCertificates);
    setSelectedDeliveryIds([]); // REMOVE?!
  };

  // Add another existing delivery for the certificate from the same section
  const handleAddSiblingDelivery = () => {
    if (selectedDeliveryIds.length === 0) return;

    // Use the FIRST selected delivery as the anchor for course_section
    const anchorId = selectedDeliveryIds[0];
    const anchorRow = certificatesData.find((r) => r.deliveryId === anchorId);
    if (!anchorRow) return;

    // Find sibling deliveries in the SAME Section (course_section), not already selected
    const siblingDeliveries = certificatesData.find(
      (r) =>
        r.course_section === anchorRow.course_section &&
        !selectedDeliveryIds.includes(r.deliveryId)
    );

    if (!siblingDeliveries) {
      // No more siblings exist in data to add
      alert("No other deliveries exist for this section.");
      return;
    }
    setSelectedDeliveryIds((prevIds) => [
      ...prevIds,
      siblingDeliveries.deliveryId,
    ]);
  };

  // EDIT VIEW
  if (selectedDeliveryIds.length > 0) {
    const selectedDeliveries = selectedDeliveryIds
      .map((id) => certificatesData.find((r) => r.deliveryId === id))
      .filter(Boolean);

    return (
      <div className="p-4">
        <EditDelivery
          deliveries={selectedDeliveries}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onAddSiblingDelivery={handleAddSiblingDelivery}
        />
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
