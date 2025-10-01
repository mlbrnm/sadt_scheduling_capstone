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
  const [reportHistory, setReportHistory] = useState([]);

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
    // setIsLoading(true);
    // check if there's data to generate the report
    if (!dataForReport || dataForReport.length === 0) {
      setError("No data available for report generation.");
      // setIsLoading(false);
      return;
    }
    // map the data + add additional details
    const programInfo = dataForReport[0];
    if (!programInfo || !programInfo.programData) {
      setError("No changes to data since previous report. Unable to generate new report.");
      setIsLoading(false);
      return;
    }
    const reportData = programInfo.programData.map((enrolInfo) => ({
      Program: programInfo.program,
      "Program Type": programInfo.programType,
      Semester: enrolInfo.semester,
      "Students Applied": enrolInfo.applied,
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
    // send report to be stored in history for future download if needed
    const csvContent = convertToCSV(reportData);
    const fileName = `Program_Report_${programInfo.program.replace(
      /\s+/g,
      "_"
    )}.csv`;
    // newest first
    setReportHistory((prevHistory) => [
      { fileName, csvContent,generationTime: new Date().toLocaleString(), reportType: "Program", selectedItem: selectedProgram }, ...prevHistory
    ]);
    setSuccessMessage("Report generated successfully!");
    setTimeout(() => setSuccessMessage(""), 5000); // Clear success message after 5 seconds
    // complete report generation
    // setIsLoading(false);
    setError(null);
  };

  //TEMPORARY COMMENT OUTT!!!!
  // GENERATE INSTRUCTOR REPORT
  // const generateInstructorReport = () => {
  //   // initiate report generation
  //   setIsLoading(true);
  //   // check if there's data to generate the report
  //   if (!dataForReport) {
  //     setError("No data available for report generation.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   // // This code block is AI generated using perplexity
  //   // if (!dataForReport.teachingHistory) {
  //   //   setError("Invalid instructor data.");
  //   //   setIsLoading(false);
  //   //   return;
  //   // }

  //   setTimeout(() => {
  //     if (!dataForReport?.teachingHistory) {
  //       setError("Invalid instructor data.");
  //       setIsLoading(false);
  //       return;
  //     }
  //   });

  //   // make inital section (instructor details)
  //   const instructorDetails = {
  //     Section: "\n~~~~~~INSTRUCTOR DETAILS~~~~~~\n",
  //     Name: dataForReport.name,
  //     "Current Contract": dataForReport.contract,
  //     "Active?": `------Status - ${dataForReport.active}-------`,
  //     "Current Semester Hours": dataForReport.currentSemesterHours,
  //     "Current Total Hours": dataForReport.currentTotalHours,
  //     Status: dataForReport.status,
  //     "Teaching Since": dataForReport.teachingSince,
  //     "Course Taught": dataForReport.coursesTaught.join(", "),
  //   };

  //   // make teaching history section (map teaching history data)
  //   const teachingHistoryData = dataForReport.teachingHistory.map(
  //     (history) => ({
  //       Section: "\n~~~~~~~~~~~~~~~~TEACHING HISTORY~~~~~~~~~~~~~~~~\n",
  //       Year: history.year,
  //       Semester: history.semester,
  //       Contract: history.contract,
  //       "Semester Hours": history.semesterHours,
  //       "Target Hours": history.targetHours,
  //       "Met Target?": `------Target Hours Met? - ${history.metTarget}-------`,
  //       "Courses Taught": history.coursesTaught.join(", "),
  //     })
  //   );

  //   // combine instructor details + teaching history to make full data
  //   const reportData = [instructorDetails, ...teachingHistoryData];
  //   // set the mapped data to be used in the report
  //   setDataForReport(reportData);
  //   // name + timestamp the file
  //   setGenerationDetails({
  //     fileName: `Instructor_Report_${selectedInstructor.replace(
  //       /\s+/g,
  //       "_"
  //     )}.csv`,
  //     generationTime: new Date().toLocaleString(),
  //   });
  //   setError(null); //no errors because it should've worked if you get to this point
  //   // complete report generation
  //   setIsLoading(false);
  // };

  // AI generated for debugging purposes ONLY --> will be changed back to original function above that's commented out once debugging is complete
  const generateInstructorReport = () => {
  console.log("🔥 STARTING - Setting isLoading to TRUE");
  setIsLoading(true);
  
  setTimeout(() => {
    console.log("🔥 TIMEOUT STARTED");
    
    if (!dataForReport) {
      setError("Invalid instructor data.");
      setIsLoading(false);
      return;
    }

    if (!dataForReport?.teachingHistory) {
      setError("No changes to data since previous report. Unable to generate new report.");
      setIsLoading(false);
      return;
    }

    // report generation logic here...
    const reportData = [{
      Section: "TEST",
      Name: dataForReport.name || "Test Name",
    }];
    
    setDataForReport(reportData);
    setGenerationDetails({
      fileName: `Test_Report.csv`,
      generationTime: new Date().toLocaleString(),
    });

    // send report to be stored in history for future download if needed
    const csvContent = convertToCSV(reportData);
    const fileName = `Instructor_Report_${selectedInstructor.replace(
      /\s+/g,
      "_"
    )}.csv`;
    // newest first
    setReportHistory((prevHistory) => [
      { fileName, csvContent, generationTime: new Date().toLocaleString(), reportType: "Instructor", selectedItem: selectedInstructor }, ...prevHistory
    ]);
    
    console.log("🔥 FINISHED - Setting isLoading to FALSE");
    setIsLoading(false);
  }, 3000); // 3 second delay
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
    // check for previously generated report with same data
    if (dataForReport[0] && dataForReport[0]["Report Type"]) {
      setError("No changes to data since previous report. Unable to generate new report.");
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
    // send report to be stored in history for future download if needed
    const csvContent = convertToCSV(reportData);
    const fileName = `Instructor_Utilization_Report_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    // newest first
    setReportHistory((prevHistory) => [
      { fileName, csvContent, generationTime: new Date().toLocaleString(), reportType: "Instructor Utilization", selectedItem: "All" }, ...prevHistory
    ]);
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
  // if no params are passed, it will use the current report data
  const downloadCSV = (csvContent = null, fileName = null) => {
    const downloadableContent = csvContent || convertToCSV(dataForReport);
    const fileNameToUse = fileName || generationDetails.fileName;

    const blob = new Blob([downloadableContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileNameToUse);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // MAIN RETURN OF PAGE.JS
  return (
    /*Main Content Container*/
    <div className="p-4">      
      {/* Generating Report (Loading...) Overlay*/}
      {isLoading && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          <div className="bg-neutral-100 p-8 rounded-xl shadow-2xl opacity-80 flex-col items-center">
            <div className="flex justify-center mb-4">
              <div className="spinner"></div>
            </div>
            <p className="text-md font-semibold text-gray-600">
              Generating Report...
            </p>
          </div>
        </div>
      )}
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
          {reportHistory.filter(r => r.reportType === "Program" && r.selectedItem === selectedProgram).length > 0 && 
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Previous Program Reports</h3>
            <ul className="border rounded-lg bg-gray-50">
              {reportHistory.filter(r => r.reportType === "Program" && r.selectedItem === selectedProgram).map((report, index) => (
                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-100">
                  <div>
                  {report.fileName} - {report.generationTime}
                  </div>
                  <button
                    onClick={() => downloadCSV(report.csvContent, report.fileName)}
                    className="ml-4 px-3 py-1 rounded-lg text-black cursor-pointer button-secondary hover:text-underline"
                  >
                    Click to Download
                  </button>
                </li>
              ))}
            </ul>
          </div>}
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
      {reportHistory.filter(r => r.reportType === "Instructor" && r.selectedItem === selectedInstructor).length > 0 && (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Previous Instructor Reports</h3>
        <ul className="border rounded-lg bg-gray-50">
          {reportHistory
            .filter(r => r.reportType === "Instructor" && r.selectedItem === selectedInstructor)
            .map((report, index) => (
              <li key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                <div>
                  <span className="font-medium text-gray-800">{report.selectedItem}</span>
                  <span className="text-sm text-gray-500 ml-2">({report.generationTime})</span>
                </div>
                <button
                  onClick={() => downloadCSV(report.csvContent, report.fileName)}
                  className="px-3 py-1 rounded text-sm text-black cursor-pointer button-secondary hover:button-underline"
                >
                  Click to Download
                </button>
              </li>
            ))}
        </ul>
      </div>
    )}
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
            {isLoading ? <>Processing...</> : "Generate New Report"}
          </button>
        </div>
      )}
      {/* Download Report Button */}
      {dataForReport &&
        dataForReport.length > 0 &&
        generationDetails.fileName &&
        !isLoading && (
          <div className="text-center mb-6">
            <button
              onClick={downloadCSV}
              className="px-6 py-3 rounded-lg text-gray-500 cursor-pointer button-secondary hover:button-hover hover:text-underline"
            >
              Download Newly Generated Report
            </button>
          </div>
        )}
      {/* Showing Previous Instructor Utilization Reports */}
      {selectedReportType === "Instructor Utilization" && reportHistory.filter(r => r.reportType === "Instructor Utilization").length > 0 && (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Previous Instructor Utilization Reports</h3>
        <ul className="border rounded-lg bg-gray-50">
          {reportHistory
            .filter(r => r.reportType === "Instructor Utilization")
            .map((report, index) => (
              <li key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                <div>
                  <span className="font-medium text-gray-800">{report.selectedItem}</span>
                  <span className="text-sm text-gray-500 ml-2">({report.generationTime})</span>
                </div>
                <button
                  onClick={() => downloadCSV(report.csvContent, report.fileName)}
                  className="px-3 py-1 rounded text-sm text-black cursor-pointer button-secondary hover:button-underline"
                >
                  Click to Download
                </button>
              </li>
            ))}
        </ul>
      </div>
    )}
    </div>
  );
}
