// Utility function to determine color based on total hours utilization
export function getUtilizationColor(instructor) {
  const yearlyMax = instructor.Contract_Type === "Casual" ? 800 : 615;
  const utilization = (instructor.Total_Hours / yearlyMax) * 100;

  if (utilization >= 100) return "bg-red-300 rounded-sm p-2";
  if (utilization > 60) return "bg-yellow-300 rounded-sm p-2";
  return "bg-green-300 rounded-sm p-2";
}
