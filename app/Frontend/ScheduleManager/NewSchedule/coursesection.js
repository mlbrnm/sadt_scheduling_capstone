"use client";
import { useState } from "react";

const sectionLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export default function CourseSection({
  semester,
  courses = [],
  addedCourses = [],
  onAddCourse,
  onRemoveCourse,
  onToggleSection,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ----------------------
      Filtering Modal List
  ---------------------- */
  const filteredCourses = courses.filter((course) => {
    const existsAlready = addedCourses.some(
      (c) => c.course_id === course.course_id
    );

    const matches =
      course.course?.course_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course.course?.course_code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return !existsAlready && matches;
  });

  /* ----------------------
      Add Course Click
  ---------------------- */
  const handleAdd = (course) => {
    onAddCourse(course, semester);
    setIsModalOpen(false);
  };

  /* ----------------------
      Remove Course Click
  ---------------------- */
  const handleRemove = (course) => {
    const ok = window.confirm(
      `Remove ${course.course?.course_code} - ${course.course?.course_name}?`
    );
    if (ok) onRemoveCourse(course, semester);
  };

  /* ----------------------
      Main UI
  ---------------------- */
  return (
    <div>
      <div className="bg-gray-50 w-full">
        <ul className="flex flex-nowrap">
          {/* Existing Added Courses */}
          {addedCourses.map((course) => (
            <li
              key={course.scheduled_course_id}
              onClick={() => handleRemove(course)}
              className="p-2 text-sm cursor-pointer flex flex-col justify-between items-center group border border-gray-300 w-40 h-44 shrink-0 text-center hover:bg-red-100"
              title={`Remove ${course.course?.course_code}`}
            >
              {/* Code & Name */}
              <span className="font-bold text-sm">
                {course.course?.course_code}
              </span>
              <span className="text-xs px-1">{course.course?.course_name}</span>
              {/* Sections */}
              <div className="flex flex-col items-center mt-2">
                <span className="font-semibold text-xs">Sections</span>

                <div className="flex items-center gap-2 mt-1">
                  {/* Decrement */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const count = course.sections?.length || 0;
                      if (count > 0) {
                        const letters = [
                          "A",
                          "B",
                          "C",
                          "D",
                          "E",
                          "F",
                          "G",
                          "H",
                          "I",
                        ];
                        const removeLetter = letters[count - 1]; // last section
                        onToggleSection(
                          course.scheduled_course_id,
                          removeLetter
                        );
                      }
                    }}
                    className="px-2 py-1 text-sm border rounded bg-gray-200 hover:bg-gray-300"
                  >
                    −
                  </button>

                  {/* Count */}
                  <span className="w-6 text-center font-bold text-sm">
                    {course.sections?.length || 0}
                  </span>

                  {/* Increment */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const count = course.sections?.length || 0;
                      const letters = [
                        "A",
                        "B",
                        "C",
                        "D",
                        "E",
                        "F",
                        "G",
                        "H",
                        "I",
                      ];

                      if (count < letters.length) {
                        const addLetter = letters[count]; // next section
                        onToggleSection(course.scheduled_course_id, addLetter);
                      }
                    }}
                    className="px-2 py-1 text-sm border rounded bg-gray-200 hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>{" "}
            </li>
          ))}

          {/* Add Course */}
          <li
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-sm cursor-pointer flex flex-col justify-center items-center border border-dashed border-gray-400 w-40 h-44 shrink-0 text-center hover:bg-green-100"
          >
            <span className="text-xl font-bold">+</span>
            <span className="text-xs font-semibold">Add Course</span>
            <span className="text-xs">
              {semester === "springSummer"
                ? "Spring/Summer"
                : semester[0].toUpperCase() + semester.slice(1)}
            </span>
          </li>
        </ul>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />

          <div
            className="relative bg-white p-4 rounded-md w-3/4 max-h-3/4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex justify-end">
              <button
                className="text-gray-600 hover:text-gray-800 text-xl px-2"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="flex justify-center my-3">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 bg-gray-100 rounded-lg w-64 focus:outline-none focus:ring"
              />
            </div>

            {/* Table */}
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 border">Course ID</th>
                  <th className="px-2 py-1 border">Name</th>
                  <th className="px-2 py-1 border">Program</th>
                  <th className="px-2 py-1 border">Contact Hrs</th>
                  <th className="px-2 py-1 border">Delivery</th>
                  <th className="px-2 py-1 border">Online</th>
                  <th className="px-2 py-1 border">Class</th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => (
                  <tr
                    key={course.course_id}
                    onClick={() => handleAdd(course)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-2 py-1 border">{course.course_id}</td>
                    <td className="px-2 py-1 border">
                      {course.course?.course_name}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.program_major}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.contact_hours || 0}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.delivery_method}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.online_hrs || 0}
                    </td>
                    <td className="px-2 py-1 border">
                      {course.course?.class_hrs || 0}
                    </td>
                  </tr>
                ))}

                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No matching courses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";
// import { useState } from "react";

// const courseListHeaders = [
//   "Course ID",
//   "Course Name",
//   "Program",
//   "Contact Hours",
//   "Delivery",
//   "Online",
//   "Class",
//   "Sections",
// ];

// export default function CourseSection({
//   semester,
//   courses,
//   onAddCourse,
//   onRemoveCourse,
//   addedCourses,
//   onUpdateCourseSections,
//   onAssignInstructor,
// }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const handleAddCourse = (course) => {
//     onAddCourse(course, semester);
//     setIsModalOpen(false);
//   };

