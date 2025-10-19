"use client";
import { useState } from "react";
import mockCertificates from "./mockcertificates.json"; // MOCK DATA - REMOVE LATER
import CertificatesTable from "./certificatestable";

const certificateHeaders = [
  "Term",
  "ID Record",
  "Program",
  "Program Type",
  "Course Code",
  "Course Name",
  "Section",
  "Status Section",
  "Delivery Mode",
  "Start Date",
  "End Date",
  "Start Time",
  "End Time",
  "Hours Class",
  "M",
  "T",
  "W",
  "Th",
  "F",
  "S",
  "Weeks",
  "Contact Hours",
  "Total Hours",
  "Room Requirements",
  "Exam Booking",
  "Total Hours Course",
  "Semester Code",
  "Course Section",
];

export default function CertificateSchedule() {
  const [certificatesData, setCertificatesData] = useState(mockCertificates); // Currently holds Mock data for certificates - REPLACE WITH API CALL

  return (
    <div className="p-4">
      {/* Selection Dropdowns - CURRENTLY EMPTY SHOWING DEFAULT VALUES!! */}
      <div className="flex justify-center space-x-20 mb-4">
        <label className="flex flex-col">
          Academic Year:
          <select className="border border-gray-300 rounded p-1 bg-white">
            <option value="">2026</option>
          </select>
        </label>
        <label className="flex flex-col">
          Semester:
          <select className="border border-gray-300 rounded p-1 bg-white">
            <option value="">Winter</option>
          </select>
        </label>
        <label className="flex flex-col">
          Program:
          <select className="border border-gray-300 rounded p-1 bg-white">
            <option value="">ISS</option>
          </select>
        </label>
        <button className="button-primary hover:button-hover text-white cursor-pointer px-2 rounded-lg inline-block text-center">
          Edit Course
        </button>
      </div>

      {/* Certificates Table */}
      <CertificatesTable certificatesData={certificatesData} />
    </div>
  );
}
