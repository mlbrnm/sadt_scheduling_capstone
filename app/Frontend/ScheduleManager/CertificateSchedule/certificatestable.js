// removed Term, ID Record, Program, Program Type, Course Code (replaced with Course Section), Status Section columns
const certificateHeaders = [
  "Course Section",
  "Course Name",
  "Section",
  "Delivery Mode",
  "Start Date",
  "End Date",
  "Start Time",
  "End Time",
  "Hours Class",
  "M",
  "T",
  "W",
  "Th",
  "F",
  "S",
  "Weeks",
  "Contact Hours",
  "Total Hours",
  "Room Requirements",
  "Exam Booking",
  "Total Hours Course",
  "Semester Code",
];

export default function CertificatesTable({ certificatesData }) {
  return (
    <div className="bg-white rounded-lg overflow-auto max-h-150">
      <table className="min-w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {certificateHeaders.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-black">
          {certificatesData.map((certificate, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-sm">
                {certificate.course_section}
              </td>
              <td className="px-4 py-2 text-sm">{certificate.course_name}</td>
              <td className="px-4 py-2 text-sm">{certificate.section}</td>
              <td className="px-4 py-2 text-sm">{certificate.delivery_mode}</td>
              <td className="px-4 py-2 text-sm">{certificate.start_date}</td>
              <td className="px-4 py-2 text-sm">{certificate.end_date}</td>
              <td className="px-4 py-2 text-sm">{certificate.start_time}</td>
              <td className="px-4 py-2 text-sm">{certificate.end_time}</td>
              <td className="px-4 py-2 text-sm">{certificate.hours_class}</td>
              <td className="px-4 py-2 text-sm font-semibold border-x">
                {certificate.m}
              </td>
              <td className="px-4 py-2 text-sm font-semibold border-x">
                {certificate.t}
              </td>
              <td className="px-4 py-2 text-sm font-semibold border-x">
                {certificate.w}
              </td>
              <td className="px-4 py-2 text-sm font-semibold border-x">
                {certificate.th}
              </td>
              <td className="px-4 py-2 text-sm font-semibold border-x">
                {certificate.f}
              </td>
              <td className="px-4 py-2 text-sm font-semibold border-x">
                {certificate.s}
              </td>
              <td className="px-4 py-2 text-sm">{certificate.weeks}</td>
              <td className="px-4 py-2 text-sm">{certificate.contact_hours}</td>
              <td className="px-4 py-2 text-sm">{certificate.total_hours}</td>
              <td className="px-4 py-2 text-sm">
                {certificate.room_requirements}
              </td>
              <td className="px-4 py-2 text-sm">{certificate.exam_booking}</td>
              <td className="px-4 py-2 text-sm">
                {certificate.total_hrs_course}
              </td>
              <td className="px-4 py-2 text-sm">{certificate.semester_code}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {certificatesData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No certificates found!
        </div>
      )}
    </div>
  );
}
