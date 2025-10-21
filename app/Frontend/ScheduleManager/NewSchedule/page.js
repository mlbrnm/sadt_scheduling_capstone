"use client";
import { useState, useEffect, useRef } from "react";
import mockInstructors from "./mockinstructors.json"; // MOCK DATA - REMOVE LATER
import mockCourses from "./mockcourses.json"; // MOCK DATA - REMOVE LATER
import ScheduleControls from "./schedulecontrols";
import InstructorSection from "./instructorsection";
import CourseSection from "./coursesection";
import AssignmentGrid from "./assignmentgrid";

/* 
assignments: {
  "instructorId-courseId-semester": {
    sections: {
      "A": { class: true,  online: true  }, // instructor owns Class & Online of section A
      "B": { class: true,  online: false }, // owns only Class of section B
      "C": { class: false, online: true  }, // owns only Online of section C
    }
  },
}
Example:
assignments = {
  "16491-CPRG211SD-winter": {
    sections: {
      "C": { class: false, online: true }  // Elizabeth: Online only
    }
  },
  "48921-CPRG211SD-winter": {
    sections: {
      "C": { class: true, online: false }  // Michael: Class only
    }
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
  // Dynamic heights from InstructorSection for syncing row heights
  const [rowHeights, setRowHeights] = useState({}); // { [instructor_id]: pxNumber }
  const [headerHeight, setHeaderHeight] = useState(null);

  // Handlers to update measured heights
  const handleRowResize = (instructorId, h) => {
    setRowHeights((prev) =>
      prev[instructorId] === h ? prev : { ...prev, [instructorId]: h }
    );
  };
  const handleHeaderResize = (h) => {
    setHeaderHeight((prev) => (prev === h ? prev : h));
  };

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
        (i) => i.instructor_id !== instructor.instructor_id
      ),
    }));
    // Clear measured height for that row to keep rowHeights clean
    setRowHeights((prev) => {
      const copy = { ...prev };
      delete copy[instructor.instructor_id];
      return copy;
    });
  };

  // Handler function to add a course to a specific semester in the newScheduleDraft state
  const handleAddCourseToSemester = (semester, course) => {
    setNewScheduleDraft((prevDraft) => {
      const current = prevDraft.addedCoursesBySemester[semester] || [];
      // Prevent adding duplicates
      if (current.some((c) => c.course_id === course.course_id))
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
          (c) => c.course_id !== course.course_id
        ),
      },
    }));
  };

  // Toggle which part of a section (class/online/both) are assigned to a specific instructor for a specific (course, semester, section)
  // Enforce exclusivity (at most one instructor can own class and at most one can own online for a given (course, semester, section))
  const toggleSection = (
    instructorId,
    course,
    section,
    semester,
    component // "class" | "online" | "both"
  ) => {
    const courseId = String(course.course_id);
    const key = `${instructorId}-${courseId}-${semester}`;

    setAssignments((prev) => {
      const next = { ...prev };

      // Helper to enforce exclusivity. Turn component off for other instructor when we turn component on for target instructor.
      const unsetFromOthers = (comp) => {
        // Remove component from any other instructor for the same (course, semester, section)
        for (const [k, entry] of Object.entries(next)) {
          const [iId, cId, sem] = k.split("-");
          // Continue if not same
          if (
            cId !== courseId ||
            sem !== semester ||
            iId === String(instructorId)
          )
            continue;

          const sections = entry?.sections || {};
          const secState = sections[section];
          if (secState?.[comp]) {
            const newSecState = { ...secState, [comp]: false }; // Turn off the component
            const newSections = { ...sections };
            // If both class and online are now false, remove the section entry
            if (!newSecState.class && !newSecState.online) {
              delete newSections[section];
            } else {
              newSections[section] = newSecState;
            }
            // If section has no components left, remove the entire entry
            const updatedEntry = { ...entry, sections: newSections };
            if (Object.keys(updatedEntry.sections).length === 0) {
              delete next[k];
            } else {
              next[k] = updatedEntry;
            }
          }
        }
      };
      // Ensure exclusivity (unsetFromOthers()) if we are turning a component on
      // Toggles or sets specific component flag (class or online) for target (instructorId, courseId, semester, section)
      const apply = (comp, toValue) => {
        const entry = next[key] || { sections: {} };
        const currentSec = entry.sections[section] ?? {
          class: false,
          online: false,
        };

        // Determine target value: if toValue is undefined, we toggle; else we set to toValue
        const target = toValue === undefined ? !currentSec[comp] : !!toValue;

        if (target) {
          unsetFromOthers(comp); // Turning on, remove from others first (exclusivity)
        }

        const newSec = { ...currentSec, [comp]: target };
        let newSections = { ...entry.sections };

        // If both class and online are false, remove the section entry
        if (!newSec.class && !newSec.online) {
          delete newSections[section];
        } else {
          newSections[section] = newSec;
        }

        // If no sections left for this (instructor, course, semester), remove entire entry
        if (Object.keys(newSections).length === 0) {
          // Nothing left for this (instructor, course, semester), remove entry
          if (next[key]) delete next[key];
        } else {
          next[key] = { ...entry, sections: newSections };
        }
      };

      // Handle the three cases: "class", "online", "both"
      if (component === "both") {
        const existing = next[key]?.sections?.[section] ?? {
          class: false,
          online: false,
        };
        const hasBoth = !!(existing.class && existing.online);
        if (hasBoth) {
          // Clicking "both" again; Toggle both off
          apply("class", false);
          apply("online", false);
        } else {
          // Else Assign both to this instructor (and remove from others)
          apply("class", true);
          apply("online", true);
        }
      } else if (component === "class" || component === "online") {
        apply(component, undefined); // toggle single component
      }

      return next;
    });
  };

  // Clean up assignments if instructors or courses are removed, otherwise assignments retain stale data
  // USED AI Q: I would like to reset the section assignments if I remove the instructor and/or course. How would I do this? (CLEAN UP ASSIGNMENTS IF INSTRUCTOR/COURSE REMOVED))
  useEffect(() => {
    setAssignments((prev) => {
      const validInstructorIds = new Set(
        newScheduleDraft.addedInstructors.map((i) => String(i.instructor_id))
      );
      const validCourseIdsBySemester = {
        winter: new Set(
          newScheduleDraft.addedCoursesBySemester.winter.map((c) =>
            String(c.course_id)
          )
        ),
        springSummer: new Set(
          newScheduleDraft.addedCoursesBySemester.springSummer.map((c) =>
            String(c.course_id)
          )
        ),
        fall: new Set(
          newScheduleDraft.addedCoursesBySemester.fall.map((c) =>
            String(c.course_id)
          )
        ),
      };
      // Create a new assignments object with only valid keys
      const updatedAssignments = {};
      // Loop through previous assignments and update assignments to include only the ones still in the addedInstructors and addedCourses
      for (const [key, value] of Object.entries(prev)) {
        const [iId, cId, sem] = key.split("-");
        if (
          validInstructorIds.has(iId) &&
          validCourseIdsBySemester[sem]?.has(cId)
        ) {
          updatedAssignments[key] = value;
        }
      }
      return updatedAssignments;
    });
  }, [
    newScheduleDraft.addedInstructors,
    newScheduleDraft.addedCoursesBySemester,
  ]);

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
    setRowHeights({});
    setHeaderHeight(null);
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
      {/* Controls */}
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
              onRowResize={handleRowResize}
              onHeaderResize={handleHeaderResize}
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
                rowHeights={rowHeights}
                headerHeight={headerHeight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
