"use client";
import { useState } from "react";
import dummyInstructorData from "./dummyinstructordata.json";
import dummyProgramData from "./dummyprogramdata.json";
import dummyutilizationData from "./dummyutilizationdata.json";

export default function Reports() {
  const reportTypes = ["Program", "Instructor", "Instructor Utilization"];
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dataForReport, setDataForReport] = useState([]);
  const [generationDetails, setGenerationDetails] = useState({
    fileName: "",
    generationTime: "",
  });
  const dummyPrograms = [
    "Software Development Diploma",
    "ITS Diploma",
    "Software Development BTech",
  ];
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
      "Software Development BTech": "SD BTech",
    };
    //find the corresponding data for the selected program
    const desiredProgram = programMapping[program];
    const desiredProgramData = dummyProgramData.filter(
      (item) => item.program === desiredProgram
    );
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
  };

  //GET THE DATA FOR THE INSTRUCTOR YOU WANT
  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor); //this is the instructor we want
    // find that instructor's data
    const specificInstructorData = dummyInstructorData.find(
      (item) => item.name === instructor
    );
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
  };

  // MAKE SURE TO GENERATE THE RIGHT TYPE OF REPORT
  const handleGenerateReport = () => {
    if (selectedReportType === "Program") {
      generateProgramReport();
    } else if (selectedReportType === "Instructor") {
      generateInstructorReport();
    } else if (selectedReportType === "Instructor Utilization") {
      generateInstructorUtilizationReport();
    }
  };

  // GENERATE PROGRAM REPORT
  const generateProgramReport = () => {
    // initiate report generation
    setIsLoading(true);
    // check if there's data to generate the report
    if (!dataForReport || dataForReport.length === 0) {
      setError("No data available for report generation.");
      setIsLoading(false);
      return;
    }
    // map the data + add additional details
    const programInfo = dataForReport[0].program;
    const reportData = programInfo.programData.map((enrolInfo) => ({
      Program: programInfo.program,
      "Program Type": programInfo.programType,
      Semester: enrolInfo.semester,
      "Students Applied": enrolInfo.applied,
      Semester: enrolInfo.semester,
      "Students Newly Admitted": enrolInfo.newlyAdmitted,
      "Students Continuing": enrolInfo.continuing,
      "Students Graduated": enrolInfo.graduated,
      "Academic Chair": enrolInfo.academicChair,
    }));
    // set the mapped data to be used in the report
    setDataForReport(reportData);
    // name + timestamp the file
    setGenerationDetails({
      fileName: `Program_Report_${programInfo.program.replace(
        /\s+/g,
        "_"
      )}.csv`,
      generationTime: new Date().toLocaleString(),
    });
    // complete report generation
    setIsLoading(false);
    setError(null);
  };

  // GENERATE INSTRUCTOR REPORT
  const generateInstructorReport = () => {
    // initiate report generation
    setIsLoading(true);
    // check if there's data to generate the report
    if (!dataForReport) {
      setError("No data available for report generation.");
      setIsLoading(false);
      return;
    }

    // make inital section (instructor details)
    const instructorDetails = {
      Section: "\n~~~~~~INSTRUCTOR DETAILS~~~~~~\n",
      Name: dataForReport.name,
      "Current Contract": dataForReport.contract,
      "Active?": `------Status - ${dataForReport.active}-------`,
      "Current Semester Hours": dataForReport.currentSemesterHours,
      "Current Total Hours": dataForReport.currentTotalHours,
      Status: dataForReport.status,
      "Teaching Since": dataForReport.teachingSince,
      "Course Taught": dataForReport.coursesTaught.join(", "),
    };

    // make teaching history section (map teaching history data)
    const teachingHistoryData = dataForReport.teachingHistory.map(
      (history) => ({
        Section: "\n~~~~~~~~~~~~~~~~TEACHING HISTORY~~~~~~~~~~~~~~~~\n",
        Year: history.year,
        Semester: history.semester,
        Contract: history.contract,
        "Semester Hours": history.semesterHours,
        "Target Hours": history.targetHours,
        "Met Target?": `------Target Hours Met? - ${history.metTarget}-------`,
        "Courses Taught": history.coursesTaught.join(", "),
      })
    );

    // combine instructor details + teaching history to make full data
    const reportData = [instructorDetails, ...teachingHistoryData];
    // set the mapped data to be used in the report
    setDataForReport(reportData);
    // name + timestamp the file
    setGenerationDetails({
      fileName: `Instructor_Report_${dataForReport.name.replace(
        /\s+/g,
        "_"
      )}.csv`,
      generationTime: new Date().toLocaleString(),
    });
    setError(null); //no errors because it should've worked if you get to this point
    // complete report generation
    setIsLoading(false);
  };

  // GENERATE INSTRUCTOR UTILIZATION REPORT
  const generateInstructorUtilizationReport = () => {
    // initiate report generation
    setIsLoading(true);
    // check if there's data to generate the report
    if (!dataForReport || dataForReport.length === 0) {
      setError("No data available for report generation.");
      setIsLoading(false);
      return;
    }
    // map the data + add additional details
    const reportData = dataForReport.map((item) => ({
      "Report Type": "Instructor Utilization",
      ...item,
    }));
    // set the mapped data to be used in the report
    setDataForReport(reportData);
    // name + timestamp the file
    setGenerationDetails({
      fileName: `Instructor_Utilization_Report_${new Date()
        .toLocaleDateString()
        .replace(/\//g, "-")}.csv`,
      generationTime: new Date().toLocaleString(),
    });
    setError(null); //no errors because it should've worked if you get to this point
    // complete report generation
    setIsLoading(false);
  };

  // CONVERTING REPORT TO CSV FOR EASE
  // This code block is AI generated using perplexity
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");

    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  };

  // FUNCTION TO ALLOW FOR DOWNLOAD OF CSV FILE
  const downloadCSV = () => {
    const csvData = convertToCSV(dataForReport);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", generationDetails.fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // MAIN RETURN OF PAGE.JS
  return (
    /*Main Content Container*/
    <div className="p-4">
      <h1 className="text-2xl text-center font-bold mb-6">Reports</h1>
      {/*Generate Reports Section*/}
      <h2 className="text-xl text-center mb-6">
        Select the type of report you want to view or generate:
      </h2>
      {/* Report Type Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {reportTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleReportTypeSelect(type)}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer  ${
              selectedReportType === type
                ? "button-clicked"
                : "button-primary hover:button-hover"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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

      {/* Program Selection Dropdown */}
      {selectedReportType === "Program" && (
        <div className="mb-6">
          <label
            htmlFor="programSelect"
            className="block text-lg font-medium mb-2"
          >
            Select Program:
          </label>
          <select
            id="programSelect"
            value={selectedProgram}
            onChange={(e) => handleProgramSelect(e.target.value)}
            className="p-2 w-full max-w-sm"
            disabled={isLoading}
          >
            <option value="">-- Select a Program --</option>
            {dummyPrograms.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Instructor Selection Dropdown */}
      {selectedReportType === "Instructor" && (
        <div className="mb-6">
          <label
            htmlFor="instructorSelect"
            className="block text-lg font-medium mb-2"
          >
            Select Instructor:
          </label>
          <select
            id="instructorSelect"
            value={selectedInstructor}
            onChange={(e) => handleInstructorSelect(e.target.value)}
            className="p-2 w-full max-w-sm"
            disabled={isLoading}
          >
            <option value="">-- Select an Instructor --</option>
            {dummyInstructors.map((instructor) => (
              <option key={instructor} value={instructor}>
                {instructor}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Generate Report Button */}
      {((selectedReportType === "Program" && selectedProgram) ||
        (selectedReportType === "Instructor" && selectedInstructor) ||
        selectedReportType === "Instructor Utilization") && (
        <div className="text-center mb-6">
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg text-white cursor-pointer  button-primary hover:button-hover ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {/* {isLoading ? "Generating Report..." : "Generate Report"} */}
          </button>
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
