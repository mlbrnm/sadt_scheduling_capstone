"use client";
export default function DropDownMenus() {
  return (
    <div>
      {/* Selection boxes*/}
      <div className="flex justify-between mt-4">
        {/* Academic Year Selection Box */}
        <div className="flex flex-col px-10">
          <label htmlFor="academicYear">Academic Year</label>
          <select id="academicYear" className="bg-gray-100 mt-2 rounded-sm p-1">
            <option>2025-2026</option>
            <option>2026-2027</option>
          </select>
        </div>
        {/* Semester Selection Box */}
        <div className="flex flex-col px-10">
          <label htmlFor="semester">Semester</label>
          <select id="semester" className="bg-gray-100 mt-2 rounded-sm p-1">
            <option>Fall</option>
            <option>Winter</option>
            <option>Spring</option>
            <option>Summer</option>
          </select>
        </div>
        {/*Program Selection Box*/}
        <div className="flex flex-col px-10">
          <label htmlFor="program">Program</label>
          <select id="program" className="bg-gray-100 mt-2 rounded-sm p-1">
            <option>Software Development</option>
            <option>Information Technology</option>
            <option>Cyber Security</option>
            <option>Data Science and Artificial Intelligence</option>
            <option>Graphic and Digital Media</option>
          </select>
        </div>
      </div>
    </div>
  );
}
