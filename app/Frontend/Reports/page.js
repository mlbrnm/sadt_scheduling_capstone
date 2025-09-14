"use client";
import { useState } from "react";

export default function Reports() {

  const reportTypes = ["Program", "Instructor", "Instructor Utilization"];
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dataForReport, setDataForReport] = useState([]);
  const [generationDetails, setGenerationDetails] = useState({ fileName: "", uploadTime: "" });


  const handleReportTypeSelect = (type) => {
    setSelectedReportType(type);
    setDataForReport([]);
    setGenerationDetails({ fileName: "", uploadTime: "" });
    setError(null);
    setSuccessMessage("");
  };























  return (
    /*Main Content Container*/
    <div className="p-4">
      <h1 className="text-2xl text-center font-bold mb-6">Reports</h1>
      {/*Content Goes Here*/}
      <div className="bg-white shadow-md rounded-lg p-6">
        <p>Reports placeholder</p>
      </div>
    </div>
  );
}