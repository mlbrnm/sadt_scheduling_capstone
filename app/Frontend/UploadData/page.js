"use client";
import { useState } from "react";

export default function UploadData() {
  const [selectedDataType, setSelectedDataType] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploadDetails, setUploadDetails] = useState({
    fileName: "",
    uploadTime: "",
  });
  const [previousVersions, setPreviousVersions] = useState([]);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const dataTypes = [
    "Program",
    "Course",
    "Instructor",
    "Instructor Courses",
    "Instructor Skills",
  ];

  const validateFile = (file) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    return validTypes.includes(file.type) || file.name.match(/\.(xlsx|csv)$/i);
  };

  const handleDataTypeSelect = (type) => {
    setSelectedDataType(type);
    setPreviewData([]);
    setUploadDetails({ fileName: "", uploadTime: "" });
    setError(null);
    setSuccessMessage("");
  };

  //map to track which table to upload to
  const tableMap = {
    Program: "programs",
    Course: "courses",
    Instructor: "instructors",
    "Instructor Courses": "instructor_course_history",
    "Instructor Skills": "instructor_skills",
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedDataType) {
      setError("Please select a data type first.");
      return;
    }

    const table = tableMap[selectedDataType]; // dynamically pick table
    if (!table) {
      setError("Invalid data type selected.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage("");

      if (!validateFile(file)) throw new Error("Invalid file type.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("table", table); //send table dynamically

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Upload failed");

      setUploadedFile(file);
      setUploadDetails({
        fileName: file.name,
        uploadTime: new Date().toLocaleString(),
      });
      setPreviewData(result.data || []);
      setSuccessMessage(`File "${file.name}" uploaded successfully!`);
    } catch (err) {
      setError(err.message);
      setUploadDetails({ fileName: "", uploadTime: "" });
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreviousVersions = async () => {
    if (!selectedDataType) {
      setError("Please select a data type first.");
      return [];
    }
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement fetching previous versions from the backend with actual API call
      // const response = await fetch(`/api/versions?type=${selectedDataType}`);
      // const data = await response.json();
      // return data;

      // Fake timeout
      await new Promise((resolve) => setTimeout(resolve, 500)); //!!!REMOVE!!!!
      // Mock data - !!!REMOVE AFTER!!!
      return [
        {
          id: "1",
          fileName: `${selectedDataType.toLowerCase()}_20230815.xlsx`,
          uploadTime: "August 6, 2025, 10:30 AM",
          uploadedBy: "Vanessa Diaz",
          dataType: selectedDataType,
          size: "245 KB",
        },
        {
          id: "2",
          fileName: `${selectedDataType.toLowerCase()}_20230801.xlsx`,
          uploadTime: "August 1, 2025, 2:15 PM",
          uploadedBy: "Vanessa Diaz",
          dataType: selectedDataType,
          size: "238 KB",
        },
      ];
    } catch (error) {
      setError("Failed to load previous versions.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreButtonClick = async () => {
    const versions = await fetchPreviousVersions();
    setPreviousVersions(versions);
    setShowVersionsModal(true);
  };

  const handleVersionSelect = async (version) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage("");
      // TODO: Implement version selection logic with actual API call
      // const response = await fetch(`/api/versions/${version.id}`);
      // const data = await response.json();

      // Fake timeout
      await new Promise((resolve) => setTimeout(resolve, 800)); //!!!REMOVE!!!!
      // Mock data - !!!REMOVE AFTER!!!
      const mockData = {
        Program: [
          {
            Group: "Cyber Security",
            Acronym: "CSA",
            Program: "Cyber Security Analyst (CSA)",
            AcademicChair: "CM",
            AssociateDean: "Jessica Whiting",
            Credential: "Post-diploma Certificate",
            Courses: "10",
            Intakes: "Fall",
            Duration: "18 months",
            StartingDate: "Jan-24",
          },
          {
            Group: "Cyber Security",
            Acronym: "CS",
            Program: "Cyber Security for Control Systems (CS)",
            AcademicChair: "CM",
            AssociateDean: "Jessica Whiting",
            Credential: "Post-diploma Certificate",
            Courses: "10",
            Intakes: "Fall-Spring",
            Duration: "21 weeks",
            StartingDate: "Jan-24",
          },
          {
            Group: "Cyber Security",
            Acronym: "ISA",
            Program: "Information Security Analyst (ISA)",
            AcademicChair: "CM",
            AssociateDean: "Jessica Whiting",
            Credential: "Post-diploma Certificate",
            Courses: "9",
            Intakes: "Fall-Spring",
            Duration: "21 weeks",
            StartingDate: "Jan-24",
          },
          {
            Group: "Cyber Security",
            Acronym: "ISS",
            Program: "Information Systems Security (ISS)",
            AcademicChair: "CM",
            AssociateDean: "Jessica Whiting",
            Credential: "Diploma",
            Courses: "20",
            Intakes: "Fall-Winter-Spring",
            Duration: "2 years",
            StartingDate: "Jan-24",
          },
        ],
      };
      setPreviewData(mockData[version.dataType] || []); // !!!CHANGE WITH REAL DATA!!!
      setUploadDetails({
        fileName: `RESTORED_${version.fileName}`,
        uploadTime: "August 6, 2025, 10:30 AM", // !!!CHANGE WITH REAL DATA!!!
      });
      setShowVersionsModal(false);
      setSuccessMessage(`Successfully restored from ${version.fileName}`);
    } catch (error) {
      setError("Failed to restore version.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl text-center font-bold mb-6">
        Upload Institutional Data
      </h1>

      {/* Data Type Selection Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {dataTypes.map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
              selectedDataType === type
                ? "button-clicked"
                : "button-primary hover:button-hover"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleDataTypeSelect(type)}
            disabled={isLoading}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
          <p>{successMessage}</p>
        </div>
      )}

      {!selectedDataType ? (
        <div className="text-center py-8 text-gray-600">
          Select a table above to view or upload institutional data.
        </div>
      ) : (
        <>
          {/* Current Database Info */}
          <div className="flex justify-center items-end space-x-8 mb-8">
            <div className="flex space-x-4 mb-4">
              <h2 className="font-bold">
                Current Database:{" "}
                <span className="font-normal">
                  {uploadDetails.fileName || "-"}
                </span>
              </h2>
              <p className="font-bold">
                Uploaded:{" "}
                <span className="font-normal italic">
                  {uploadDetails.uploadTime || "-"}
                </span>
              </p>
            </div>

            {/* Upload File Button & Restore button */}
            <div className="bg-[#D4D4D4] p-4 space-x-4 rounded-lg">
              <div className="flex items-center space-x-4 mb-2">
                <p className="font-bold mb-2 md:mb-0">Upload New Data:</p>
                <label
                  className={`button-primary hover:button-hover text-white cursor-pointer px-4 py-2 rounded-lg inline-block text-center ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Uploading..." : "Browse..."}
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx, .csv"
                    onChange={(e) => {
                      const table = tableMap[selectedDataType];
                      if (!table) {
                        setError("Please select a valid data type first.");
                        return;
                      }
                      handleFileUpload(e);
                    }}
                    disabled={isLoading}
                  />
                </label>
              </div>
              <button
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={handleRestoreButtonClick}
                disabled={isLoading || !selectedDataType}
              >
                Restore previous versions...
              </button>
            </div>
          </div>

          {/* Preview table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
            </div>
          ) : previewData.length > 0 ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="py-3 px-4 text-left border-b">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-4 border-b">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              {uploadedFile
                ? "No valid data found in the uploaded file"
                : "No data to display. Upload a file to preview."}
            </div>
          )}
        </>
      )}

      {/* Version Modal */}
      {showVersionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Previous Versions: {selectedDataType}
              </h2>
              <button
                onClick={() => setShowVersionsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {previousVersions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No previous versions found for this data type
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">File Name</th>
                      <th className="text-left p-3">Uploaded</th>
                      <th className="text-left p-3">By</th>
                      <th className="text-left p-3">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousVersions.map((version) => (
                      <tr
                        key={version.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleVersionSelect(version)}
                      >
                        <td className="p-3">{version.fileName}</td>
                        <td className="p-3">{version.uploadTime}</td>
                        <td className="p-3">{version.uploadedBy}</td>
                        <td className="p-3">{version.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowVersionsModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
