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
    const updatedCertificates = certificatesData.map((row) => {
      const match = updatedDeliveries.find(
        (delivery) => delivery.deliveryId === row.deliveryId
      );
      return match ? match : row;
    });
    setCertificatesData(updatedCertificates);
    setSelectedDeliveryIds([]);
  };

  // Helper to create a certificate group key for a delivery for lookup
  const certificateGroupKey = (row) => ({
    course_code: row.course_code,
    term: row.term,
    program: row.program,
    semester_code: row.semester_code,
  });

  // Handler to add another existing delivery for the certificate from the same section
  const handleAddSiblingDelivery = (section) => {
    if (selectedDeliveryIds.length === 0) return;

    // Use the FIRST selected delivery as the anchor
    const anchorId = selectedDeliveryIds[0];
    const anchorRow = certificatesData.find(
      (row) => row.deliveryId === anchorId
    );
    if (!anchorRow) return;

    // Determine target section
    const targetSection = section || anchorRow.section;

    const key = certificateGroupKey(anchorRow);
    const certificateGroupDeliveries = certificatesData.filter(
      (row) =>
        row.course_code === key.course_code &&
        row.term === key.term &&
        row.program === key.program &&
        row.semester_code === key.semester_code
    );

    // Find a sibling delivery in the SAME section not already selected
    const siblingDelivery = certificateGroupDeliveries.find(
      (row) =>
        row.section === targetSection &&
        !selectedDeliveryIds.includes(row.deliveryId)
    );

    if (!siblingDelivery) {
      alert(`No other deliveries exist for Section ${targetSection}.`);
      return;
    }
    setSelectedDeliveryIds((prevIds) => [
      ...prevIds,
      siblingDelivery.deliveryId,
    ]);
  };

  // Handler to add another section's delivery from the same cohort
  const handleAddSection = () => {
    if (selectedDeliveryIds.length === 0) return;

    // Use the FIRST selected delivery as the anchor
    const anchorId = selectedDeliveryIds[0];
    const anchorRow = certificatesData.find(
      (row) => row.deliveryId === anchorId
    );
    if (!anchorRow) return;

    const key = certificateGroupKey(anchorRow);
    // Find all deliveries in the SAME certificate group (course_code, term, program, semester_code)
    const certificateGroupDeliveries = certificatesData.filter(
      (row) =>
        row.course_code === key.course_code &&
        row.term === key.term &&
        row.program === key.program &&
        row.semester_code === key.semester_code
    );
    if (certificateGroupDeliveries.length === 0) return;

    // Get currently selected deliveries in this certificate group
    const selectedDeliveries = selectedDeliveryIds
      .map((id) => certificatesData.find((row) => row.deliveryId === id))
      .filter(Boolean);

    const selectedSections = new Set(
      selectedDeliveries.map((delivery) => delivery.section)
    );

    // Add distinct sections available in the certificate group, sorted alphabetically
    const allSections = Array.from(
      new Set(certificateGroupDeliveries.map((delivery) => delivery.section))
    ).sort();

    // Find the next section not already selected
    const nextSection = allSections.find(
      (section) => !selectedSections.has(section)
    );
    if (!nextSection) {
      alert("All sections are already added.");
      return;
    }
    // Find a delivery from the certificate group with the next section
    const deliveryToAdd = certificateGroupDeliveries.find(
      (delivery) =>
        delivery.section === nextSection &&
        !selectedDeliveryIds.includes(delivery.deliveryId)
    );
    if (!deliveryToAdd) {
      alert("No delivery found for the next section.");
      return;
    }
    setSelectedDeliveryIds((prevIds) => [...prevIds, deliveryToAdd.deliveryId]);
  };

  // EDIT VIEW
  if (selectedDeliveryIds.length > 0) {
    const selectedDeliveries = selectedDeliveryIds
      .map((id) => certificatesData.find((row) => row.deliveryId === id))
      .filter(Boolean);

    return (
      <div className="p-4">
        <EditDelivery
          deliveries={selectedDeliveries}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onAddSiblingDelivery={handleAddSiblingDelivery}
          onAddSection={handleAddSection}
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
          Edit Certificate
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
