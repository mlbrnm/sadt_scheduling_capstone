"use client";
import { useState, useEffect, useRef } from "react";
import mockInstructors from "./mockinstructors.json"; // MOCK DATA - REMOVE LATER
import mockCourses from "./mockcourses.json"; // MOCK DATA - REMOVE LATER
import ScheduleControls from "./schedulecontrols";
import InstructorSection from "./instructorsection";
import CourseSection from "./coursesection";
import AssignmentGrid from "./assignmentgrid";

/* 
assignments structure 
{
  "instructorId-courseId-semester": {
    sections: ["A", "B", "C"] 
  },
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
        // const Data = await response.json();
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

  // Handler function to remove a course from semester in the newScheduleDraft state
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
  };

  // Toggle section assignment in Assignment Grid component
  const toggleSection = (instructorId, course, section, semester) => {
    const key = `${instructorId}-${course.Course_ID}-${semester}`;

    setAssignments((prev) => {
      const current = prev[key] || { sections: [] };
      const exists = current.sections.includes(section);

      const sections = exists
        ? current.sections.filter((s) => s !== section)
        : [...current.sections, section];

      if (sections.length === 0) {
        // nothing left for this key (instructor, course, semester) - remove the key
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      return { ...prev, [key]: { sections } };
    });
  };

  // Handlers for Save and Clear buttons
  const handleSave = () => {
    // STILL NEED TO FINISH!!!
    console.log("Saving schedule draft:", newScheduleDraft);
    console.log("With assignments:", assignments);
  };
  const handleClear = () => {
    setNewScheduleDraft((d) => ({
      ...d,
      addedInstructors: [],
      addedCoursesBySemester: { winter: [], springSummer: [], fall: [] },
    }));
    setAssignments({});
  };

  // Determine which semesters are active for rendering CourseSection and AssignmentGrid
  const visibleSemesters = semester_list.filter(
    (sem) => newScheduleDraft.metaData.activeSemesters?.[sem]
  );

  // Sync horizontal scrolling between top (CourseSection) and bottom (AssignmentGrid)
  // USED AI Q: How to sync horizontal scrolling between two divs in React?
  const topScrollerRef = useRef(null);
  const bottomScrollerRef = useRef(null);
  const handleTopScroll = (e) => {
    if (bottomScrollerRef.current) {
      bottomScrollerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

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
          <div className="col-start-2 row-start-1 min-w-0">
            <div
              ref={topScrollerRef}
              onScroll={handleTopScroll}
              className="overflow-x-auto w-full"
            >
              <div className="inline-flex">
                {visibleSemesters.map((semester) => (
                  <div key={semester} className="min-w-0 shrink-0">
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
          </div>

          {/* Bottom-Left: Instructor Section */}
          <div className="col-start-1 row-start-2">
            <InstructorSection
              instructors={instructorData}
              onAddInstructor={handleAddInstructor}
              onRemoveInstructor={handleRemoveInstructor}
              addedInstructors={newScheduleDraft.addedInstructors}
              assignments={assignments}
              addedCoursesBySemester={newScheduleDraft.addedCoursesBySemester}
            />
          </div>

          {/* Bottom-Right: Assignment Grid */}
          <div className="col-start-2 row-start-2 min-w-0">
            <div ref={bottomScrollerRef} className="overflow-x-hidden w-full">
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
    </div>
  );
}
