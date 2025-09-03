"use client";

// Homepage directed to after logging in. In the real application,
// it would conditionally render based on user, for now make it look like Vanessa's.
export default function Home() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Personalized Greeting Header */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          Hello, Vanessa!
        </h1>
        <p className="text-xl sadt_blue_light">Current Semester: Spring 2025</p>
      </div>

      {/* Progress Timeline - Full Width */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="relative pt-4">
            {/* Progress Bar */}
            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full background-headerfooter rounded-full"
                style={{ width: "60%" }}
              ></div>
            </div>

            {/* Date Markers */}
            <div className="flex justify-between mt-2 text-sm">
              <div className="text-left">May 5</div>
              <div className="text-center">Week 9/14</div>
              <div className="text-right">Aug 21</div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Announcements */}
        <div>
          <h2 className="text-2xl font-semibold sadt_blue_light mb-4">
            Announcements
          </h2>
          <div className="space-y-4">
            {/* Announcement 1 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                ×
              </button>
              <p className="pr-6">
                This is an annoucement about a system outage. Sometimes systems
                need maintenance. It sucks, but deal with it.
              </p>
            </div>

            {/* Announcement 2 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                ×
              </button>
              <p className="pr-6">
                This is a reminder to submit your schedules by the due date. You
                don't really have a choice. Honestly, if you don't classes ain't
                gonna have no teachers and you ain't gonna have no job.
              </p>
            </div>

            {/* Announcement 3 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                ×
              </button>
              <p className="pr-6">
                This is a security alert reminding you to be aware of scams and
                phishing. Scams are real and phishing always seems legit. If it
                seems sus, it probably is. Trust your gut, don't be dumb. Don't
                fall for dumb stuff when instead you can just not.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column - Status Updates */}
        <div>
          <h2 className="text-2xl font-semibold sadt_blue_light mb-4">
            Status Updates
          </h2>

          {/* Since Last Login */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4">Since last login</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-4xl font-bold text-blue-500">6</p>
                <p className="text-sm text-gray-600">
                  Newly Submitted Schedules
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-500">4</p>
                <p className="text-sm text-gray-600">Edited Submissions</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-500">11</p>
                <p className="text-sm text-gray-600">New Conflicts Detected</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-700">22/152</p>
                <p className="text-sm text-gray-600">
                  Schedules Pending Approval
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-700">37</p>
                <p className="text-sm text-gray-600">
                  Total Unresolved Conflicts
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-sm">
                    <span className="font-bold">6</span> Major
                  </span>
                </div>
                <div className="flex items-center justify-center mb-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  <span className="text-sm">
                    <span className="font-bold">26</span> Moderate
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm">
                    <span className="font-bold">5</span> Minor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Calendar */}
        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">July 2025</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-7 gap-1">
              {/* Days of Week */}
              {["Su", "M", "Tu", "W", "Th", "F", "Sa"].map((day, index) => (
                <div key={index} className="text-center font-medium p-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before July 1 (Tuesday) */}
              {[...Array(1)].map((_, index) => (
                <div
                  key={`empty-start-${index}`}
                  className="text-center p-2"
                ></div>
              ))}

              {/* Calendar Days */}
              {[...Array(31)].map((_, index) => {
                const day = index + 1;
                const isHighlighted = [1, 2, 3, 4, 22].includes(day);
                return (
                  <div
                    key={`day-${day}`}
                    className={`text-center p-2 ${
                      isHighlighted
                        ? "bg-purple-700 text-white rounded-md"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
