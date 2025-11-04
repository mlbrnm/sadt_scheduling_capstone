// Utility function to determine color based on total hours utilization
export function getUtilizationColor(instructor) {
  const yearlyMax = instructor.contract_type === "Casual" ? 800 : 615;
  const utilization = (instructor.total_hours / yearlyMax) * 100;

  if (utilization >= 100) return "bg-red-300 rounded-sm p-2";
  if (utilization > 60) return "bg-yellow-300 rounded-sm p-2";
  return "bg-green-300 rounded-sm p-2";
}
