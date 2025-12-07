// Portions of this file, including the `displayColumns` array structure and the
// search filtering logic, were developed with the assistance of
"use client"; //confirm component runs on client side

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// data that will be stored in the database for the new added instructor
function AddInstructorModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    instructor_name: "",
    instructor_lastname: "",
    instructor_id: "",
    cch_target_ay2025: "",
    contract_type: "",
    instructor_status: "",
    salaried_begin_date: "",
    contract_end: "",
    reporting_ac: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate a random instructor ID
  useEffect(() => {
    const generateInstructorID = () => {
      const generatedId = Math.floor(100000 + Math.random() * 900000);
      setFormData((prevData) => ({
        ...prevData,
        instructor_id: generatedId.toString(),
      }));
    };
    generateInstructorID();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // make sure id auto-generation happens only once both name fields are filled
    if (name === "instructor_name" || name === "instructor_lastname") {
      const firstName =
        name === "instructor_name" ? value : formData.instructor_name;
      const lastName =
        name === "instructor_lastname" ? value : formData.instructor_lastname;

      // ensure both names have actual values
      if (firstName.trim() && lastName.trim()) {
        const generatedId = Math.floor(100000 + Math.random() * 900000);
        updatedFormData.instructor_id = generatedId.toString();
      } else {
        updatedFormData.instructor_id = "";
      }
    }

    // determine CCH target based on contract type
    if (name === "contract_type") {
      let cchTarget;
      switch (value) {
        case "Permanent":
          cchTarget = "615";
          break;
        case "Temoporary":
          cchTarget = "615";
          break;
        case "Casual":
          cchTarget = "800";
          break;
        default:
          cchTarget = "";
      }
      updatedFormData.cch_target_ay2025 = cchTarget;
    }
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔥 SUBMIT CLICKED");
    setIsSubmitting(true);
    setError("");

    try {
      console.log("📤 Sending data:", formData);

      const response = await fetch(
        "http://localhost:5000/admin/data/instructors",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      console.log("📥 Response received:", response.status);
      const result = await response.json();
      console.log("📝 Result:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to add instructor");
      }

      // Clear form
      setFormData({
        instructor_name: "",
        instructor_lastname: "",
        instructor_id: "",
        cch_target_ay2025: "",
        contract_type: "",
        instructor_status: "",
        salaried_begin_date: "",
        contract_end: "",
        reporting_ac: "",
      });

      onClose();
      onSuccess();
    } catch (error) {
      console.log("💥 CATCH BLOCK:", error.message);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   setError("");

  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/admin/data/instructors`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.error || "Failed to add instructor");
  //     }

  //     // Clear the form for next time's use
  //     setFormData({
  //       instructor_name: "",
  //       instructor_lastname: "",
  //       instructor_id: "",
  //       cch_target_ay2025: "",
  //       contract_type: "",
  //       instructor_status: "",
  //       salaried_begin_date: "",
  //       contract_end: "",
  //       reporting_ac: "",
  //     });

  //     onSuccess();
  //     onClose();
  //   } catch (error) {
  //     setError(error.message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }
  return (
    <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4">
        <form onSubmit={handleSubmit}>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Add New Instructor</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {/*First Name Input */}
              <label className="block mb-1 font-medium text-sm">
                First Name
              </label>
              <input
                type="text"
                name="instructor_name"
                value={formData.instructor_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              {/*Last Name Input */}
              <label className="block mb-1 font-medium text-sm">
                Last Name
              </label>
              <input
                type="text"
                name="instructor_lastname"
                value={formData.instructor_lastname}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            {/* Display Instructor ID */}
            {formData.instructor_id && (
              <div className="col-span-2">
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Instructor ID:</span>{" "}
                    {formData.instructor_id}
                  </p>
                </div>
              </div>
            )}
            {/* CCH Target (greyed out - will autofill upon contract type selection) */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                CCH Target
              </label>
              <input
                type="text"
                name="cch_target_ay2025"
                value={formData.cch_target_ay2025}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              {/*Contract Type Dropdown */}
              <label className="block mb-1 font-medium text-sm">
                Contract Type
              </label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Contract Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
            {/* Instructor Status Dropdown */}
            <div>
              <label className="block mb-1 font-medium text-sm"> Status</label>
              <select
                name="instructor_status"
                value={formData.instructor_status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Retired">Retired</option>
                <option value="Renew">Renew</option>
                <option value="Expire"> Expire</option>
              </select>
            </div>
            {/* Start Date Input */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Start Date
              </label>
              <input
                type="date"
                name="salaried_begin_date"
                value={formData.salaried_begin_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            {/* End Date Input */}
            <div>
              <label className="block mb-1 font-medium text-sm">End Date</label>
              <input
                type="date"
                name="contract_end"
                value={formData.contract_end}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            {/* Reporting AC Input */}
            <div className="col-span-2">
              <label className="block mb-1 font-medium text-sm">
                Reporting AC
              </label>
              <input
                type="text"
                name="reporting_ac"
                value={formData.reporting_ac}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
          {/* Form Buttons */}
          <div className="flex justify-end gap-3 mt-6 p-4">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary px-4 py-2 rounded-lg text-white cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InstructorProfiles() {
  //create the loading functional component for data loading from api
  const [isLoading, setIsLoading] = useState(true);

  //this will store the instructor data from database table
  const [fetchedData, setFetchedData] = useState([]);

  //this will store the user's search to filter the table
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  //this will control the ability to add new instructors into the system and database
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);

  //this is an array of objects for which columns will be diplayed in the instructor table
  //created with hep of AI - redundant code creation
  const displayColumns = [
    { header: "First Name", key: "instructor_name" },
    { header: "Last Name", key: "instructor_lastname" },
    { header: "ID", key: "instructor_id" },
    { header: "CCH Target", key: "cch_target_ay2025" },
    { header: "Contract Type", key: "contract_type" },
    { header: "Instructor Status", key: "instructor_status" },
    { header: "Start Date", key: "salaried_begin_date" },
    { header: "End Date", key: "contract_end" },
    { header: "Reporting AC", key: "reporting_ac" },
  ];

  // create function to populate the table list with instructor data from database
  const fetchInstructorData = async (table) => {
    try {
      //send request to API endpoint to get instructor info
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/data/instructors`
      );
      const result = await response.json();

      //ok is a boolean used to see if response was successful, if not error is thrown
      if (!response.ok) throw new Error(result.error || "Failed to fetch data");

      //this will store the instructor data
      setFetchedData(result.data?.data || []); //if result.data exists then get the data within it, if not return the empty array
    } catch {
      setFetchedData([]); //clears table data if requet fails
    } finally {
      setIsLoading(false); //turns off loading spinner
    }
  };

  //this will make sure that data is fetched once when the component is opened
  useEffect(() => {
    fetchInstructorData();
  }, []);

  // function to normalize strings by removing accents and converting to lowercase
  const normalizeString = (string) => {
    if (!string) return "";
    return string
      .normalize("NFD") //split letters and accents
      .replace(/[\u0300-\u036f]/g, "") //remove accents
      .toLowerCase();
  };

  // normalize the search query
  const normalizedSearchQuery = normalizeString(searchQuery);

  // filter the search
  //converts row data into string and lower case for searchability
  //created using AI suggestions
  const filteredData = fetchedData.filter((row) => {
    const name = normalizeString(
      `${row.instructor_name} ${row.instructor_lastname} ${row.instructor_id}`
    );
    return name.includes(normalizedSearchQuery);
  });

  const viewProfile = (instructorId) => {
    router.push(
      `/Frontend/InstructorProfiles/IndividualProfile?id=${instructorId}`
    );
  };

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden">
      {/* Title and Search Bar */}
      <div className="flex justify-end items-center mb-4">
        {/*Search Box */}
        <input
          type="text"
          placeholder="Search Instructors by Name or ID..."
          className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/*Add Instructor Button*/}
        <button
          onClick={() => setShowAddInstructorModal(true)}
          className="button-primary text-white px-4 py-2 rounded-lg cursor-pointer ml-80"
        >
          + Add New Instructor
        </button>
        {/* Render Add Instructor Modal */}
        {showAddInstructorModal && (
          <AddInstructorModal
            onClose={() => setShowAddInstructorModal(false)}
            onSuccess={() => {
              fetchInstructorData();
              setShowAddInstructorModal(false);
            }}
          />
        )}
      </div>

      {/*Instructor Table*/}
      <div className="px-30 pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
            <span className="ml-3">Loading instructors...</span>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="bg-white rounded-lg overflow-auto max-h-140">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="bg-gray-100">
                  {displayColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {displayColumns.map((col) => (
                      <td
                        key={col.key}
                        className="py-3 px-6 border-b text-left text-sm"
                      >
                        {row[col.key] || "-"}
                      </td>
                    ))}
                    <td className="py-3 px-6 border-b text-center text-sm">
                      <button
                        onClick={() => viewProfile(row.instructor_id)}
                        className="text-blue-500 hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No data to display</p>
        )}
      </div>
    </div>
  );
}
