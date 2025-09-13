"use client";
import { useState, useEffect } from "react";
import mockInstructors from "./mockinstructors.json"; // MOCK DATA - REMOVE LATER
import mockCourses from "./mockcourses.json"; // MOCK DATA - REMOVE LATER
import ScheduleControls from "./schedulecontrols";
import InstructorSection from "./instructorsection";
import CourseSection from "./coursesection";
import AssignmentGrid from "./assignmentgrid";

export default function NewSchedule() {
  const [newScheduleDraft, setNewScheduleDraft] = useState({
    metaData: {
      year: 2025,
      activeSemesters: { winter: true, springSummer: true, fall: true },
    },
    addedInstructors: [],
    addedCourses: [],
  });
  const [instructorData, setInstructorData] = useState([]); // Currently holds Mock data for instructors - REPLACE WITH API CALL
  const [courseData, setCourseData] = useState([]); // Currently holds Mock data for courses - REPLACE WITH API CALL

  // "Fetching" mock data on component mount
  useEffect(() => {
    setInstructorData(mockInstructors);
    setCourseData(mockCourses);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">New Schedule Page</h1>
      <div className="flex flex-col h-screen">
        {/* Top Controls Year, Semester Toggles, Save/Clear Buttons */}
        <ScheduleControls
          metaData={newScheduleDraft.metaData}
          setNewScheduleDraft={setNewScheduleDraft}
        />

        {/* Main Grid Area */}
        <div className="flex flex-1">
          {/* Left Component: Instructor Section */}
          <InstructorSection instructors={instructorData} />

          {/* Top + Center Components */}
          <div className="flex flex-1 flex-col">
            {/* Top Component: Course Section */}
            <CourseSection courses={courseData} />
            {/* Center Component: Section Assignment Grid */}
            <AssignmentGrid instructors={instructorData} courses={courseData} />
          </div>
        </div>
      </div>
    </div>
  );
}
