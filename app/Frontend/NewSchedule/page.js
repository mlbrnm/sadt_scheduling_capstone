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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // "Fetching" mock data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // REPLACE WITH API CALL
        // const response = await fetch("");
        // const instructorData = await response.json();
        setInstructorData(mockInstructors);
        setCourseData(mockCourses);
      } catch (error) {
        setError("Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler function to add an instructor to the newScheduleDraft state
  const handleAddInstructor = (instructor) => {
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedInstructors: [...prevDraft.addedInstructors, instructor],
    }));
  };

  // Handler function to remove an instructor from the newScheduleDraft state
  const handleRemoveInstructor = (instructor) => {
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedInstructors: prevDraft.addedInstructors.filter(
        (i) => i.Instructor_ID !== instructor.Instructor_ID
      ),
    }));
  };

  // Handler function to add a course to the newScheduleDraft state
  const handleAddCourse = (course) => {
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedCourses: [...prevDraft.addedCourses, course],
    }));
  };

  // Handler function to remove a course from the newScheduleDraft state
  const handleRemoveCourse = (course) => {
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedCourses: prevDraft.addedCourses.filter(
        (c) => c.Course_ID !== course.Course_ID
      ),
    }));
  };

  return (
    <div className="p-4">
      {/* Heading */}
      <h1 className="text-xl text-center font-bold mb-2">New Schedule</h1>
      <div className="flex justify-around">
        {/* Top-Left: Controls Year, Semester Toggles, Save/Clear Buttons */}
        <ScheduleControls
          metaData={newScheduleDraft.metaData}
          setNewScheduleDraft={setNewScheduleDraft}
        />
      </div>

      <div className="flex flex-col">
        {/* Main Area - Grid Layout */}
        {/* USED AI Q: How to use Grid layout to align the components? (https://chat.deepseek.com/a/chat/s/c88d63ad-6497-4312-a8cf-c4500768ce60) */}
        <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] flex-1">
          {/* Top-Right: Course Section */}
          <div className="col-start-2 row-start-1">
            <CourseSection
              courses={courseData}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              addedCourses={newScheduleDraft.addedCourses}
            />
          </div>

          {/* Bottom-Left: Instructor Section */}
          <div className="col-start-1 row-start-2">
            <InstructorSection
              instructors={instructorData}
              onAddInstructor={handleAddInstructor}
              onRemoveInstructor={handleRemoveInstructor}
              addedInstructors={newScheduleDraft.addedInstructors}
            />
          </div>

          {/* Bottom-Right: Assignment Grid */}
          <div className="col-start-2 row-start-2">
            <AssignmentGrid instructors={instructorData} courses={courseData} />
          </div>
        </div>
      </div>
    </div>
  );
}
