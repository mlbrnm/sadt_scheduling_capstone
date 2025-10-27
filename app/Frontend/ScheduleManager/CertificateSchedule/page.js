"use client";
import { useState, useEffect } from "react";
import mockCertificates from "./mockcertificates.json"; // MOCK DATA - REMOVE LATER
import mockInstructors from "./mockinstructors.json"; // MOCK DATA - REMOVE LATER
import CertificatesTable from "./certificatestable";
import DeliveryPicker from "./deliverypicker";
import EditDelivery from "./editdelivery";

export default function CertificateSchedule() {
  // ADD deliveryId INDEX IS FINE FOR NOW!!!
  const [certificatesData, setCertificatesData] = useState([]); // Currently holds Mock data for certificates - REPLACE WITH API CALL
  const [instructorsData, setInstructorsData] = useState([]); // Currently holds Mock data for instructors - REPLACE WITH API CALL
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState([]);
  const [isDeliveryPickerOpen, setIsDeliveryPickerOpen] = useState(false);
  // Dropdowns state STATIC HARDCODED FOR NOW!!!
  const [year, setYear] = useState("2026");
  const [semester, setSemester] = useState("Winter");
  const [program, setProgram] = useState("ISS");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // "Fetching" mock data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // REPLACE WITH API CALL
        // const response = await fetch("");
        // const instructorData = await response.json();
        setInstructorsData(mockInstructors);
        setCertificatesData(
          mockCertificates.map((row, idx) => ({ ...row, deliveryId: idx }))
        );
      } catch (error) {
        setError("Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenPicker = () => {
    setIsDeliveryPickerOpen(true);
  };

  const handleSelectDelivery = (deliveryId) => {
    setSelectedDeliveryIds([deliveryId]);
    setIsDeliveryPickerOpen(false);
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
    // Find all deliveries (for ALL Sections) in the SAME certificate group (course_code, term, program, semester_code)
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
      alert(
        `No other deliveries exist for Section ${targetSection} of ${anchorRow.course_name} (${anchorRow.course_section}).`
      );
      return;
    }
    setSelectedDeliveryIds((prevIds) => [
      ...prevIds,
      siblingDelivery.deliveryId,
    ]);
  };

  // Handler to add another section's delivery from the same group (course_code, term, program, semester_code)
  const handleAddSection = () => {
    if (selectedDeliveryIds.length === 0) return;

    // Use the FIRST selected delivery as the anchor
    const anchorId = selectedDeliveryIds[0];
    const anchorRow = certificatesData.find(
      (row) => row.deliveryId === anchorId
    );
    if (!anchorRow) return;

    const key = certificateGroupKey(anchorRow);
    // Find all deliveries (for ALL Sections) in the SAME certificate group (course_code, term, program, semester_code)
    const certificateGroupDeliveries = certificatesData.filter(
      (row) =>
        row.course_code === key.course_code &&
        row.term === key.term &&
        row.program === key.program &&
        row.semester_code === key.semester_code
    );
    if (certificateGroupDeliveries.length === 0) return;

    // Find the actual selected delivery objects from selected IDs
    // USED AI Q: In Next.js how to get unique values in an array? (USING SET TO FILTER OUT DUPLICATES)
    const selectedDeliveries = selectedDeliveryIds
      .map((id) => certificatesData.find((row) => row.deliveryId === id))
      .filter(Boolean);
    // Find which sections are already selected
    const selectedSections = new Set(
      selectedDeliveries.map((delivery) => delivery.section)
    );

    // Add ALL distinct sections available in the certificate group, sorted alphabetically
    const allSections = Array.from(
      new Set(certificateGroupDeliveries.map((delivery) => delivery.section))
    ).sort();

    // Find the next section not already selected
    const nextSection = allSections.find(
      (section) => !selectedSections.has(section)
    );

    if (!nextSection) {
      alert(
        `All sections are already added for ${anchorRow.course_name} (${anchorRow.course_code}).`
      );
      return;
    }

    // Find a delivery from the next section not already selected
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
    // Find the actual selected delivery objects from selected IDs to send to EditDelivery
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
          instructors={instructorsData}
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
      {isDeliveryPickerOpen && (
        <DeliveryPicker
          certificatesData={certificatesData}
          onSelectDelivery={handleSelectDelivery}
          onClose={() => setIsDeliveryPickerOpen(false)}
        />
      )}
    </div>
  );
}
