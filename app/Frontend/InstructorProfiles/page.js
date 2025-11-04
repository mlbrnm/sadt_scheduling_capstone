"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstructorProfiles() {
  //create the loading functional component
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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
      setIsLoading(true);

      const response = await fetch(
        `http://localhost:5000/admin/data/instructors`
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to fetch data");

      setFetchedData(result.data?.data || []);
    } catch {
      setFetchedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  // filter the search
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
