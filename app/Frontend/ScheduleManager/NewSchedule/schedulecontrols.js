export default function ScheduleControls({
  metaData,
  setNewScheduleDraft,
  onSave,
  onClear,
  isSaving,
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

        {/* Right Side: Save and Clear Buttons */}
        <div className="space-x-3">
          <button
            className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={onClear}
            disabled={isSaving}
          >
            Clear
          </button>
        </div>
      </div>
      {/* Legend */}
      <div>
        <p className="text-xs text-gray-500 ml-2">
          <span>Legend:</span> Left Click = Assign Both. Alt+Click = Assign
          Class Only. Shift+Click = Assign Online Only.
        </p>
      </div>
    </div>
  );
}
