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

  //PICK WHICH TYPE OF REPORT YOU WANT
  const handleReportTypeSelect = (type) => {
    setSelectedReportType(type);
    setSelectedProgram("");
    setSelectedInstructor("");
    if (type === "Instructor Utilization") {
      setDataForReport(dummyutilizationData);
    } else {
      setDataForReport(null);
    }
    setGenerationDetails({ fileName: "", generationTime: "" });
    setError(null);
    setSuccessMessage("");
  };

  //GET THE DATA FOR THE PROGRAM YOU WANT
  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    //mapping program options to according ones in dummy data
    const programMapping = {
    "Software Development Diploma": "SD",
    "ITS Diploma": "ITS", 
    "Software Development BTech": "SD BTech"
  };
    //find the corresponding data for the selected program
    const desiredProgram = programMapping[program];
    const desiredProgramData = dummyProgramData.filter(item => item.program === desiredProgram);
    if (desiredProgramData && desiredProgramData.length > 0) {
      setDataForReport(desiredProgramData);
      setError(null);
    } else {
      setDataForReport(null);
      setError("No data found for this program.");
    }
    // const genDate = new Date().toLocaleString();
    // setGenerationDetails({ fileName: `${genDate} - ${program}`, generationTime: genDate }); ---WAIT to do this!!
    setSuccessMessage("");
  }

  //GET THE DATA FOR THE INSTRUCTOR YOU WANT
  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor);  //this is the instructor we want
    // find that instructor's data 
    const specificInstructorData = dummyInstructorData.find(item => item.name === instructor);
    if (specificInstructorData) {
      setDataForReport(specificInstructorData);
      setError(null);
    } else {
      setDataForReport(null);
      setError("No data found for this instructor.");
    }
    // const genDate = new Date().toLocaleString();
    // setGenerationDetails({ fileName: `${genDate} - ${instructor}`, generationTime: genDate }); ---WAIT to do this!!
    setSuccessMessage("");
  }

  {/* GENERATE PROGRAM REPORT */}
  const generateProgramReport = () => {
    setIsLoading(true);
    if (!dataForReport || dataForReport.length === 0) {
      setError("No data available for report generation.");
      setIsLoading(false);
      return;
    }
    const programInfo = dataForReport[0].program;
    const reportData = programInfo.programData.map(enrolInfo => ({
      "Program": programInfo.program,
      "Program Type": programInfo.type,
      "Semester": enrolInfo.semester,
      "Students Applied": enrolInfo.applied,
      "Semester": enrolInfo.semester,
      "Students Newly Admitted": enrolInfo.newlyAdmitted,
      "Students Continuing": enrolInfo.continuing,
      "Students Graduated": enrolInfo.graduated,
      "Academic Chair": enrolInfo.academicChair,
    }));

    setDataForReport(reportData);
    setGenerationDetails({ fileName: `Program_Report_${programInfo.program.replace(/\s+/g, "_")}.csv`, generationTime: new Date().toLocaleString() });
    setError(null);


    // Simulate report generation
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Program report generated successfully for ${programName}.`);
    }, 2000);
  };

  {/* GENERATE INSTRUCTOR REPORT */}


  {/* GENERATE INSTRUCTOR UTILIZATION REPORT */}




  // CONVERTING REPORT TO CSV FOR EASE
  // This code block is AI generated using perplexity
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };












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

      {/* This code block is AI generated using perplexity*/}
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* This code block is AI generated using perplexity*/} 
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
          <p>{successMessage}</p>
        </div>
      )}





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