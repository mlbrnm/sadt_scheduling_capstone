export default function DropDownMenus({
  academicYear,
  setAcademicYear,
  semester,
  setSemester,
  program,
  setProgram,
}) {
  return (
    <div>
      {/* Selection boxes*/}
      <div className="flex justify-between mt-4">
        {/* Academic Year Selection Box */}
        <div className="flex flex-col px-10">
          <label htmlFor="academicYear">Academic Year</label>
          <select
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-gray-100 mt-2 rounded-sm p-1"
          >
            <option value="">Select year</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>
        {/* Semester Selection Box */}
        <div className="flex flex-col px-10">
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="bg-gray-100 mt-2 rounded-sm p-1"
          >
            <option value="">Select semester</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
        {/*Program Selection Box*/}
        <div className="flex flex-col px-10">
          <label htmlFor="program">Program</label>
          <select
            id="program"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="bg-gray-100 mt-2 rounded-sm p-1"
          >
            <option value="">Select program</option>
            <option value="Software Development">Software Development</option>
            <option value="Information Technology">
              Information Technology
            </option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Data Science and Artificial Intelligence">
              Data Science and Artificial Intelligence
            </option>
            <option value="Graphic Design">Graphic and Digital Media</option>
          </select>
        </div>
      </div>
    </div>
  );
}
