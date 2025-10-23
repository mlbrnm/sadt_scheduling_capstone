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

  // Handler to add another existing delivery for the certificate from the same section
  // Using .find to get ONE sibling delivery at a time, can use .filter to get ALL if needed (haven't decided on how to handle this at the moment!!)
  const handleAddSiblingDelivery = (section) => {
    if (selectedDeliveryIds.length === 0) return;

    // Use the FIRST selected delivery as the anchor for course_section
    const anchorId = selectedDeliveryIds[0];
    const anchorRow = certificatesData.find((r) => r.deliveryId === anchorId);
    if (!anchorRow) return;

    // Determine target section
    const targetSection = section || anchorRow.section;

    const key = cohortKey(anchorRow);
    const cohortDeliveries = certificatesData.filter(
      (r) =>
        r.course_code === key.course_code &&
        r.term === key.term &&
        r.program === key.program &&
        r.semester_code === key.semester_code
    );

    // Find a sibling delivery in the SAME section not already selected
    const siblingDelivery = cohortDeliveries.find(
      (r) =>
        r.section === targetSection &&
        !selectedDeliveryIds.includes(r.deliveryId)
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

  // Helper to create a cohort key for a delivery for lookup
  const cohortKey = (row) => ({
    course_code: row.course_code,
    term: row.term,
    program: row.program,
    semester_code: row.semester_code,
  });

  // Handler to add another section's delivery from the same cohort
  const handleAddSection = () => {
    if (selectedDeliveryIds.length === 0) return;

    // Use the FIRST selected delivery as the anchor for cohort
    const anchorId = selectedDeliveryIds[0];
    const anchorRow = certificatesData.find((r) => r.deliveryId === anchorId);
    if (!anchorRow) return;

    const key = cohortKey(anchorRow);
    // Find all deliveries in the SAME cohort (course_code, term, program, semester_code)
    const cohortDeliveries = certificatesData.filter(
      (r) =>
        r.course_code === key.course_code &&
        r.term === key.term &&
        r.program === key.program &&
        r.semester_code === key.semester_code
    );
    if (cohortDeliveries.length === 0) return;

    const selectedDeliveries = selectedDeliveryIds
      .map((id) => certificatesData.find((r) => r.deliveryId === id))
      .filter(Boolean);

    const selectedSections = new Set(selectedDeliveries.map((d) => d.section));

    // Add distinct sections available in the cohort, sorted alphabetically
    const allSections = Array.from(
      new Set(cohortDeliveries.map((d) => d.section))
    ).sort();

    // Find the next section not already selected
    const nextSection = allSections.find(
      (section) => !selectedSections.has(section)
    );
    if (!nextSection) {
      alert("All sections are already added.");
      return;
    }
    // Find a delivery from the cohort with the next section
    const deliveryToAdd = cohortDeliveries.find(
      (d) =>
        d.section === nextSection && !selectedDeliveryIds.includes(d.deliveryId)
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
      .map((id) => certificatesData.find((r) => r.deliveryId === id))
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
