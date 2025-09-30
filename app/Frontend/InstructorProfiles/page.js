"use client";

import { useState, useEffect } from "react";

export default function InstructorProfiles() {
  //create the loading functional component
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);

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
    <div>
      <h1>this is instructor profile page</h1>

      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : fetchedData.length > 0 ? (
          <div className="bg-white rounded-lg overflow-auto max-h-80">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="bg-gray-100">
                  {Object.keys(fetchedData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetchedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="py-2 px-4 border-b text-sm"
                      >
                        {cell}
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
