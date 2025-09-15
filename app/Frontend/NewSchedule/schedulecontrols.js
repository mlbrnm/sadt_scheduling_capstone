"use client";

export default function ScheduleControls({ metaData, setNewScheduleDraft }) {
  const handleSave = () => {
    // Save button handler
  };

  const handleClear = () => {
    // Clear button handler
  };

  const handleSemesterToggle = (semester) => {
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      metaData: {
        ...prevDraft.metaData,
        activeSemesters: {
          ...prevDraft.metaData.activeSemesters,
          [semester]: !prevDraft.metaData.activeSemesters[semester],
        },
      },
    }));
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 mb-4 rounded-md">
      {/* Left Side: Year and Semester Toggles */}
      <div className="flex items-center space-x-6">
        {/* Year Display */}
        <div className="text-lg font-semibold">Year: {metaData.year}</div>

        {/* Semester Toggles */}
        <div className="flex items-center">
          {/* Winter Toggle */}
          <div className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={metaData.activeSemesters.winter}
              onChange={() => handleSemesterToggle("winter")}
            />
            <label className="ml-2">Winter</label>
          </div>
          {/* Spring/Summer Toggle */}
          <div className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={metaData.activeSemesters.springSummer}
              onChange={() => handleSemesterToggle("springSummer")}
            />
            <label className="ml-2">Spring/Summer</label>
          </div>
          {/* Fall Toggle */}
          <div className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={metaData.activeSemesters.fall}
              onChange={() => handleSemesterToggle("fall")}
            />
            <label className="ml-2">Fall</label>
          </div>
        </div>

        {/* Right Side: Save and Clear Buttons */}
        <div className="flex items-center space-x-3">
          <button
            className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
