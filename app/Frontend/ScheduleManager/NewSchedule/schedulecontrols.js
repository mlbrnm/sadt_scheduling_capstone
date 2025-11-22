export default function ScheduleControls({
  metaData,
  setNewScheduleDraft,
  onSave,
  onClear,
  hideFullyAssignedCourses,
  setHideFullyAssignedCourses,
  hideFullyAssignedInstructors,
  setHideFullyAssignedInstructors,
  instructorSortMode,
  setInstructorSortMode,
  isScheduleSubmitted = false,
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
    <div className="space-y-2 p-2">
      {/* First Row: Year, Semester Tabs, and Buttons */}
      <div className="flex justify-between items-center">
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
              className={`mr-2 px-4 py-2 rounded-md ${
                isScheduleSubmitted
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              }`}
              onClick={onSave}
              disabled={isScheduleSubmitted}
            >
              Save
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                isScheduleSubmitted
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
              }`}
              onClick={onClear}
              disabled={isScheduleSubmitted}
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

      {/* Second Row: Filter and Sort Controls */}
      <div className="flex items-center space-x-6 px-2">
        {/* Filter Checkboxes */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hideCourses"
              checked={hideFullyAssignedCourses}
              onChange={(e) => setHideFullyAssignedCourses(e.target.checked)}
              className="cursor-pointer w-4 h-4"
            />
            <label htmlFor="hideCourses" className="ml-2 text-sm cursor-pointer">
              Hide Fully Assigned Courses
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hideInstructors"
              checked={hideFullyAssignedInstructors}
              onChange={(e) => setHideFullyAssignedInstructors(e.target.checked)}
              className="cursor-pointer w-4 h-4"
            />
            <label htmlFor="hideInstructors" className="ml-2 text-sm cursor-pointer">
              Hide Fully Assigned Instructors
            </label>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sortMode" className="text-sm font-medium">
            Sort Instructors:
          </label>
          <select
            id="sortMode"
            value={instructorSortMode}
            onChange={(e) => setInstructorSortMode(e.target.value)}
            className="px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="currentSemesterHours">Current Semester Hours</option>
            <option value="totalHours">Total Hours</option>
          </select>
        </div>
      </div>
    </div>
  );
}
