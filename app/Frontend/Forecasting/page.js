"use client";

import { useState } from "react";
import DropDownMenus from "./dropDownMenus";
import CourseList from "./courseList";

export default function Forecasting() {
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [program, setProgram] = useState("");

  const [showCourses, setShowCourses] = useState(false);

  const handleNext = () => {
    if (program) {
      setShowCourses(true);
    } else {
      alert("Please select a program");
    }
  };

  return (
    <div>
      <div className="flex justify-center items-end">
        <div className="px-10">
          <DropDownMenus
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
            semester={semester}
            setSemester={setSemester}
            program={program}
            setProgram={setProgram}
          />
        </div>
        {/*Next Button*/}
        <div>
          <button
            onClick={handleNext}
            className="bg-red-800 hover:bg-red-700 rounded-sm text-white px-6 py-2"
          >
            Next
          </button>
        </div>
      </div>
      <div className="mx-20 mt-8">
        {showCourses && <CourseList program={program} />}
      </div>
      <div className="flex justify-center mt-50">
        <h1 className="text-xl">
          Select a semester above to create scheduling templates
        </h1>
      </div>
    </div>
  );
}
