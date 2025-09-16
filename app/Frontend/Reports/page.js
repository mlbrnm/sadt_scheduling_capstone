"use client";
import { useState } from "react";
import dummyInstructorData from "./dummyinstructordata.json";
import dummyProgramData from "./dummyprogramdata.json";
import dummyutilizationData from "./dummyutilizationdata.json";

export default function Reports() {

  const reportTypes = ["Program", "Instructor", "Instructor Utilization"];
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dataForReport, setDataForReport] = useState([]);
  const [generationDetails, setGenerationDetails] = useState({ fileName: "", generationTime: "" });
  const dummyPrograms = ["Software Development Diploma", "ITS Diploma", "Software Development BTech"];
  const dummyInstructors = ["Olivia Benson", "Sonny Carisi", "Amanda Rollins"];
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleReportTypeSelect = (type) => {
    setSelectedReportType(type);
    setSelectedProgram("");
    setSelectedInstructor("");
    setDataForReport(null);
    setGenerationDetails({ fileName: "", generationTime: "" });
    setError(null);
    setSuccessMessage("");
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    const programData = [...dummyProgramData];
    setDataForReport(programData);
    const genDate = new Date().toLocaleString();
    // setGenerationDetails({ fileName: `${genDate} - ${program}`, generationTime: genDate }); ---WAIT to do this!!
    setError(null);
    setSuccessMessage("");
  }

  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor);
    const instructorData = [...dummyInstructorData];
    const genDate = new Date().toLocaleString();
    setDataForReport(instructorData);
    // setGenerationDetails({ fileName: `${genDate} - ${instructor}`, generationTime: genDate }); ---WAIT to do this!!
    setError(null);
    setSuccessMessage("");
  }






















  return (
    /*Main Content Container*/
    <div className="p-4">
      <h1 className="text-2xl text-center font-bold mb-6">Reports</h1>
      {/*Generate Reports Section*/}
      <h2 className="text-xl text-center mb-6">Select the type of report you want to view or generate:</h2>
      {/* Report Type Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {reportTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleReportTypeSelect(type)}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer  ${selectedReportType === type ? "button-clicked" : "button-primary hover:button-hover"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {type}
          </button>
        ))}
      </div>





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