// Some logic for file validation, dynamic table formatting, session handling,
// async uploads, and fetching previous versions was assisted by AI.
// UI layout, styling, logic, and state management were implemented independently.

"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
//import { createClient } from "@supabase/supabase-js";

export default function UploadData() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
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
  const [unmatchedCourses, setUnmatchedCourses] = useState([]);

  // const authorize_user = async () => {
  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession();

  //   if (!session) {
  //     throw new Error("Unauthorized user - access denied.");
  //   }

  //   return session.access_token;
  // };

  //persist the user's session so we can track user info
  //Created with help of AI - quicker implementation
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setError("Error fetching session");
        console.error(error);
        return;
      }

      if (session) {
        setSession(session);
        console.log("user session:", session);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const userEmail = session?.user?.email;

  const dataTypes = ["Programs", "Courses", "Instructors", "OTR Loading Sheet"];

  // Auto-load current data when data type is selected
  useEffect(() => {
    if (selectedDataType) {
      const table = tableMap[selectedDataType];
      if (table) {
        fetchTableData(table);
      }
    }
  }, [selectedDataType]);

  //Created with the help of AI (making sure bases were covered)
  const validateFile = (file) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    return validTypes.includes(file.type) || file.name.match(/\.(xlsx|csv)$/i);
  };

  //this function will track the header names to be mapped and formatted for user display from database
  const headersMap = {
    //Programs headers mapping
    program_id: "Program ID",
    group: "Group",
    acronym: "Acronym",
    program: "Program",
    academic_chair: "Academic Chair",
    associate_dean: "Associate Dean",
    credential: "Credential",
    courses: "Courses",
    intakes: "Intakes",
    duration: "Duration",
    starting_date: "Starting Date",
    delivery: "Delivery",
    status: "Status",
    uploaded_at: "Uploaded At",
    uploaded_by: "Uploaded By",

    //Courses headers mapping
    course_id: "Course ID",
    course_code: "Course Code",
    course_name: "Course Name",
    program_major: "Program Major",
    group: "Group",
    credits: "Credits",
    contact_hours: "Contact Hours",
    program_type: "Program Type",
    credential: "Credential",
    req_elec: "Req Elec",
    delivery_method: "Delivery Method",
    online_hrs: "Online Hours",
    class_hrs: "Class Hours",
    ac_name_loading: "AC Name - Loading",
    school: "School",
    exam_otr: "Exam OTR",
    semester: "Semester",
    fall: "Fall",
    winter: "Winter",
    spring_summer: "Spring/Summer",
    notes: "Notes",
    uploaded_by: "Uploaded By",
    uploaded_at: "Uploaded At",

    //Instructors header mapping
    instructor_id: "Instructor ID",
    instructor_name: "First Name",
    instructor_lastname: "Last Name",
    contract_type: "Contract Type",
    instructor_status: "Instructor Status",
    time_off: "Time Off",
    uploaded_by: "Uploaded By",
    uploaded_at: "Uploaded At",
    salaried_begin_date: "Start Date",
    contract_end: "End Date",
    reporting_ac: "Reporting AC",
    cch_target_ay2025: "CCH Target AY2025",
    primary_program: "Primary Program",
    position_number: "Position #",
    years_as_temp: "Years as Temp",
    highest_education_tbc: "Highest Education - TBC",
    skill_scope: "Skill Scope",
    action_plan: "Action Plan",
    notes_plan: "Notes/Plan",
    full_name: "Full Name",
    fte: "FTE",

    //OTR Loading Sheet header mapping
    term: "Term",
    block_dept: "Block Dept",
    block: "Block",
    course_dept: "Course Dept",
    course: "Course",
    title: "Title",
    component: "Component",
    schedule_type: "Schedule Type",
    status: "Status",
    delivery: "Delivery",
    meet_type: "Meet Type",
    start_date: "Start Date",
    end_date: "End Date",
    forced_day: "Forced Day",
    forced_start_time: "Forced Start Time",
    forced_duration: "Forced Duration",
    pattern: "Pattern",
    pattern_day: "Pattern Day",
    pattern_start_time: "Pattern Start Time",
    pattern_duration: "Pattern Duration",
    instructor_id: "Instructor ID",
    name: "Name",
    surname: "Surname",
    room_type_requested: "Room Type Requested",
    pavilion_requested: "Pavilion Requested",
    room_number: "Room Number",
    room_type_assigned: "Room Type Assigned",
    room_description: "Room Description",
    component_disabled: "Component Disabled",
    section_disabled: "Section Disabled",
    course_disabled: "Course Disabled",
  };

  //headers will either be one from the headersMap or if not there, just what is found in the returned data
  //headers will also be ordered in the same way they were received
  //Created with the help of AI
  const formatPreviewData = (data, columnOrder = []) => {
    const headers = columnOrder.length
      ? columnOrder.map((key) => ({
          key,
          label: headersMap[key] || key,
        }))
      : data.length
      ? Object.keys(data[0]).map((key) => ({
          key,
          label: headersMap[key] || key,
        }))
      : [];

    return { headers, rows: data };
  };

  // create function to populate previewData with data from database while using headersMap
  const fetchTableData = async (table) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/data/${table}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to fetch data");

      // //setPreviewData(result.data || []);
      // const data = result.data || [];

      // const headers = data.length
      //   ? Object.keys(data[0]).map((key) => ({
      //       key,
      //       label: headersMap[key] || key,
      //     }))
      //   : [];

      setPreviewData(
        formatPreviewData(
          result.data.data || [],
          result.data.column_order || []
        )
      );
    } catch (err) {
      setError(err.message);
      setPreviewData(formatPreviewData(result.data || []));
    } finally {
      setIsLoading(false);
    }
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
    Programs: "programs",
    Courses: "courses",
    Instructors: "instructors",
    "OTR Loading Sheet": "otr_submissions",
  };

  //created with help of AI - helped properly track user's email
  const handleFileUpload = async (event) => {
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession();

    // if (!session) {
    //   setError("Unauthorized user - no access.");
    //   return;
    // }

    // const token = session.access_token;

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

      //const token = authorize_user();

      const formData = new FormData();
      formData.append("file", file);
      //formData.append("table", table); //send table dynamically
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/upload/${table}`, //uses table value to access correct backend route
        {
          method: "POST",
          headers: {
            "X-User-Email": userEmail || "",
            //Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Upload failed");

      setUploadedFile(file);
      setUploadDetails({
        fileName: file.name,
        uploadTime: new Date().toLocaleString(),
      });
      //setPreviewData(result.data || []);
      //setPreviewData(formatPreviewData(result.data || []));
      setPreviewData(
        formatPreviewData(
          result.data.data || [],
          result.data.column_order || []
        )
      );

      // Set unmatched courses if any
      setUnmatchedCourses(result.unmatched_courses || []);

      setSuccessMessage(`File "${file.name}" uploaded successfully!`);

      await fetchTableData(table);
    } catch (err) {
      setError(err.message);
      setUploadDetails({ fileName: "", uploadTime: "" });
      setPreviewData({ headers: [], rows: [] });
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
      //const token = authorize_user();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/list/${selectedDataType.toLowerCase()}`,
        {
          method: "GET",
          headers: {
            "X-User-Email": userEmail || "",
            //Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }

      const data = await response.json();

      return (data.uploads || []).map((file, index) => ({
        id: file.id || index.toString(),
        fileName: file.original_name,
        uploadTime: new Date(file.uploaded_at).toLocaleString(),
        uploadedBy: file.uploaded_by,
        dataType: selectedDataType,
        storagePath: file.storage_path,
        size: file.size || "-", // backend doesn’t send size - placeholder
        version: file.version,
      }));
    } catch (error) {
      console.error(error);
      setError("Failed to load previous versions");
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/restore/${version.dataType.toLowerCase()}/${
          version.storagePath
        }`,
        {
          method: "POST",
          headers: {
            "X-User-Email": userEmail || "",
            //Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to restore version");
      }

      const result = await response.json();

      setPreviewData(
        formatPreviewData(
          result.data.data || [],
          result.data.column_order || []
        )
      );
      setUploadDetails({
        fileName: `RESTORED_${version.fileName}`,
        uploadTime: new Date().toLocaleString(),
      });
      setShowVersionsModal(false);
      setSuccessMessage(`Successfully restored from ${version.fileName}`);
    } catch (error) {
      console.error(error);
      setError("Failed to restore version: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDownload = async (storagePath) => {
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/download/${storagePath}`
  //   );
  //   const data = await response.json();
  //   if (data.download_url) {
  //     window.open(data.download_url, "_blank");
  //   }
  // };

  const handleDownload = async (storagePath) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/download/${storagePath}` //api location
      );
      const blob = await response.blob(); //save the response as a blob (especially since it is a file)
      const url = window.URL.createObjectURL(blob); //make a temporary url to store the blob object
      const a = document.createElement("a"); //creates anchor element
      const fileName = storagePath;
      a.href = url; //this will assign the blob to the url link
      a.download = fileName; //sets the filename for the user's browser to use
      document.body.appendChild(a); //ensures anchor element is attached to the DOM
      a.click(); //this tells th browser to start downloading the file when clicked
      a.remove(); //once the download is triggered, removes the anchor element
      window.URL.revokeObjectURL(url); //gets rid of the blob url that was created to free up memory
    } catch (err) {
      console.error("Download failed:", err);
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

      {/* Unmatched Courses Warning */}
      {unmatchedCourses.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="font-bold mb-2">
                Warning: {unmatchedCourses.length} course
                {unmatchedCourses.length !== 1 ? "s" : ""} could not be linked
                to any program
              </p>
              <p className="text-sm mb-2">
                {/* The following courses have a program value that doesn't match any program in the database. Please verify the program names in your data: */}
              </p>
              <div className="mt-2 max-h-40 overflow-y-auto bg-white rounded p-2">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Course Code</th>
                      <th className="text-left p-2">Course Name</th>
                      <th className="text-left p-2">Program Major</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unmatchedCourses.map((course, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          {course.course_code || course.course_id}
                        </td>
                        <td className="p-2">{course.course_name}</td>
                        <td className="p-2 font-semibold">
                          {course.program_major}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
            <div className="bg-[#D4D4D4] p-2 space-x-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <p className="font-bold mb-2">Upload New Data:</p>
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
          ) : previewData.rows && previewData.rows.length > 0 ? (
            <div className="bg-white rounded-lg overflow-x-auto overflow-y-auto max-h-120">
              <table className="table-auto w-full bg-white">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="bg-gray-100">
                    {previewData.headers?.map((header) => (
                      <th
                        key={header.key}
                        className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows?.map((row, index) => (
                    <tr key={index}>
                      {previewData.headers.map((header) => (
                        <td
                          key={header.key}
                          className="whitespace-nowrap px-6 py-3"
                        >
                          {row[header.key]}
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                      <th className="text-left p-3">Uploaded At</th>
                      <th className="text-left p-3">Uploaded By</th>
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
                        <td className="border px-4 py-2">
                          <button
                            className={`bg-blue-500 text-white px-2 py-1 rounded transition-opacity duration-200 
                              hover:opacity-80 active:opacity-60 
                              ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setIsLoading(true);
                              try {
                                const response = await fetch(
                                  `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/download/${version.storagePath}`
                                );
                                const data = await response.json();
                                if (data.download_url) {
                                  window.open(data.download_url, "_blank");
                                }
                              } catch (err) {
                                console.error("Download failed:", err);
                                setError("Download failed: " + err.message);
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? "Downloading..." : "Download"}
                          </button>
                        </td>
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
