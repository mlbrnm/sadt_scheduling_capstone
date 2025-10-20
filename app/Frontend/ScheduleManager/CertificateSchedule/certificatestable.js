const certificateHeaders = [
  "Term",
  "ID Record",
  "Program",
  "Program Type",
  "Course Code",
  "Course Name",
  "Section",
  "Status Section",
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
  "Course Section",
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
                className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-black">
          {certificatesData.map((certificate, index) => (
            <tr key={certificate.deliverId}>
              <td className="px-6 py-2 text-sm">{certificate.term}</td>
              <td className="px-6 py-2 text-sm">{certificate.id_record}</td>
              <td className="px-6 py-2 text-sm">{certificate.program}</td>
              <td className="px-6 py-2 text-sm">{certificate.program_type}</td>
              <td className="px-6 py-2 text-sm">{certificate.course_code}</td>
              <td className="px-6 py-2 text-sm">{certificate.course_name}</td>
              <td className="px-6 py-2 text-sm">{certificate.section}</td>
              <td className="px-6 py-2 text-sm">
                {certificate.status_section}
              </td>
              <td className="px-6 py-2 text-sm">{certificate.delivery_mode}</td>
              <td className="px-6 py-2 text-sm">{certificate.start_date}</td>
              <td className="px-6 py-2 text-sm">{certificate.end_date}</td>
              <td className="px-6 py-2 text-sm">{certificate.start_time}</td>
              <td className="px-6 py-2 text-sm">{certificate.end_time}</td>
              <td className="px-6 py-2 text-sm">{certificate.hours_class}</td>
              <td className="px-2 py-2 text-sm font-semibold">
                {certificate.m}
              </td>
              <td className="px-6 py-2 text-sm font-semibold">
                {certificate.t}
              </td>
              <td className="px-6 py-2 text-sm font-semibold">
                {certificate.w}
              </td>
              <td className="px-6 py-2 text-sm font-semibold">
                {certificate.th}
              </td>
              <td className="px-6 py-2 text-sm font-semibold">
                {certificate.f}
              </td>
              <td className="px-6 py-2 text-sm font-semibold">
                {certificate.s}
              </td>
              <td className="px-6 py-2 text-sm">{certificate.weeks}</td>
              <td className="px-6 py-2 text-sm">{certificate.contact_hours}</td>
              <td className="px-6 py-2 text-sm">{certificate.total_hours}</td>
              <td className="px-6 py-2 text-sm">
                {certificate.room_requirements}
              </td>
              <td className="px-6 py-2 text-sm">{certificate.exam_booking}</td>
              <td className="px-6 py-2 text-sm">
                {certificate.total_hrs_course}
              </td>
              <td className="px-6 py-2 text-sm">{certificate.semester_code}</td>
              <td className="px-6 py-2 text-sm">
                {certificate.course_section}
              </td>
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
