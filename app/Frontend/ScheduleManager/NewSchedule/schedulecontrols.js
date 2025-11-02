export default function ScheduleControls({
  metaData,
  setNewScheduleDraft,
  onSave,
  onClear,
}) {
  // Handler to select a specific semester tab
  const handleSemesterTabClick = (semester) => {
    if (semester === "all") {
      // Show all semesters
      setNewScheduleDraft((prevDraft) => ({
        ...prevDraft,
        metaData: {
          ...prevDraft.metaData,
          activeSemesters: {
            winter: true,
            springSummer: true,
            fall: true,
          },
        },
      }));
    } else {
      // Show only the selected semester
      setNewScheduleDraft((prevDraft) => ({
        ...prevDraft,
        metaData: {
          ...prevDraft.metaData,
          activeSemesters: {
            winter: semester === "winter",
            springSummer: semester === "springSummer",
            fall: semester === "fall",
          },
        },
      }));
    }
  };

  // Determine which tab is currently active
  const { winter, springSummer, fall } = metaData.activeSemesters;
  const allActive = winter && springSummer && fall;
  const activeTab = allActive
    ? "all"
    : winter
    ? "winter"
    : springSummer
    ? "springSummer"
    : fall
    ? "fall"
    : "all";

  // Tab button component for consistent styling
  const TabButton = ({ label, value, isActive }) => (
    <button
      onClick={() => handleSemesterTabClick(value)}
      className={`px-4 py-2 font-medium rounded-t-md transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex justify-between items-center p-2">
      {/* Left Side: Year and Semester Tabs */}
      <div className="flex items-center space-x-6">
        {/* Year Display */}
        <div className="text-lg font-semibold">Year: {metaData.year}</div>

        {/* Semester Tabs */}
        <div className="flex space-x-1">
          <TabButton
            label="Winter"
            value="winter"
            isActive={activeTab === "winter"}
          />
          <TabButton
            label="Spring/Summer"
            value="springSummer"
            isActive={activeTab === "springSummer"}
          />
          <TabButton
            label="Fall"
            value="fall"
            isActive={activeTab === "fall"}
          />
          <TabButton
            label="Show All"
            value="all"
            isActive={activeTab === "all"}
          />
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
