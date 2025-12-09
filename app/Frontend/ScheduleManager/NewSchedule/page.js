// Note: Portions of this file were developed with assistance from AI tools for organization, debugging, and code suggestions.
// All architectural decisions and final implementation were done by the developer.

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
    metaData: {},
    addedInstructors: [],
    addedCoursesBySemester: {},
  });

  //for updated version
  const [instructors, setInstructors] = useState([]);
  const [addedScheduledInstructors, setAddedScheduledInstructors] = useState(
    []
  );
  const [scheduleCoursesBySemester, setScheduleCoursesBySemester] = useState({
    winter: [],
    spring: [],
    summer: [],
    fall: [],
  });
  const [sections, setSections] = useState([]);
  const [assignedSections, setAssignedSections] = useState({});

  const [courseSectionsMap, setCourseSectionsMap] = useState({});

  //
  const [instructorData, setInstructorData] = useState([]); //see how still used

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
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

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

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/sections`
        );
        const data = await res.json();

        const rawSections = data.sections || [];

        // Build the map that AssignmentGrid uses
        const assignedMap = {};
        for (const sec of rawSections) {
          if (sec.instructor_id) {
            const key = `${sec.instructor_id}-${sec.scheduled_course_id}-${sec.section_letter}`;
            assignedMap[key] = true;
          }
        }

        setSections(rawSections);
        setAssignedSections(assignedMap);

        console.log("Rebuilt assignedSections:", assignedMap);
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      }
    };

    fetchSections();
  }, [scheduleId]);

  useEffect(() => {
    if (!scheduleId) return;

    const fetchScheduleCourses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/courses`
        );
        if (!res.ok) throw new Error("Failed to fetch schedule courses");
        const data = await res.json();

        setScheduleCoursesBySemester(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchScheduleCourses();
  }, [scheduleId]);

  // Fetch schedule metadata (academic_year, academic_chair_id)
  useEffect(() => {
    if (!scheduleId) return;

    const fetchScheduleMetadata = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/json`
        );
        if (!res.ok) throw new Error("Failed to fetch schedule metadata");
        const data = await res.json();

        const schedule = data.schedule || {};
        const metaData = data.metaData || {};

        // Set academic chair ID
        setScheduleAcademicChairId(schedule.academic_chair_id || null);

        // Set metadata including academic year
        setNewScheduleDraft((prev) => ({
          ...prev,
          metaData: {
            ...prev.metaData,
            year: metaData.year || schedule.academic_year,
            activeSemesters: metaData.activeSemesters || {},
          },
        }));

        console.log("Loaded schedule metadata:", {
          academic_year: metaData.year || schedule.academic_year,
          academic_chair_id: schedule.academic_chair_id,
        });
      } catch (err) {
        console.error("Error fetching schedule metadata:", err);
      }
    };

    fetchScheduleMetadata();
  }, [scheduleId]);

  //Fetch courses
  // useEffect(() => {
  //   const fetchCourses = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/courses`
  //       );
  //       if (!res.ok) throw new Error("Failed to fetch courses");
  //       const data = await res.json();
  //       setCourseData(data || []);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Failed to fetch courses: " + err.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchCourses();
  // }, []);

  //FETCH THE COURSES ATTACHED TO THE SCHEDULE FROM SCHEDULED_COURSES
  async function fetchScheduledCourses(scheduleId) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/scheduled_courses`
    );
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data.scheduled_courses;
  }

  //Fetch instructors based on courses in the schedule
  useEffect(() => {
    if (!scheduleId) return;

    const fetchInstructors = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/instructors`
        );
        const data = await res.json();

        if (res.ok) {
          setInstructorData(data.instructors || []);
        } else {
          console.error("Failed to fetch instructors:", data.error);
        }
      } catch (err) {
        console.error("Error fetching instructors:", err);
      }
    };

    fetchInstructors();
  }, [scheduleId]);

  //TOGGLE SECTION HANDLER
  const handleToggleSection = async (scheduledCourseId, sectionLetter) => {
    // 1. Call backend toggle API
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/scheduled_courses/${scheduledCourseId}/sections/toggle`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_letter: sectionLetter, scheduleId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to toggle section:", data.error);
      return;
    }

    // 2. Update local state with returned sections
    setScheduleCoursesBySemester((prev) => {
      const newState = { ...prev };

      ["winter", "spring", "summer", "fall"].forEach((sem) => {
        const courses = newState[sem] || [];
        newState[sem] = courses.map((course) => {
          if (course.course_id === scheduledCourseId) {
            return {
              ...course,
              sections: data.sections.map((s) => s.section_letter),
              num_sections: data.sections.length,
            };
          }
          return course;
        });
      });

      return newState;
    });
  };
  // const handleToggleSection = async (scheduled_course_id, section_letter) => {
  //   // 1. Call backend toggle API
  //   const res = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/scheduled_courses/${scheduled_course_id}/sections/toggle`,
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ section_letter, scheduleId }),
  //     }
  //   );

  //   const data = await res.json();

  //   if (!res.ok) {
  //     console.error(data.error);
  //     return;
  //   }

  //   // 2. Update local state with returned sections
  //   setNewScheduleDraft((prev) => {
  //     const updated = { ...prev };
  //     for (const [sem, list] of Object.entries(
  //       updated.addedCoursesBySemester
  //     )) {
  //       updated.addedCoursesBySemester[sem] = list.map((c) => {
  //         if (c.scheduled_course_id !== scheduled_course_id) return c;
  //         return {
  //           ...c,
  //           sections: data.sections, // backend returns updated array
  //         };
  //       });
  //     }
  //     return updated;
  //   });
  // };

  //HANDLE TOGGLE INSTRUCTOR
  const handleToggleInstructor = async (
    instructorId,
    scheduledCourseId,
    sectionLetter
  ) => {
    const key = `${instructorId}-${scheduledCourseId}-${sectionLetter}`;
    try {
      const res = await fetch(
        `/schedules/${scheduleId}/sections/toggle-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructor_id: instructorId,
            scheduled_course_id: scheduledCourseId,
            section_letter: sectionLetter,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAssignedSections((prev) => ({
          ...prev,
          [key]: !!data.instructor_id,
        }));
      } else {
        console.error("Failed to toggle instructor assignment");
      }
    } catch (err) {
      console.error("Error toggling instructor:", err);
    }
  };

  useEffect(() => {
    if (!scheduleId || isLoading || courseData.length === 0) return;

    const loadScheduleCourses = async () => {
      setLoadingSchedule(true);
      setError(null);

      try {
        // Fetch schedule JSON
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/json`
        );
        if (!response.ok) throw new Error("Failed to load schedule JSON");
        const data = await response.json();

        const coursesBySemester = data.courses_by_semester || {};

        // Build addedCoursesBySemester with full course data
        const addedCoursesBySemester = {};
        Object.entries(coursesBySemester).forEach(([semester, courses]) => {
          addedCoursesBySemester[semester] = courses.map((c) => {
            const fullCourseData =
              courseData.find((cd) => cd.course_id === c.course_id) || {};

            return {
              ...c,
              sections: c.sections || [],
              num_sections:
                c.num_sections !== undefined
                  ? c.num_sections
                  : c.sections
                  ? c.sections.length
                  : 1,
              class_hrs: c.class_hrs ?? fullCourseData.class_hrs ?? 0,
              online_hrs: c.online_hrs ?? fullCourseData.online_hrs ?? 0,
            };
          });
        });

        setNewScheduleDraft((prev) => ({
          ...prev,
          addedCoursesBySemester,
        }));

        console.log("Loaded courses for schedule:", addedCoursesBySemester);
      } catch (err) {
        console.error("Error loading schedule courses:", err);
        setError("Failed to load schedule courses: " + err.message);
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadScheduleCourses();
  }, [scheduleId, isLoading, courseData]);

  //LOAD SCHEDULED INSTRUCTORS
  useEffect(() => {
    if (!scheduleId) return;

    const fetchScheduledInstructors = async () => {
      // 1. Get all instructors
      const allInstructorsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/instructors`
      );
      const allInstructorsData = await allInstructorsResponse.json();
      setInstructors(allInstructorsData);

      // 2. Get scheduled instructors for this schedule
      const scheduledInstructorsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/scheduled_instructors`
      );
      const scheduledInstructorsData =
        await scheduledInstructorsResponse.json();
      setAddedScheduledInstructors(scheduledInstructorsData);
    };

    fetchScheduledInstructors();
  }, [scheduleId]);

  //HANDLE ADDING A SCHEDULED INSTRUCTOR TO THE SCHEDULED_INSTRUCTORS TABLE
  const handleAddScheduledInstructor = async (instr) => {
    // Call backend to insert into scheduled_instructors table
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scheduled_instructors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schedule_id: scheduleId,
        instructor_id: instr.instructor_id,
      }),
    });

    setAddedScheduledInstructors((prev) => [...prev, instr]);
  };

  //HANDLE REMOVING A SCHEDULED INSTRUCTOR TO THE SCHEDULED_INSTRUCTORS TABLE
  const handleRemoveScheduledInstructor = async (instr) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scheduled_instructors`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schedule_id: scheduleId,
        instructor_id: instr.instructor_id,
      }),
    });

    setAddedScheduledInstructors((prev) =>
      prev.filter((i) => i.instructor_id !== instr.instructor_id)
    );
  };

  useEffect(() => {
    if (!scheduleId) return;

    const fetchSectionCounts = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/section_counts`
      );
      const data = await res.json();
      setCourseSectionsMap(data);
    };

    fetchSectionCounts();
  }, [scheduleId]);
  // useEffect(() => {
  //   // Wait until we have a scheduleId and the course data is loaded
  //   if (!scheduleId || isLoading || courseData.length === 0) return;

  //   const loadSchedule = async () => {
  //     setLoadingSchedule(true);
  //     setError(null);

  //     try {
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/json`
  //       );
  //       if (!response.ok) throw new Error("Failed to load schedule JSON");
  //       const data = await response.json();

  //       const schedule = data.schedule || {};
  //       const metaData = data.metaData || {};
  //       const coursesBySemester = data.courses_by_semester || {};

  //       // --- Set schedule metadata ---
  //       setScheduleAcademicChairId(schedule.academic_chair_id || null);
  //       setIsScheduleSubmitted(false);

  //       setNewScheduleDraft((prev) => ({
  //         ...prev,
  //         metaData: {
  //           ...prev.metaData,
  //           year: metaData.year || prev.metaData.year,
  //           activeSemesters: metaData.activeSemesters || {},
  //         },
  //       }));

  //       //LOAD COURSES ATTACHED TO SCHEDULE
  //       const scheduled = await fetchScheduledCourses(scheduleId);

  //       // Organize by semester:
  //       const bySem = { winter: [], springSummer: [], fall: [] };
  //       for (const sc of scheduled) {
  //         bySem[sc.semester].push(sc);
  //       }

  //       setNewScheduleDraft((prev) => ({
  //         ...prev,
  //         addedCoursesBySemester: bySem,
  //       }));

  //       // --- Build addedCoursesBySemester ---
  //       const addedCoursesBySemester = {};
  //       Object.entries(coursesBySemester).forEach(([semester, courses]) => {
  //         addedCoursesBySemester[semester] = courses.map((c) => {
  //           const numSections =
  //             c.num_sections !== undefined
  //               ? c.num_sections
  //               : c.sections
  //               ? c.sections.length
  //               : 1;

  //           // Look up the full course info from courseData
  //           const fullCourseData =
  //             courseData.find((cd) => cd.course_id === c.course_id) || {};

  //           return {
  //             ...c,
  //             sections: c.sections || [],
  //             num_sections: numSections,
  //             class_hrs: c.class_hrs ?? fullCourseData.class_hrs ?? 0,
  //             online_hrs: c.online_hrs ?? fullCourseData.online_hrs ?? 0,
  //           };
  //         });
  //       });

  //       setNewScheduleDraft((prev) => ({
  //         ...prev,
  //         addedCoursesBySemester,
  //       }));

  //       // --- Build addedInstructors and assignments ---
  //       const addedInstructors = [];
  //       const newAssignments = {};

  //       Object.values(coursesBySemester).forEach((courses) => {
  //         courses.forEach((course) => {
  //           (course.sections || []).forEach((sec) => {
  //             (sec.assigned_instructors || []).forEach((instr) => {
  //               const instrId = instr.instructor_id;

  //               // Add instructor to list (if not already)
  //               const existing = addedInstructors.find(
  //                 (i) => i.instructor_id === instrId
  //               );
  //               if (!existing) {
  //                 addedInstructors.push({
  //                   ...instr,
  //                   first_name: instr.first_name || instr.instructor_name || "",
  //                   last_name:
  //                     instr.last_name || instr.instructor_lastname || "",
  //                   full_name:
  //                     instr.full_name ||
  //                     `${instr.first_name || instr.instructor_name || ""} ${
  //                       instr.last_name || instr.instructor_lastname || ""
  //                     }`,
  //                   total_cch: instr.total_cch ?? 0,
  //                   winter_cch: instr.winter_cch ?? 0,
  //                   spring_summer_cch: instr.spring_summer_cch ?? 0,
  //                   fall_cch: instr.fall_cch ?? 0,
  //                 });
  //               }

  //               // Auto-assign section
  //               const sectionLetter = sec.section_letter || "A";
  //               const key = `${instrId}-${
  //                 course.scheduled_course_id || course.course_id
  //               }-${sectionLetter}`;

  //               const weeklyHrs =
  //                 Number(instr.weekly_hours ?? 0) ||
  //                 Number(course.class_hrs ?? 0) +
  //                   Number(course.online_hrs ?? 0);

  //               newAssignments[key] = {
  //                 instructor_id: instrId,
  //                 scheduled_course_id:
  //                   course.scheduled_course_id || course.course_id,
  //                 section_letter: sectionLetter,
  //                 delivery_mode: sec.delivery_mode || "both",
  //                 weekly_hours: weeklyHrs,
  //                 class_hrs: Number(course.class_hrs ?? 0),
  //                 online_hrs: Number(course.online_hrs ?? 0),
  //               };
  //             });
  //           });
  //         });
  //       });

  //       setAssignments(newAssignments);
  //       setNewScheduleDraft((prev) => ({
  //         ...prev,
  //         addedInstructors,
  //       }));

  //       console.log(
  //         "Loaded schedule:",
  //         Object.keys(coursesBySemester).length,
  //         "semesters,",
  //         addedInstructors.length,
  //         "instructors"
  //       );
  //     } catch (err) {
  //       console.error("Error loading schedule:", err);
  //       setError("Failed to load schedule: " + err.message);
  //     } finally {
  //       setLoadingSchedule(false);
  //     }
  //   };

  //   loadSchedule();
  // }, [scheduleId, isLoading, courseData]);

  // Recalculate semester + total CCH for all instructors
  const recalcAllInstructorCCH = useCallback((currentAssignments) => {
    setNewScheduleDraft((prev) => {
      const updated = prev.addedInstructors.map((inst) => {
        const newInst = { ...inst };
        let totalSeconds = 0;

        for (const sem of ["winter", "springSummer", "fall"]) {
          const weeklySum = Object.values(currentAssignments)
            .filter(
              (a) =>
                a.instructor_id === inst.instructor_id && a.semester === sem
            )
            .reduce((sum, a) => sum + (a.weekly_hours ?? 0), 0);

          const semesterHours = weeklySum * 15; // 15 weeks per semester
          const semesterKey =
            sem === "winter"
              ? "winter_cch"
              : sem === "springSummer"
              ? "spring_summer_cch"
              : "fall_cch";

          newInst[semesterKey] = addHoursToCCH("00:00:00", semesterHours);

          // accumulate total seconds
          const [h, m, s] = newInst[semesterKey].split(":").map(Number);
          totalSeconds += h * 3600 + m * 60 + s;
        }

        const newH = Math.floor(totalSeconds / 3600);
        const newM = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
          2,
          "0"
        );
        const newS = String(totalSeconds % 60).padStart(2, "0");
        newInst.total_cch = `${newH}:${newM}:${newS}`;

        return newInst;
      });

      return { ...prev, addedInstructors: updated };
    });
  });

  // sumHours now takes assignments as argument to allow recalculation
  const sumHours = (instructorId, semester, currentAssignments) => {
    let sum = 0;
    const iId = String(instructorId);
    for (const [key, value] of Object.entries(currentAssignments || {})) {
      if (!value) continue;
      const [iid] = key.split("-");
      if (iid !== iId) continue;
      if (semester) {
        const sem = value.semester || semester;
        if (sem !== semester) continue;
      }
      sum += value.weekly_hours || 0;
    }
    return sum;
  };

  // Convert HH:MM:SS and hour-delta into new HH:MM:SS
  function addHoursToCCH(cchString, deltaHours) {
    const [h, m, s] = (cchString || "00:00:00")
      .split(":")
      .map((v) => Number(v) || 0);

    const currentSeconds = h * 3600 + m * 60 + s;
    const deltaSeconds = Number(deltaHours) * 3600;
    const newSeconds = Math.max(0, currentSeconds + deltaSeconds);

    const newH = String(Math.floor(newSeconds / 3600));
    const newM = String(Math.floor((newSeconds % 3600) / 60)).padStart(2, "0");
    const newS = String(newSeconds % 60).padStart(2, "0");

    return `${newH}:${newM}:${newS}`;
  }

  const adjustInstructorCCH = (instructorId, semester) => {
    // Compute total weekly hours for this instructor & semester
    const weeklyHours = sumHours(instructorId, semester);

    // Convert to semester hours
    const semesterHours = weeklyHours * 15;

    setNewScheduleDraft((prev) => {
      const updated = prev.addedInstructors.map((inst) => {
        if (inst.instructor_id !== instructorId) return inst;

        const semesterKey =
          semester === "winter"
            ? "winter_cch"
            : semester === "springSummer"
            ? "spring_summer_cch"
            : "fall_cch";

        return {
          ...inst,
          total_cch: addHoursToCCH(inst.total_cch, semesterHours),
          [semesterKey]: addHoursToCCH(inst[semesterKey], semesterHours),
        };
      });

      return { ...prev, addedInstructors: updated };
    });
  };

  useEffect(() => {
    if (!scheduleId) return;

    const loadAssignments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/assignments`
        );
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.error || "Failed to load assignments");

        const mapped = {};
        json.assignments.forEach((a) => {
          const scid = a.scheduled_course_id || a.course_id;
          const key = `${a.instructor_id}-${scid}-${a.section_letter}`;
          mapped[key] = {
            ...a,
            weekly_hours: Number(
              a.weekly_hours_required ||
                Number(a.class_hrs ?? 0) + Number(a.online_hrs ?? 0)
            ),
            class_hrs: Number(a.class_hrs ?? 0),
            online_hrs: Number(a.online_hrs ?? 0),
          };
        });

        setAssignments(mapped);

        // Recalculate CCH totals for all instructors
        recalcAllInstructorCCH(mapped);
      } catch (err) {
        console.error("Failed to load assignments:", err);
      }
    };

    loadAssignments();
  }, [scheduleId]);

  const handleAutoAssign = async (scheduleId) => {
    if (!scheduleId) {
      console.error("Missing scheduleId");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/auto_assign`,
        { method: "POST" }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to auto-assign");
      }

      const data = await res.json();
      console.log("Auto-assign success:", data);
    } catch (err) {
      console.error("Auto-assign error:", err);
    }
  };

  // Handler to update num_sections for a course in a semester
  const handleUpdateCourseSections = (courseId, semester, newCount) => {
    setScheduleCoursesBySemester((prev) => ({
      ...prev,
      [semester]: prev[semester].map((c) =>
        c.course_id === courseId
          ? {
              ...c,
              num_sections: newCount,
              sections: c.sections.slice(0, newCount),
            }
          : c
      ),
    }));
  };
  // const handleUpdateCourseSections = (course_id, semester, newCount) => {
  //   if (isScheduleSubmitted) return; // prevent edits if submitted

  //   setNewScheduleDraft((prev) => {
  //     const currentCourses = prev.addedCoursesBySemester[semester] || [];
  //     const updatedCourses = currentCourses.map((c) =>
  //       c.course_id === course_id ? { ...c, num_sections: newCount } : c
  //     );

  //     return {
  //       ...prev,
  //       addedCoursesBySemester: {
  //         ...prev.addedCoursesBySemester,
  //         [semester]: updatedCourses,
  //       },
  //     };
  //   });

  //   // Update courseSections per term
  //   setCourseSections((prev) => ({
  //     ...prev,
  //     [semester]: {
  //       ...(prev[semester] || {}),
  //       [course_id]: newCount,
  //     },
  //   }));
  // };

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
    setScheduleCoursesBySemester((prev) => ({
      ...prev,
      [semester]: [...prev[semester], { ...course, sections: [] }],
    }));
  };

  // const handleAddCourseToSemester = (semester, course) => {
  //   if (isScheduleSubmitted) return;
  //   setNewScheduleDraft((prevDraft) => {
  //     const current = prevDraft.addedCoursesBySemester[semester] || [];
  //     if (current.some((c) => c.course_id === course.course_id))
  //       return prevDraft;
  //     return {
  //       ...prevDraft,
  //       addedCoursesBySemester: {
  //         ...prevDraft.addedCoursesBySemester,
  //         [semester]: [...current, course],
  //       },
  //     };
  //   });
  // };

  // Remove course from semester
  const handleRemoveCourseFromSemester = (semester, course) => {
    setScheduleCoursesBySemester((prev) => ({
      ...prev,
      [semester]: prev[semester].filter(
        (c) => c.course_id !== course.course_id
      ),
    }));
  };

  // const handleRemoveCourseFromSemester = (semester, course) => {
  //   if (isScheduleSubmitted) return;
  //   setNewScheduleDraft((prevDraft) => ({
  //     ...prevDraft,
  //     addedCoursesBySemester: {
  //       ...prevDraft.addedCoursesBySemester,
  //       [semester]: prevDraft.addedCoursesBySemester[semester].filter(
  //         (c) => c.course_id !== course.course_id
  //       ),
  //     },
  //   }));
  // };

  // toggleSection
  const toggleSectionAssignment = async (
    instructorId,
    course,
    sectionLetter,
    semester
  ) => {
    if (isScheduleSubmitted) return;

    const scid =
      typeof course.scheduled_course_id === "function"
        ? course.scheduled_course_id()
        : course.scheduled_course_id || course.course_id;

    const key = `${instructorId}-${scid}-${sectionLetter}`;
    const existing = assignedSections[key];

    // Optimistic UI: flip assignment locally
    setAssignedSections((prev) => {
      const updated = { ...prev };
      if (existing) {
        delete updated[key]; // unassign
      } else {
        updated[key] = true; // assign
      }
      return updated;
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/sections/toggle-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructor_id: Number(instructorId),
            scheduled_course_id: String(scid),
            section_letter: String(sectionLetter),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle instructor");
      }

      // Backend returns the new instructor_id or null
      const newInstructorId = data.instructor_id;

      setAssignedSections((prev) => {
        const updated = { ...prev };

        if (newInstructorId === instructorId) {
          // Assigned
          updated[key] = true;
        } else {
          // Unassigned
          delete updated[key];
        }

        return updated;
      });

      console.log("Assignment toggled successfully:", { key, assigned: newInstructorId === instructorId });
    } catch (err) {
      console.error("Failed to toggle section assignment:", err);

      // rollback optimistic update
      setAssignedSections((prev) => {
        const updated = { ...prev };

        if (existing) {
          updated[key] = true; // restore original
        } else {
          delete updated[key];
        }

        return updated;
      });
    }
  };

  // const toggleSectionAssignment = async (
  //   instructorId,
  //   course,
  //   sectionLetter,
  //   semester,
  //   mode
  // ) => {
  //   if (isScheduleSubmitted) return;

  //   const scid =
  //     typeof course.scheduled_course_id === "function"
  //       ? course.scheduled_course_id()
  //       : course.scheduled_course_id || course.course_id;
  //   const key = `${instructorId}-${scid}-${sectionLetter}`;
  //   const existing = assignments[key];

  //   // Compute real hours
  //   const courseInfo =
  //     newScheduleDraft.addedCoursesBySemester[semester]?.find(
  //       (c) => c.course_id === course.course_id
  //     ) || course;

  //   const realClassHrs = Number(courseInfo.class_hrs ?? 0);
  //   const realOnlineHrs = Number(courseInfo.online_hrs ?? 0);

  //   const classHrs = mode === "class" || mode === "both" ? realClassHrs : 0;
  //   const onlineHrs = mode === "online" || mode === "both" ? realOnlineHrs : 0;
  //   const weekly_hours = classHrs + onlineHrs;

  //   // Optimistically update the local assignments
  //   setAssignments((prev) => {
  //     const newAssignments = { ...prev };

  //     if (existing && existing.delivery_mode === mode) {
  //       // Remove locally
  //       delete newAssignments[key];
  //     } else {
  //       // Add locally
  //       newAssignments[key] = {
  //         instructor_id: instructorId,
  //         scheduled_course_id: scid,
  //         section_letter: sectionLetter,
  //         delivery_mode: mode,
  //         weekly_hours,
  //         class_hrs: classHrs,
  //         online_hrs: onlineHrs,
  //         semester,
  //       };
  //     }

  //     // Recalculate CCH
  //     recalcAllInstructorCCH(newAssignments);
  //     return newAssignments;
  //   });

  //   const payload = {
  //     action: existing && existing.delivery_mode === mode ? "remove" : "add",
  //     instructor_id: Number(instructorId),
  //     scheduled_course_id: String(scid),
  //     section_letter: String(sectionLetter),
  //     delivery_mode: String(mode),
  //     semester: String(semester),
  //     weekly_hours: Number(weekly_hours),
  //     class_hrs: Number(classHrs),
  //     online_hrs: Number(onlineHrs),
  //   };

  //   console.log("Payload for toggleSection:", payload);
  //   console.log("Types of each field:", {
  //     action: typeof payload.action,
  //     instructor_id: typeof payload.instructor_id,
  //     scheduled_course_id: typeof payload.scheduled_course_id,
  //     section_letter: typeof payload.section_letter,
  //     delivery_mode: typeof payload.delivery_mode,
  //     semester: typeof payload.semester,
  //     weekly_hours: typeof payload.weekly_hours,
  //     class_hrs: typeof payload.class_hrs,
  //     online_hrs: typeof payload.online_hrs,
  //   });

  //   // Call backend to persist the change
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/assignments/toggle`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           action:
  //             existing && existing.delivery_mode === mode ? "remove" : "add",
  //           instructor_id: Number(instructorId),
  //           scheduled_course_id: String(scid),
  //           section_letter: String(sectionLetter),
  //           delivery_mode: String(mode),
  //           semester: String(semester),
  //           weekly_hours: Number(weekly_hours),
  //           class_hrs: Number(classHrs),
  //           online_hrs: Number(onlineHrs),
  //         }),
  //       }
  //     );

  //     const data = await response.json();
  //     if (!response.ok)
  //       throw new Error(data.error || "Failed to update assignment");
  //   } catch (err) {
  //     console.error("Failed to save assignment:", err);
  //     // Optionally, revert local state on failure
  //     setAssignments((prev) => ({ ...prev, [key]: existing }));
  //   }
  // };

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

    try {
      // Prepare updated courses with the current section counts
      const updatedAddedCoursesBySemester = {};
      for (const [semester, courses] of Object.entries(
        newScheduleDraft.addedCoursesBySemester
      )) {
        updatedAddedCoursesBySemester[semester] = courses.map((course) => ({
          ...course,
          num_sections:
            courseSections[semester]?.[course.course_id] ??
            course.num_sections ??
            1,
        }));
      }
      const payload = {
        academic_year: newScheduleDraft.metaData.year,
        academic_chair_id: scheduleAcademicChairId,
        addedCoursesBySemester: updatedAddedCoursesBySemester || {},
        addedInstructors: newScheduleDraft.addedInstructors || [],
        assignments: assignments || {}, // Include the assignments object
      };

      if (scheduleId) payload.schedule_id = scheduleId;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to save schedule");

      setSaveStatus({
        type: "success",
        message: `Schedule saved successfully!`,
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

      // enrich each scheduled course with class_hrs and online_hrs from the courses table
      const enrichedCourses = courses.map((sc) => {
        const courseData = courses.find((c) => c.course_id === sc.course_id); //full courses list

        return {
          ...sc,
          class_hrs: courseData?.class_hrs || 0,
          online_hrs: courseData?.online_hrs || 0,
        };
      });

      filtered[semester] = enrichedCourses.filter((course) => {
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
        newScheduleDraft.metaData.activeSemesters || {};
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
    (sem) => newScheduleDraft.metaData.activeSemesters?.[sem] ?? true
  );

  const topScrollerRef = useRef(null);
  const bottomScrollerRef = useRef(null);
  const handleTopScroll = (e) => {
    if (bottomScrollerRef.current)
      bottomScrollerRef.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  console.log("INSTRUCTORS PROP:", instructors);

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
          <div className="flex justify-center items-center">
            <button
              className={`px-4 py-2 text-white font-medium rounded-lg shadow transition ${
                isAutoAssigning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => handleAutoAssign(scheduleId)}
              disabled={isAutoAssigning}
            >
              {isAutoAssigning ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Assigning...</span>
                </div>
              ) : (
                "Auto-Assign Instructors"
              )}
            </button>
          </div>
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
                      key={semester}
                      semester={semester}
                      courses={scheduleCoursesBySemester[semester]}
                      addedCourses={scheduleCoursesBySemester[semester]}
                      onAddCourse={handleAddCourseToSemester}
                      onRemoveCourse={handleRemoveCourseFromSemester}
                      onUpdateCourseSections={handleUpdateCourseSections}
                      onToggleSection={handleToggleSection}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-start-1 row-start-2">
            <InstructorSection
              instructors={instructors.instructors ?? []}
              onAddInstructor={handleAddScheduledInstructor}
              onRemoveInstructor={handleRemoveScheduledInstructor}
              addedInstructors={addedScheduledInstructors}
              assignments={assignments}
              addedCoursesBySemester={scheduleCoursesBySemester}
              onRowResize={handleRowResize}
              onHeaderResize={handleHeaderResize}
            />
          </div>

          <div className="col-start-2 row-start-2 min-w-0">
            <div ref={bottomScrollerRef} className="overflow-x-hidden w-full">
              {!isLoading && !loadingSchedule && (
                <AssignmentGrid
                  courseSectionsMap={courseSectionsMap}
                  addedInstructors={addedScheduledInstructors}
                  addedCoursesBySemester={scheduleCoursesBySemester}
                  onToggleSectionAssignment={toggleSectionAssignment}
                  assignedSections={assignedSections}
                  activeSemesters={newScheduleDraft.metaData.activeSemesters}
                  rowHeights={rowHeights}
                  headerHeight={headerHeight}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
