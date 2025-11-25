"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../supabaseClient";
import ScheduleControls from "./schedulecontrols";
import InstructorSection from "./instructorsection";
import CourseSection from "./coursesection";
import AssignmentGrid from "./assignmentgrid";
import ACProgramCourses from "../../_Components/ACProgramCourses";

const semester_list = ["winter", "springSummer", "fall"];

export default function NewSchedule() {
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("schedule_id");

  const [newScheduleDraft, setNewScheduleDraft] = useState({
    metaData: {
      year: new Date().getFullYear(),
      activeSemesters: { winter: true, springSummer: true, fall: true },
    },
    addedInstructors: [],
    addedCoursesBySemester: { winter: [], springSummer: [], fall: [] },
  });

  const [instructorData, setInstructorData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [scheduleAcademicChairId, setScheduleAcademicChairId] = useState(null);
  const [isScheduleSubmitted, setIsScheduleSubmitted] = useState(false);
  const [courseSections, setCourseSections] = useState({});

  // Dynamic heights from InstructorSection
  const [rowHeights, setRowHeights] = useState({});
  const [headerHeight, setHeaderHeight] = useState(null);

  // Filters / sort state
  const [hideFullyAssignedCourses, setHideFullyAssignedCourses] =
    useState(true);
  const [hideFullyAssignedInstructors, setHideFullyAssignedInstructors] =
    useState(true);
  const [instructorSortMode, setInstructorSortMode] = useState("alphabetical");

  // Row height handlers
  const handleRowResize = (instructorId, h) => {
    setRowHeights((prev) =>
      prev[instructorId] === h ? prev : { ...prev, [instructorId]: h }
    );
  };
  const handleHeaderResize = (h) =>
    setHeaderHeight((prev) => (prev === h ? prev : h));

  // Get current user from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) setCurrentUserId(data.user.id);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    })();
  }, []);

  // Fetch instructors and courses
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [instructorsRes, coursesRes] = await Promise.all([
          fetch("http://localhost:5000/api/instructors"),
          fetch("http://localhost:5000/api/courses"),
        ]);

        if (!instructorsRes.ok || !coursesRes.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const instructorsData = await instructorsRes.json();
        const coursesData = await coursesRes.json();

        setInstructorData(instructorsData || []);
        setCourseData(coursesData || []);

        // Initialize empty semesters
        setNewScheduleDraft((prev) => ({
          ...prev,
          addedCoursesBySemester: { winter: [], springSummer: [], fall: [] },
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load existing schedule if it does exist
  useEffect(() => {
    if (
      !scheduleId ||
      isLoading ||
      !instructorData.length ||
      !courseData.length
    )
      return;

    const loadSchedule = async () => {
      setLoadingSchedule(true);
      setError(null);

      try {
        // 1️⃣ Fetch schedule metadata
        const { data: scheduleMeta, error: metaError } = await supabase
          .from("schedules")
          .select("academic_chair_id, submission_status, academic_year")
          .eq("id", scheduleId)
          .single();

        if (metaError && metaError.code !== "PGRST116")
          console.error(metaError);

        if (scheduleMeta) {
          setScheduleAcademicChairId(scheduleMeta.academic_chair_id);
          setIsScheduleSubmitted(false);
          setNewScheduleDraft((prev) => ({
            ...prev,
            metaData: {
              ...prev.metaData,
              year: scheduleMeta.academic_year || prev.metaData.year,
            },
          }));
        }

        // 2️⃣ Fetch assignments JSON
        const response = await fetch(
          `http://localhost:5000/schedules/${scheduleId}/json`
        );
        if (!response.ok) throw new Error("Failed to load schedule JSON");
        const data = await response.json();
        setAssignments(data.assignments || []);

        const activeSemestersFromBackend = data.metaData?.activeSemesters || {
          winter: true,
          springSummer: true,
          fall: true,
        };

        setNewScheduleDraft((prev) => ({
          ...prev,
          metaData: {
            ...prev.metaData,
            year: data.metaData?.year || prev.metaData.year,
            activeSemesters: activeSemestersFromBackend,
          },
        }));

        // 3️⃣ Fetch scheduled courses for this schedule
        const { data: schCoursesData, error: schCoursesError } = await supabase
          .from("scheduled_courses")
          .select("course_id, term, num_sections")
          .eq("schedule_id", scheduleId);

        if (schCoursesError) console.error(schCoursesError);

        // Map course_id => num_sections
        const courseSectionsMap = {};
        (schCoursesData || []).forEach((sc) => {
          courseSectionsMap[sc.course_id] = sc.num_sections;
        });

        setCourseSections(courseSectionsMap); // ✅ store in state

        // 4️⃣ Build addedCoursesBySemester
        const addedCoursesBySemester = {
          winter: [],
          springSummer: [],
          fall: [],
        };
        const courseIdsBySemester = {
          winter: new Set(),
          springSummer: new Set(),
          fall: new Set(),
        };

        (schCoursesData || []).forEach((sc) => {
          const termParts = (sc.term || "")
            .split(/[,|;-]+|\s-\s/)
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

          termParts.forEach((t) => {
            if (t.includes("winter"))
              courseIdsBySemester.winter.add(sc.course_id);
            if (t.includes("spring"))
              courseIdsBySemester.springSummer.add(sc.course_id);
            if (t.includes("fall")) courseIdsBySemester.fall.add(sc.course_id);
          });
        });

        semester_list.forEach((sem) => {
          addedCoursesBySemester[sem] = courseData
            .filter((c) => courseIdsBySemester[sem].has(c.course_id))
            .map((c) => ({
              ...c,
              num_sections: courseSectionsMap[c.course_id] || 0, // attach num_sections here
            }));
        });

        // 5️⃣ Build addedInstructors from assignments
        const instructorIds = new Set();
        Object.keys(data.assignments || {}).forEach((key) => {
          const parts = key.split("-");
          if (parts.length < 3) return;
          instructorIds.add(String(parts[0]));
        });

        const addedInstructors = instructorData.filter((instr) =>
          instructorIds.has(String(instr.instructor_id))
        );

        // 6️⃣ Update state
        setNewScheduleDraft((prev) => ({
          ...prev,
          addedCoursesBySemester,
          addedInstructors,
        }));
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError("Failed to load schedule: " + err.message);
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadSchedule();
  }, [scheduleId, isLoading, instructorData, courseData]);

  // Pre-populate instructors and courses based on AC programs
  useEffect(() => {
    if (
      !scheduleAcademicChairId ||
      !courseData.length ||
      !instructorData.length ||
      isLoading ||
      loadingSchedule
    ) {
      return;
    }

    const prePopulateACPrograms = async () => {
      try {
        // Fetch all programs
        const { data: allPrograms, error: programsError } = await supabase
          .from("programs")
          .select("*");

        if (programsError) {
          console.error("Error fetching programs:", programsError);
          return;
        }

        // Filter programs for this academic chair
        const filteredPrograms = (allPrograms || []).filter((program) =>
          (program.academic_chair || "").includes(scheduleAcademicChairId)
        );
        if (!filteredPrograms.length) return;

        const programIds = filteredPrograms.map((p) => p.program_id);
        const programAcronyms = filteredPrograms
          .map((p) => p.acronym)
          .filter(Boolean);

        // Match instructors whose primary program matches AC programs
        const matchingInstructors = instructorData.filter((instr) =>
          programAcronyms.includes(instr.primary_program)
        );

        // Courses belonging to AC programs
        const programCourses = courseData.filter((course) =>
          programIds.includes(course.program_id)
        );

        // Build semester-specific courses based on program intakes
        const coursesBySemester = {
          winter: new Set(),
          springSummer: new Set(),
          fall: new Set(),
        };
        filteredPrograms.forEach((program) => {
          const programCoursesForThisProgram = programCourses.filter(
            (c) => c.program_id === program.program_id
          );
          const intakes = program.intakes || "";
          const hasWinter = intakes.includes("Winter");
          const hasSpring = intakes.includes("Spring");
          const hasFall = intakes.includes("Fall");

          programCoursesForThisProgram.forEach((course) => {
            if (hasWinter) coursesBySemester.winter.add(course.course_id);
            if (hasSpring) coursesBySemester.springSummer.add(course.course_id);
            if (hasFall) coursesBySemester.fall.add(course.course_id);
          });
        });

        // Map course IDs to course objects
        const newCoursesBySemester = {};
        semester_list.forEach((sem) => {
          newCoursesBySemester[sem] = programCourses.filter((course) =>
            coursesBySemester[sem].has(course.course_id)
          );
        });

        // Merge into existing draft without duplicates
        setNewScheduleDraft((prev) => {
          const mergedCoursesBySemester = {};
          semester_list.forEach((sem) => {
            const existingCourses = prev.addedCoursesBySemester[sem] || [];
            const acCourses = newCoursesBySemester[sem] || [];
            mergedCoursesBySemester[sem] = [
              ...existingCourses,
              ...acCourses.filter(
                (c) =>
                  !existingCourses.some((ec) => ec.course_id === c.course_id)
              ),
            ];
          });

          // Merge instructors without duplicates
          const mergedInstructors = [
            ...prev.addedInstructors,
            ...matchingInstructors.filter(
              (i) =>
                !prev.addedInstructors.some(
                  (pi) => pi.instructor_id === i.instructor_id
                )
            ),
          ];

          return {
            ...prev,
            addedCoursesBySemester: mergedCoursesBySemester,
            addedInstructors: mergedInstructors,
          };
        });
      } catch (err) {
        console.error(
          "Error pre-populating AC program courses/instructors:",
          err
        );
      }
    };

    prePopulateACPrograms();
  }, [
    scheduleAcademicChairId,
    courseData,
    instructorData,
    isLoading,
    loadingSchedule,
  ]);

  // Handler to update num_sections for a course in a semester
  const handleUpdateCourseSections = (course_id, semester, newCount) => {
    if (isScheduleSubmitted) return; // prevent edits if submitted

    setNewScheduleDraft((prev) => {
      const currentCourses = prev.addedCoursesBySemester[semester] || [];
      const updatedCourses = currentCourses.map((c) =>
        c.course_id === course_id ? { ...c, num_sections: newCount } : c
      );

      return {
        ...prev,
        addedCoursesBySemester: {
          ...prev.addedCoursesBySemester,
          [semester]: updatedCourses,
        },
      };
    });

    // Also update courseSections state for easy lookup if needed elsewhere
    setCourseSections((prev) => ({
      ...prev,
      [course_id]: newCount,
    }));
  };

  // Handler function to add an instructor to the newScheduleDraft state
  const handleAddInstructor = (instructor) => {
    if (isScheduleSubmitted) return; // Prevent editing when submitted
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedInstructors: [...prevDraft.addedInstructors, instructor],
    }));
  };

  // Handler function to remove an instructor from the newScheduleDraft state
  const handleRemoveInstructor = (instructor) => {
    if (isScheduleSubmitted) return; // Prevent editing when submitted
    setNewScheduleDraft((prevDraft) => ({
      ...prevDraft,
      addedInstructors: prevDraft.addedInstructors.filter(
        (i) => i.instructor_id !== instructor.instructor_id
      ),
    }));
    // Clear measured height for that row
    setRowHeights((prev) => {
      const copy = { ...prev };
      delete copy[instructor.instructor_id];
      return copy;
    });

    // remove all assignments for that instructor
    setAssignments((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(String(instructor.instructor_id) + "-")) {
          delete copy[k];
        }
      });
      return copy;
    });
  };

  // Add course to semester
  const handleAddCourseToSemester = (semester, course) => {
    if (isScheduleSubmitted) return;
    setNewScheduleDraft((prevDraft) => {
      const current = prevDraft.addedCoursesBySemester[semester] || [];
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

  // Remove course from semester
  const handleRemoveCourseFromSemester = (semester, course) => {
    if (isScheduleSubmitted) return;
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

  // toggleSection
  const toggleSection = (
    instructorId,
    course,
    section,
    semester,
    component
  ) => {
    if (isScheduleSubmitted) return;
    const courseId = String(course.course_id);
    const key = `${instructorId}-${courseId}-${semester}`;

    setAssignments((prev) => {
      const next = { ...prev };

      const unsetFromOthers = (comp) => {
        for (const [k, entry] of Object.entries(next)) {
          const [iId, cId, sem] = k.split("-");
          if (
            cId !== courseId ||
            sem !== semester ||
            iId === String(instructorId)
          )
            continue;

          const sections = entry?.sections || {};
          const secState = sections[section];
          if (secState?.[comp]) {
            const newSecState = { ...secState, [comp]: false };
            const newSections = { ...sections };
            if (!newSecState.class && !newSecState.online) {
              delete newSections[section];
            } else {
              newSections[section] = newSecState;
            }
            const updatedEntry = { ...entry, sections: newSections };
            if (Object.keys(updatedEntry.sections).length === 0) {
              delete next[k];
            } else {
              next[k] = updatedEntry;
            }
          }
        }
      };

      const apply = (comp, toValue) => {
        const entry = next[key] || { sections: {} };
        const currentSec = entry.sections[section] ?? {
          class: false,
          online: false,
        };
        const target = toValue === undefined ? !currentSec[comp] : !!toValue;
        if (target) unsetFromOthers(comp);
        const newSec = { ...currentSec, [comp]: target };
        let newSections = { ...entry.sections };
        if (!newSec.class && !newSec.online) {
          delete newSections[section];
        } else {
          newSections[section] = newSec;
        }
        if (Object.keys(newSections).length === 0) {
          if (next[key]) delete next[key];
        } else {
          next[key] = { ...entry, sections: newSections };
        }
      };

      if (component === "both") {
        const existing = next[key]?.sections?.[section] ?? {
          class: false,
          online: false,
        };
        const hasBoth = !!(existing.class && existing.online);
        if (hasBoth) {
          apply("class", false);
          apply("online", false);
        } else {
          apply("class", true);
          apply("online", true);
        }
      } else if (component === "class" || component === "online") {
        apply(component, undefined);
      }

      return next;
    });
  };

  // Cleanup assignments when instructors remove
  useEffect(() => {
    setAssignments((prev) => {
      const validInstructorIds = new Set(
        newScheduleDraft.addedInstructors.map((i) => String(i.instructor_id))
      );
      const updatedAssignments = {};
      for (const [key, value] of Object.entries(prev)) {
        const [iId] = key.split("-");
        if (validInstructorIds.has(iId)) updatedAssignments[key] = value;
      }
      return updatedAssignments;
    });
  }, [newScheduleDraft.addedInstructors]);

  // Save handler
  const handleSave = async () => {
    setSaveStatus(null);
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
        message:
          "No assignments to save. Please assign courses to instructors.",
      });
      return;
    }

    try {
      const payload = {
        academic_year: newScheduleDraft.metaData.year,
        academic_chair_id: currentUserId,
        assignments,
      };
      if (scheduleId) payload.schedule_id = scheduleId;

      const response = await fetch("http://localhost:5000/schedules/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to save schedule");

      setSaveStatus({
        type: "success",
        message: `Schedule saved successfully! ${data.sections_created} section(s) created.`,
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err) {
      console.error("Error saving schedule:", err);
      setSaveStatus({
        type: "error",
        message: "Failed to save schedule: " + err.message,
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

  // Helper functions (hoursPerSection, sumHours, calculateSemesterHours, sumTotal, isCourseFullyAssigned, isInstructorFullyAssigned)
  const hoursPerSection = (semester, courseId) => {
    const courses = newScheduleDraft.addedCoursesBySemester?.[semester] || [];
    const course = courses.find(
      (c) => String(c.course_id) === String(courseId)
    );
    return {
      classHrs: course?.class_hrs || 0,
      onlineHrs: course?.online_hrs || 0,
    };
  };

  const sumHours = (instructorId, semester) => {
    let sum = 0;
    const iId = String(instructorId);
    for (const [key, value] of Object.entries(assignments || {})) {
      const parts = key.split("-");
      if (parts.length < 3) continue;
      const [iid, ...rest] = parts;
      const sem = rest[rest.length - 1];
      const cid = rest.slice(0, -1).join("-");
      if (iid !== iId || sem !== semester) continue;
      const { classHrs, onlineHrs } = hoursPerSection(sem, cid);
      const sections = value?.sections || {};
      for (const sec of Object.values(sections)) {
        if (sec.class) sum += classHrs;
        if (sec.online) sum += onlineHrs;
      }
    }
    return sum;
  };

  const calculateSemesterHours = (instructorId, semester) =>
    sumHours(instructorId, semester) * 15;
  const sumTotal = (instructorId) => {
    let total = 0;
    for (const sem of ["winter", "springSummer", "fall"])
      total += calculateSemesterHours(instructorId, sem);
    return total;
  };

  const isCourseFullyAssigned = (courseId, semester) => {
    const cId = String(courseId);
    const expectedSections = ["A", "B", "C", "D", "E", "F"];
    const courseSections = {};
    for (const [key, value] of Object.entries(assignments || {})) {
      const parts = key.split("-");
      if (parts.length < 3) continue;
      const [, ...rest] = parts;
      const sem = rest[rest.length - 1];
      const assignedCourseId = rest.slice(0, -1).join("-");
      if (assignedCourseId !== cId || sem !== semester) continue;
      const sections = value?.sections || {};
      for (const [sectionLetter, sectionData] of Object.entries(sections)) {
        if (!courseSections[sectionLetter])
          courseSections[sectionLetter] = { class: false, online: false };
        if (sectionData.class) courseSections[sectionLetter].class = true;
        if (sectionData.online) courseSections[sectionLetter].online = true;
      }
    }
    for (const sectionLetter of expectedSections) {
      const sectionData = courseSections[sectionLetter];
      if (!sectionData || !sectionData.class || !sectionData.online)
        return false;
    }
    return true;
  };

  const isInstructorFullyAssigned = (instructor) => {
    const totalHours = sumTotal(instructor.instructor_id);
    const cchLimit = instructor.contract_type === "Casual" ? 800 : 615;
    return totalHours >= cchLimit * 0.9;
  };

  const getFilteredCoursesBySemester = () => {
    const filtered = {};
    for (const semester of semester_list) {
      const courses = newScheduleDraft.addedCoursesBySemester?.[semester] || [];
      filtered[semester] = courses.filter((course) => {
        if (!hideFullyAssignedCourses) return true;
        return !isCourseFullyAssigned(course.course_id, semester);
      });
    }
    return filtered;
  };

  const getSortedAndFilteredInstructors = () => {
    let instructors = [...newScheduleDraft.addedInstructors];
    if (hideFullyAssignedInstructors) {
      instructors = instructors.filter(
        (instructor) => !isInstructorFullyAssigned(instructor)
      );
    }

    if (instructorSortMode === "alphabetical") {
      instructors.sort((a, b) => {
        const nameA =
          a.full_name || `${a.instructor_name} ${a.instructor_lastName}`;
        const nameB =
          b.full_name || `${b.instructor_name} ${b.instructor_lastName}`;
        return nameA.localeCompare(nameB);
      });
    } else if (instructorSortMode === "currentSemesterHours") {
      const { winter, springSummer, fall } =
        newScheduleDraft.metaData.activeSemesters;
      const allActive = winter && springSummer && fall;
      const currentSemester = allActive
        ? null
        : winter
        ? "winter"
        : springSummer
        ? "springSummer"
        : fall
        ? "fall"
        : null;
      instructors.sort((a, b) => {
        const hoursA = currentSemester
          ? sumHours(a.instructor_id, currentSemester)
          : sumTotal(a.instructor_id);
        const hoursB = currentSemester
          ? sumHours(b.instructor_id, currentSemester)
          : sumTotal(b.instructor_id);
        return hoursA - hoursB;
      });
    } else if (instructorSortMode === "totalHours") {
      instructors.sort(
        (a, b) => sumTotal(a.instructor_id) - sumTotal(b.instructor_id)
      );
    }

    return instructors;
  };

  const filteredCoursesBySemester = getFilteredCoursesBySemester();
  const sortedAndFilteredInstructors = getSortedAndFilteredInstructors();
  const visibleSemesters = semester_list.filter(
    (sem) => newScheduleDraft.metaData.activeSemesters?.[sem]
  );

  const topScrollerRef = useRef(null);
  const bottomScrollerRef = useRef(null);
  const handleTopScroll = (e) => {
    if (bottomScrollerRef.current)
      bottomScrollerRef.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  return (
    <div className="p-4">
      {isScheduleSubmitted && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <strong className="font-bold">
                Schedule Locked (Read-Only Mode)
              </strong>
              <p className="text-sm mt-1">
                This schedule has been submitted and is locked from editing.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {saveStatus && (
        <div
          className={`mb-4 p-4 rounded-md ${
            saveStatus.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <strong>
            {saveStatus.type === "success" ? "Success!" : "Error:"}
          </strong>{" "}
          {saveStatus.message}
        </div>
      )}

      <div className="flex justify-around">
        <ScheduleControls
          metaData={newScheduleDraft.metaData}
          setNewScheduleDraft={setNewScheduleDraft}
          onSave={handleSave}
          onClear={handleClear}
          hideFullyAssignedCourses={hideFullyAssignedCourses}
          setHideFullyAssignedCourses={setHideFullyAssignedCourses}
          hideFullyAssignedInstructors={hideFullyAssignedInstructors}
          setHideFullyAssignedInstructors={setHideFullyAssignedInstructors}
          instructorSortMode={instructorSortMode}
          setInstructorSortMode={setInstructorSortMode}
          isScheduleSubmitted={isScheduleSubmitted}
        />
      </div>

      {scheduleAcademicChairId && (
        <div className="mb-4">
          <ACProgramCourses
            academicChairId={scheduleAcademicChairId}
            assignments={assignments}
          />
        </div>
      )}

      <div className="flex flex-col">
        <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] flex-1">
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
                      onUpdateCourseSections={handleUpdateCourseSections}
                      onRemoveCourse={(course, sem) =>
                        handleRemoveCourseFromSemester(sem, course)
                      }
                      addedCourses={filteredCoursesBySemester[semester]}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-start-1 row-start-2">
            <InstructorSection
              instructors={instructorData}
              onAddInstructor={handleAddInstructor}
              onRemoveInstructor={handleRemoveInstructor}
              addedInstructors={sortedAndFilteredInstructors}
              assignments={assignments}
              addedCoursesBySemester={newScheduleDraft.addedCoursesBySemester}
              onRowResize={handleRowResize}
              onHeaderResize={handleHeaderResize}
            />
          </div>

          <div className="col-start-2 row-start-2 min-w-0">
            <div ref={bottomScrollerRef} className="overflow-x-hidden w-full">
              {!isLoading && !loadingSchedule && (
                <AssignmentGrid
                  addedInstructors={sortedAndFilteredInstructors}
                  addedCoursesBySemester={filteredCoursesBySemester}
                  assignments={assignments}
                  onToggleSection={toggleSection}
                  activeSemesters={newScheduleDraft.metaData.activeSemesters}
                  rowHeights={rowHeights}
                  headerHeight={headerHeight}
                  onUpdateCourseSections={handleUpdateCourseSections}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
