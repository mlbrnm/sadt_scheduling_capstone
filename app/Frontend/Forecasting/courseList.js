export default function CourseList({ program }) {
  const coursesByProgram = {
    "Software Development": {
      "Semester 1": [
        "COMM 238 | Technical Communcations 1",
        "CPNT 217 | Introduction to Network Systems",
        "CPRG 213 | Web Development 1",
        "CPRG 216 | Object-Oriented Programming 1",
        "MATH 237 | Mathematics for Technologists",
      ],
      "Semester 2": [
        "CPRG 211 | Object-Oriented Programming 2",
        "CPRG 250 | Database Design and Programming",
        "CPSY 200 | Software Analysis and Design",
        "CPSY 202 | User Experience and Design",
        "PHIL 241 | Critical Thinking",
      ],
      "Semester 3": [
        "CPRG 303 | Mobile Application Development",
        "CPRG 304 | Object-Oriented Programming 3",
        "CPRG 306 | Web Development 2",
        "CPRG 307 | Database Programming",
        "CPSY 301 | Software Projects: Analysis, Design, and Management",
      ],
      "Semester 4": [
        "CPRG 305 | Software Testing and Deployment",
        "CPSY 300 | Cloud Computing for Software Developers",
        "INTP 302 | Emerging Trends in Software Development",
        "ITSC 320 | Software Security",
        "PROJ 309 | Capstone Project",
      ],
    },
  };

  {
    /*semesters is an object that holds the semester and course info for the program*/
  }
  const semesters = coursesByProgram[program] || {};

  return (
    <div className="flex justify-between">
      {/* Loop through the semesters */}
      {Object.entries(semesters).map(([semesterName, courses]) => (
        <div className="bg-gray-200 mb-2 p-3 rounded-lg" key={semesterName}>
          <h3 className="flex justify-center font-bold text-xl">
            {semesterName}
          </h3>
          <h3 className="m-2">Courses:</h3>
          <ul className="">
            {courses.map((course) => (
              <li key={course} className="bg-gray-50 mb-2 rounded p-2">
                {course}
              </li>
            ))}
          </ul>
          <h3>Projected Enrollment:</h3>
        </div>
      ))}
    </div>
  );
}
