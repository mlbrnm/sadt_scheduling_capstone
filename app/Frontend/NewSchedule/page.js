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

const semester_list = ["winter", "springSummer", "fall"];

export default function NewSchedule() {
  const [newScheduleDraft, setNewScheduleDraft] = useState({
    metaData: {
      year: 2025,
      activeSemesters: { winter: true, springSummer: true, fall: true },
    },
    addedInstructors: [],
    addedCoursesBySemester: { winter: [], springSummer: [], fall: [] },
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

  // Handler function to add a course to a specific semester in the newScheduleDraft state
  const handleAddCourseToSemester = (semester, course) => {
    setNewScheduleDraft((prevDraft) => {
      const current = prevDraft.addedCoursesBySemester[semester] || [];
      // Prevent adding duplicates
      if (current.some((c) => c.Course_ID === course.Course_ID))
        return prevDraft;
      return {
        ...prevDraft,
        addedCoursesBySemester: {
          ...prevDraft.addedCoursesBySemester,
          [semester]: [...current, course],
        },
      };
    });
  };

  // Handler function to remove a course from all semesters in the newScheduleDraft state
  const handleRemoveCourseFromSemester = (semester, course) => {
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedCoursesBySemester: {
        ...prevDraft.addedCoursesBySemester,
        [semester]: prevDraft.addedCoursesBySemester[semester].filter(
          (c) => c.Course_ID !== course.Course_ID
        ),
      },
    }));
    // USED AI Q: Currently, when I add the same course to two+ semesters and I remove from one or more semesters, it is still saving the data. (CLEAR COURSE SECTIONS FOR THAT SEMESTER ONLY)
    // Clear this course's sections for just this semester
    setAssignments((prevAssignments) => {
      const updated = { ...prevAssignments };
      const courseId = String(course.Course_ID);

      // Loop through keys and clear sections for the specified course and semester
      for (const key of Object.keys(updated)) {
        const [iId, cId] = key.split("-");
        if (cId === courseId) {
          const current = updated[key];
          const sectionsBySemester = {
            winter: [...(current.sectionsBySemester?.winter || [])],
            springSummer: [...(current.sectionsBySemester?.springSummer || [])],
            fall: [...(current.sectionsBySemester?.fall || [])],
          };

          // Remove sections for the specified semester
          sectionsBySemester[semester] = [];

          // Recalculate totals
          const hoursPerSection = (course.Class || 0) + (course.Online || 0);
          const totalsBySemester = {
            winter: sectionsBySemester.winter.length * hoursPerSection,
            springSummer:
              sectionsBySemester.springSummer.length * hoursPerSection,
            fall: sectionsBySemester.fall.length * hoursPerSection,
          };
          const totalHours =
            totalsBySemester.winter +
            totalsBySemester.springSummer +
            totalsBySemester.fall;

          // If nothing left across semesters, remove the key, else update it
          if (
            sectionsBySemester.winter.length === 0 &&
            sectionsBySemester.springSummer.length === 0 &&
            sectionsBySemester.fall.length === 0
          ) {
            delete updated[key];
          } else {
            updated[key] = { sectionsBySemester, totalsBySemester, totalHours };
          }
        }
      }
      return updated;
    });
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
        // remove section if already assigned
        next[semester] = next[semester].filter((s) => s !== section);
      } else {
        // add new section if not already assigned
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
      const validCourseIds = Array.from(
        new Set(
          [
            ...newScheduleDraft.addedCoursesBySemester.winter,
            ...newScheduleDraft.addedCoursesBySemester.springSummer,
            ...newScheduleDraft.addedCoursesBySemester.fall,
          ].map((c) => c.Course_ID)
        )
      );

      // Create a new assignments object with only valid keys
      const updatedAssignments = {};

      // Loop through keys in previous state and update assignments to include only the ones still in the addedInstructors and addedCourses
      for (const key in prev) {
        const [instructorId, courseId] = key.split("-");

        if (
          validInstructorIds.includes(parseInt(instructorId, 10)) &&
          validCourseIds.includes(courseId)
        ) {
          updatedAssignments[key] = prev[key];
        }
      }
      return updatedAssignments;
    });
  }, [
    newScheduleDraft.addedInstructors,
    newScheduleDraft.addedCoursesBySemester,
  ]);

  // Handlers for Save and Clear buttons
  const handleSave = () => {};
  const handleClear = () => {
    setNewScheduleDraft((d) => ({
      ...d,
      addedInstructors: [],
      addedCoursesBySemester: { winter: [], springSummer: [], fall: [] },
    }));
    setAssignments({});
  };

  const visibleSemesters = semester_list.filter(
    (sem) => newScheduleDraft.metaData.activeSemesters?.[sem]
  );

  return (
    <div className="p-4">
      {/* Heading */}
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
            <div className="flex flex-wrap items-start">
              {visibleSemesters.map((semester) => (
                <div key={semester}>
                  <div className="text-sm font-semibold">
                    {semester === "springSummer"
                      ? "Spring/Summer"
                      : semester.charAt(0).toUpperCase() + semester.slice(1)}
                  </div>
                  <CourseSection
                    semester={semester}
                    courses={courseData}
                    onAddCourse={(course, sem) =>
                      handleAddCourseToSemester(sem, course)
                    }
                    onRemoveCourse={(course, sem) =>
                      handleRemoveCourseFromSemester(sem, course)
                    }
                    addedCourses={
                      newScheduleDraft.addedCoursesBySemester[semester]
                    }
                  />
                </div>
              ))}
            </div>
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
              addedCoursesBySemester={newScheduleDraft.addedCoursesBySemester}
              assignments={assignments}
              onToggleSection={toggleSection}
              activeSemesters={newScheduleDraft.metaData.activeSemesters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
