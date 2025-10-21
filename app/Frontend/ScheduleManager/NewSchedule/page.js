"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../supabaseClient";
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
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("schedule_id");
  
  const [newScheduleDraft, setNewScheduleDraft] = useState({
    metaData: {
      year: 2025,
      activeSemesters: { winter: true, springSummer: true, fall: true },
    },
    addedInstructors: [],
    addedCoursesBySemester: { winter: [], springSummer: [], fall: [] },
  });
  const [instructorData, setInstructorData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string }
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

  // Get current user from Supabase
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch instructors and courses from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [instructorsResponse, coursesResponse] = await Promise.all([
          fetch("http://localhost:5000/api/instructors"),
          fetch("http://localhost:5000/api/courses")
        ]);

        if (!instructorsResponse.ok || !coursesResponse.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const instructorsData = await instructorsResponse.json();
        const coursesData = await coursesResponse.json();

        setInstructorData(instructorsData);
        setCourseData(coursesData);
      } catch (error) {
        setError("Failed to fetch data: " + error.message);
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load existing schedule if schedule_id is provided
  useEffect(() => {
    if (!scheduleId || isLoading || !instructorData.length || !courseData.length) {
      return;
    }

    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const response = await fetch(
          `http://localhost:5000/schedules/${scheduleId}/json`
        );

        if (!response.ok) {
          throw new Error("Failed to load schedule");
        }

        const data = await response.json();

        // Update metadata
        setNewScheduleDraft((prev) => ({
          ...prev,
          metaData: {
            year: data.metaData.year,
            activeSemesters: data.metaData.activeSemesters,
          },
        }));

        // Set assignments directly
        setAssignments(data.assignments);

        // Extract unique instructor IDs and course IDs from assignments
        const instructorIds = new Set();
        const courseIdsBySemester = {
          winter: new Set(),
          springSummer: new Set(),
          fall: new Set(),
        };

        for (const [key, _] of Object.entries(data.assignments)) {
          const parts = key.split("-");
          if (parts.length >= 3) {
            const instructorId = parts[0];
            const courseId = parts.slice(1, -1).join("-");
            const semester = parts[parts.length - 1];

            instructorIds.add(instructorId);
            if (courseIdsBySemester[semester]) {
              courseIdsBySemester[semester].add(courseId);
            }
          }
        }

        // Match instructor IDs to full instructor objects
        const addedInstructors = instructorData.filter((instructor) =>
          instructorIds.has(String(instructor.instructor_id))
        );

        // Match course IDs to full course objects for each semester
        const addedCoursesBySemester = {
          winter: courseData.filter((course) =>
            courseIdsBySemester.winter.has(String(course.course_id))
          ),
          springSummer: courseData.filter((course) =>
            courseIdsBySemester.springSummer.has(String(course.course_id))
          ),
          fall: courseData.filter((course) =>
            courseIdsBySemester.fall.has(String(course.course_id))
          ),
        };

        // Update draft with loaded instructors and courses
        setNewScheduleDraft((prev) => ({
          ...prev,
          addedInstructors,
          addedCoursesBySemester,
        }));
      } catch (error) {
        setError("Failed to load schedule: " + error.message);
        console.error("Error loading schedule:", error);
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadSchedule();
  }, [scheduleId, isLoading, instructorData, courseData]);

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
  const handleSave = async () => {
    setSaveStatus(null);

    // Validation
    if (!currentUserId) {
      setSaveStatus({
        type: "error",
        message: "User not authenticated. Please log in again.",
      });
      return;
    }

    if (Object.keys(assignments).length === 0) {
      setSaveStatus({
        type: "error",
        message: "No assignments to save. Please assign courses to instructors.",
      });
      return;
    }

    try {
      const payload = {
        academic_year: newScheduleDraft.metaData.year,
        academic_chair_id: currentUserId,
        assignments: assignments,
      };

      // Include schedule_id if updating existing schedule
      if (scheduleId) {
        payload.schedule_id = scheduleId;
      }

      const response = await fetch("http://localhost:5000/schedules/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save schedule");
      }

      setSaveStatus({
        type: "success",
        message: `Schedule saved successfully! ${data.sections_created} section(s) created.`,
      });

      // Clear status message after 5 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
    } catch (error) {
      console.error("Error saving schedule:", error);
      setSaveStatus({
        type: "error",
        message: "Failed to save schedule: " + error.message,
      });
    }
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
      {/* Loading State */}
      {(isLoading || loadingSchedule) && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md flex items-center">
          <svg
            className="animate-spin h-5 w-5 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingSchedule ? "Loading schedule..." : "Loading data..."}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Save Status Message */}
      {saveStatus && (
        <div
          className={`mb-4 p-4 rounded-md ${
            saveStatus.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <strong>{saveStatus.type === "success" ? "Success!" : "Error:"}</strong>{" "}
          {saveStatus.message}
        </div>
      )}

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