//   const handleRemoveCourse = (course) => {
//     const confirmRemove = window.confirm(
//       `Are you sure you want to remove ${course.course?.course_name || ""}?`
//     );
//     if (confirmRemove) {
//       onRemoveCourse(course, semester);
//     }
//   };

//   const filteredCourses = courses.filter((course) => {
//     const isAlreadyAdded = addedCourses.some(
//       (c) => c.course_id === course.course_id
//     );
//     const matchesName = (course.course?.course_name || "")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesCode = (course.course?.course_code || "")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     return (matchesName || matchesCode) && !isAlreadyAdded;
//   });

//   const coursesWithAdd = [
//     ...addedCourses,
//     { __isAdd: true, course_id: `__add-${semester}` },
//   ];

//   return (
//     <div>
//       <div className="bg-gray-50 w-full">
//         <ul className="flex flex-nowrap">
//           {coursesWithAdd.map((course) => (
//             <li
//               key={course.course_id}
//               onClick={() => {
//                 if (course.__isAdd) {
//                   setIsModalOpen(true);
//                   return;
//                 }
//                 handleRemoveCourse(course);
//               }}
//               className={`p-2 text-sm cursor-pointer flex flex-col justify-between items-center group border border-gray-300 w-36 h-36 shrink-0 text-center
//                 ${
//                   course.__isAdd
//                     ? "border-dashed hover:bg-green-100"
//                     : "hover:bg-red-100"
//                 }`}
//               title={
//                 course.__isAdd
//                   ? "Add Course"
//                   : `Click to remove ${course.course?.course_code || ""} - ${
//                       course.course?.course_name || ""
//                     }`
//               }
//             >
//               {course.__isAdd ? (
//                 <>
//                   <span className="text-xl font-bold">+</span>
//                   <span className="text-xs font-semibold">Add Course</span>
//                   <span className="text-xs">
//                     {semester === "springSummer"
//                       ? "Spring/Summer"
//                       : semester[0].toUpperCase() + semester.slice(1)}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span className="font-semibold">
//                     {course.course?.course_code}
//                   </span>
//                   <span>{course.course?.course_name}</span>
//                   {/* <span>{course.course?.delivery_method}</span>
//                   <span>{`Online: ${course.course?.online_hrs || 0}hrs`}</span>
//                   <span>{`Class: ${course.course?.class_hrs || 0}hrs`}</span> */}

//                   {/* Section Controls */}
//                   <div className="flex flex-col items-center mt-1 gap-1">
//                     {/* {course.sections?.map((sec) => (
//                       <div
//                         key={sec.id}
//                         className="flex flex-col items-center border px-1 py-1 rounded w-full bg-gray-100"
//                       >
//                         <span>Section {sec.section_letter}</span>
//                         <span className="text-xs">
//                           Instructors:{" "}
//                           {sec.assigned_instructors
//                             ?.map((i) => i.instructor_id)
//                             .join(", ") || "None"}
//                         </span>
//                       </div>
//                     ))} */}

//                     <div className="flex items-center gap-2 mt-1">
//                       Sections: {course.num_sections}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onUpdateCourseSections(
//                             course.course_id,
//                             semester,
//                             course.num_sections + 1
//                           );
//                         }}
//                         className="px-1 bg-gray-200 rounded hover:bg-gray-300"
//                       >
//                         +
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (course.num_sections > 1) {
//                             onUpdateCourseSections(
//                               course.course_id,
//                               semester,
//                               course.num_sections - 1
//                             );
//                           }
//                         }}
//                         className="px-1 bg-gray-200 rounded hover:bg-gray-300"
//                       >
//                         –
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Modal for adding courses */}
//       {isModalOpen && (
//         <div
//           className="fixed inset-0 flex items-center justify-center z-50"
//           onClick={() => setIsModalOpen(false)}
//         >
//           <div className="absolute inset-0 bg-gray-800 opacity-50" />
//           <div
//             className="relative bg-gray-100 p-4 rounded-md w-3/4 max-h-3/4 overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-end">
//               <button
//                 className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
//                 aria-label="Close modal"
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="flex justify-center my-2">
//               <input
//                 type="text"
//                 placeholder="Search courses by name or course code..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="px-3 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-xs"
//               />
//             </div>

//             <div className="max-h-80 overflow-y-auto">
//               <table className="min-w-full border border-gray-300">
//                 <thead className="bg-gray-50 sticky top-0">
//                   <tr className="bg-gray-200">
//                     {courseListHeaders.map((header) => (
//                       <th
//                         key={header}
//                         className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-300"
//                       >
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y">
//                   {filteredCourses.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={courseListHeaders.length}
//                         className="px-6 py-4 text-sm text-center"
//                       >
//                         {searchTerm
//                           ? "No courses match your search."
//                           : "All available courses have been added."}
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredCourses.map((course) => (
//                       <tr
//                         key={course.course_id}
//                         onClick={() => handleAddCourse(course)}
//                         className="cursor-pointer hover:bg-gray-100"
//                       >
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course_id}
//                         </td>
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course?.course_name}
//                         </td>
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course?.program_major}
//                         </td>
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course?.contact_hours || 0} h
//                         </td>
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course?.delivery_method}
//                         </td>
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course?.online_hrs || 0} h
//                         </td>
//                         <td className="px-3 py-2 text-sm border-b border-gray-300">
//                           {course.course?.class_hrs || 0} h
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
