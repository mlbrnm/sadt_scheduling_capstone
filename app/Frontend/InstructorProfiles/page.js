"use client";

import { useState, useEffect } from "react";

export default function InstructorProfiles() {
  //create the loading functional component
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);

  const displayColumns = [
    { header: "First Name", key: "instructor_name" },
    { header: "Last Name", key: "instructor_lastname" },
    { header: "ID", key: "instructor_id" },
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

      setFetchedData(result.data || []);
    } catch {
      setFetchedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl">Instructor List</h1>

      <div className="px-30 pt-6 ">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : fetchedData.length > 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {fetchedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {displayColumns.map((col) => (
                      <td key={col.key} className="py-2 px-4 border-b text-sm">
                        {row[col.key] || "-"}
                      </td>
                    ))}
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
