// Portions of this file, including the `displayColumns` array structure and the
// search filtering logic, were developed with the assistance of
"use client"; //confirm component runs on client side

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstructorProfiles() {
  //create the loading functional component for data loading from api
  const [isLoading, setIsLoading] = useState(false);

  //this will store the instructor data from database table
  const [fetchedData, setFetchedData] = useState([]);

  //this will store the user's search to filter the table
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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
      setIsLoading(true); //this will show the loading spinner

      //send request to API endpoint to get instructor info
      const response = await fetch(
        `http://localhost:5000/admin/data/instructors`
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

  // filter the search
  //converts row data into string and lower case for searchability
  //created using AI suggestions
  const filteredData = fetchedData.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const viewProfile = (instructorId) => {
    router.push(`/Frontend/InstructorProfiles/IndividualProfile?id=${instructorId}`);
  };

  return (
    <div className="p-6">
      {/* Title and Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Instructor List</h1>

        {/*Search Box */}
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white focus:ring-blue-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/*Instructor Table*/}
      <div className="px-30 pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="bg-white rounded-lg overflow-auto max-h-180">
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
                        className="text-blue-500 hover:underline"
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
