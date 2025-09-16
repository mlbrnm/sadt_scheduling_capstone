"use client";
import { useState } from "react";

export default function Reports() {

  const reportTypes = ["Program", "Instructor", "Instructor Utilization"];
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dataForReport, setDataForReport] = useState([]);
  const [generationDetails, setGenerationDetails] = useState({ fileName: "", generationTime: "" });
  const dummyPrograms = ["Software Development Diploma", "ITS Diploma", "Film & Video Production Diploma", "Web Development Certificate", "Software Development BTech"];
  const [selectedProgram, setSelectedProgram] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  const handleReportTypeSelect = (type) => {
    setSelectedReportType(type);
    setDataForReport([]);
    setGenerationDetails({ fileName: "", generationTime: "" });
    setError(null);
    setSuccessMessage("");
  };























  return (
    /*Main Content Container*/
    <div className="p-4">
      <h1 className="text-2xl text-center font-bold mb-6">Reports</h1>
      {/*Generate Reports Section*/}
      <h2 className="text-xl text-center mb-6">Select the type of report you want to generate:</h2>





      {/* <div className="mt-4">
        <label htmlFor="programSelect" className="flex mb-2">Select Program:</label>
        <select
          id="programSelect"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        >
          <option value="">-- Select a Program --</option>
          {dummyPrograms.map((program) => (
            <option key={program} value={program}>{program}</option>
          ))}
        </select>
      </div> */}
    </div>
  );
}