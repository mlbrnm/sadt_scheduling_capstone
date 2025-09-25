"use client";

export default function ScheduleControls({
  metaData,
  setNewScheduleDraft,
  onSave,
  onClear,
}) {
  // Handler to toggle semester
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
    <div className="flex justify-between items-center p-2">
      {/* Left Side: Year and Semester Toggles */}
      <div className="flex items-center space-x-6">
        {/* Year Display */}
        <div className="text-lg font-semibold">Year: {metaData.year}</div>

        {/* Semester Toggles */}
        <div className="flex">
          {/* Winter Toggle */}
          <div className="mr-4">
            <input
              type="checkbox"
              checked={metaData.activeSemesters.winter}
              onChange={() => handleSemesterToggle("winter")}
              className="cursor-pointer"
            />
            <label className="ml-2">Winter</label>
          </div>
          {/* Spring/Summer Toggle */}
          <div className="mr-4">
            <input
              type="checkbox"
              checked={metaData.activeSemesters.springSummer}
              onChange={() => handleSemesterToggle("springSummer")}
              className="cursor-pointer"
            />
            <label className="ml-2">Spring/Summer</label>
          </div>
          {/* Fall Toggle */}
          <div className="mr-4">
            <input
              type="checkbox"
              checked={metaData.activeSemesters.fall}
              onChange={() => handleSemesterToggle("fall")}
              className="cursor-pointer"
            />
            <label className="ml-2">Fall</label>
          </div>
        </div>

        {/* Working Semester Selection */}
        <div className="flex ml-4 items-center space-x-4">
          <span>Working Semester:</span>
          {["winter", "springSummer", "fall"].map((sem) => (
            <button
              key={sem}
              onClick={() =>
                setNewScheduleDraft((prevDraft) => ({
                  ...prevDraft,
                  metaData: { ...prevDraft.metaData, workingSemester: sem },
                }))
              }
              className={`px-3 py-1 rounded-md text-sm ${
                metaData.workingSemester === sem
                  ? "bg-blue-600 text-white"
                  : "bg-white-200"
              } cursor-pointer`}
              title={`Set working semester to ${
                sem[0].toUpperCase() + sem.slice(1)
              }`}
            >
              {sem === "springSummer"
                ? "Sp/Su"
                : sem[0].toUpperCase() + sem.slice(1)}
            </button>
          ))}
        </div>

        {/* Right Side: Save and Clear Buttons */}
        <div className="space-x-3">
          <button
            className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            onClick={onSave}
          >
            Save
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
