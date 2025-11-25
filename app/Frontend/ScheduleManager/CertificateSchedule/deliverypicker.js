export default function DeliveryPicker({
  certificatesData,
  onSelectDelivery,
  onClose,
}) {
  // Helper to convert day flags to days string
  function daysToString(row) {
    const activeDays = [];
    if ((row.m || "").toUpperCase() === "X") activeDays.push("M");
    if ((row.t || "").toUpperCase() === "X") activeDays.push("T");
    if ((row.w || "").toUpperCase() === "X") activeDays.push("W");
    if ((row.th || "").toUpperCase() === "X") activeDays.push("Th");
    if ((row.f || "").toUpperCase() === "X") activeDays.push("F");
    if ((row.s || "").toUpperCase() === "X") activeDays.push("S");
    return activeDays.join(" ");
  }

  const InstructorBadge = ({ row }) => {
    const hasInstructor = !!row.assigned_instructor_id;
    return hasInstructor ? (
      <span
        className="text-sm font-semibold text-gray-800"
        title={row.assigned_instructor_name}
      >
        Instructor: {row.assigned_instructor_name}
      </span>
    ) : (
      <span className="text-sm font-semibold">
        Instructor: <span className="text-red-500">Unassigned</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-800 opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Select A Delivery to Edit</h2>
          <button
            className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
            aria-label="Close modal"
            onClick={() => onClose()}
          >
            &times;
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y">
          {certificatesData.map((certificate) => (
            <div
              key={certificate.deliveryId}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectDelivery(certificate.deliveryId)}
            >
              <div className="text-sm">
                <div className="font-semibold">
                  {certificate.course_code} - {certificate.course_name} (
                  {certificate.course_section})
                </div>
                <div className="text-gray-600">
                  {certificate.start_date} {certificate.start_time} to{" "}
                  {certificate.end_date} {certificate.end_time}
                  {"  "}
                  {daysToString(certificate) || "—"}
                </div>
                <div>
                  <InstructorBadge row={certificate} />
                </div>
              </div>
            </div>
          ))}

          {certificatesData.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No deliveries available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
