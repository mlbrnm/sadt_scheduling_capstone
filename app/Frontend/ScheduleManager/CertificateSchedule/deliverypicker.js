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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-800"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Select Delivery to Edit</h2>
          <button
            className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2 cursor-pointer"
            aria-label="Close modal"
            onClick={() => onClose()}
          >
            &times;
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y">
          {certificatesData.map((r) => (
            <div
              key={r.deliveryId}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectDelivery(r.deliveryId)}
            >
              <div className="text-sm">
                <div className="font-medium">
                  {r.course_code} – {r.course_name} ({r.course_section})
                </div>
                <div className="text-gray-600">
                  {r.start_date} {r.start_time} → {r.end_date} {r.end_time} •{" "}
                  {daysToString(r) || "—"} • Room: {r.room_requirements}
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
