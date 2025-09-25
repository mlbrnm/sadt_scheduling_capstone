"use client";
import { useState, useEffect } from "react";
import mockInstructors from "./mockinstructors.json"; // MOCK DATA - REMOVE LATER
import mockCourses from "./mockcourses.json"; // MOCK DATA - REMOVE LATER
import ScheduleControls from "./schedulecontrols";
import InstructorSection from "./instructorsection";
import CourseSection from "./coursesection";
import AssignmentGrid from "./assignmentgrid";
/* 
assignments structure:
{
  "instructorId-courseId": {
    sectionsBySemester: {
      winter: [],
      springSummer: [],
      fall: []
    },
    totalsBySemester: {
      winter: 0,
      springSummer: 0,
      fall: 0
    },
    totalHours: 0
  }
}
*/
export default function NewSchedule() {
  const [newScheduleDraft, setNewScheduleDraft] = useState({
    metaData: {
      year: 2025,
      activeSemesters: { winter: true, springSummer: true, fall: true },
      workingSemester: "winter",
    },
    addedInstructors: [],
    addedCourses: [],
  });
  const [instructorData, setInstructorData] = useState([]); // Currently holds Mock data for instructors - REPLACE WITH API CALL
  const [courseData, setCourseData] = useState([]); // Currently holds Mock data for courses - REPLACE WITH API CALL
  const [assignments, setAssignments] = useState({});
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

  // Toggle section assignment in Assignment Grid component
  const toggleSection = (instructorId, course, section, semester) => {
    const key = `${instructorId}-${course.Course_ID}`;
    const hoursPerSection = (course.Class || 0) + (course.Online || 0);

    // Update assignments state
    setAssignments((prev) => {
      const current = prev[key] || {
        sectionsBySemester: { winter: [], springSummer: [], fall: [] },
        totalsBySemester: { winter: 0, springSummer: 0, fall: 0 },
        totalHours: 0,
      };

      // Shallow copy of current sections
      const next = {
        winter: [...current.sectionsBySemester.winter],
        springSummer: [...current.sectionsBySemester.springSummer],
        fall: [...current.sectionsBySemester.fall],
      };

      if (next[semester].includes(section)) {
        // remove if already assigned
        next[semester] = next[semester].filter((s) => s !== section);
      } else {
        // add new section
        next[semester].push(section);
      }

      // Recompute totals
      const totals = {
        winter: next.winter.length * hoursPerSection,
        springSummer: next.springSummer.length * hoursPerSection,
        fall: next.fall.length * hoursPerSection,
      };

      return {
        ...prev,
        [key]: {
          sectionsBySemester: next,
          totalsBySemester: totals,
          totalHours: totals.winter + totals.springSummer + totals.fall,
        },
      };
    });
  };

  // Clean up assignments if instructors or courses are removed
  // USED AI Q: I would like to reset the section assignments if I remove the instructor and/or course. How would I do this? (CLEAN UP ASSIGNMENTS IF INSTRUCTOR/COURSE REMOVED))
  useEffect(() => {
    setAssignments((prev) => {
      const validInstructorIds = newScheduleDraft.addedInstructors.map(
        (i) => i.Instructor_ID
      );
      const validCourseIds = newScheduleDraft.addedCourses.map(
        (c) => c.Course_ID
      );

      // Create a new assignments object with only valid keys
      const updatedAssignments = {};

      // Loop through keys in previous state and update assignments to include only the ones still in the addedInstructors and addedCourses
      for (const key in prev) {
        const [instructorId, courseId] = key.split("-");

        if (
          validInstructorIds.includes(parseInt(instructorId)) &&
          validCourseIds.includes(courseId)
        ) {
          updatedAssignments[key] = prev[key];
        }
      }
      return updatedAssignments;
    });
  }, [newScheduleDraft.addedInstructors, newScheduleDraft.addedCourses]);

  // Handlers for Save and Clear buttons
  const handleSave = () => {};
  const handleClear = () => {
    setNewScheduleDraft((d) => ({
      ...d,
      addedInstructors: [],
      addedCourses: [],
    }));
    setAssignments({});
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
          onSave={handleSave}
          onClear={handleClear}
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
              assignments={assignments}
            />
          </div>

          {/* Bottom-Right: Assignment Grid */}
          <div className="col-start-2 row-start-2">
            <AssignmentGrid
              addedInstructors={newScheduleDraft.addedInstructors}
              addedCourses={newScheduleDraft.addedCourses}
              assignments={assignments}
              onToggleSection={toggleSection}
              workingSemester={newScheduleDraft.metaData.workingSemester}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
