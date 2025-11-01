// Helper to convert HH:MM to minutes
export const convertToMinutes = (time) => {
  if (!time || typeof time !== "string") return null;
  const [hours, minutes] = time.split(":").map((number) => Number(number));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

// Calculate hours per delivery based on start/end time
export const getHoursPerDelivery = (draft) => {
  const startMinutes = convertToMinutes(draft.start_time);
  const endMinutes = convertToMinutes(draft.end_time);
  if (startMinutes != null && endMinutes != null && endMinutes > startMinutes) {
    return (endMinutes - startMinutes) / 60;
  }
  return Number(draft.hours_class) || 0; // fallback to original hours_class if time is invalid
};

// Helper to calculate how many days are selected
export const countSelectedDays = (days) => {
  const dayKeys = ["m", "t", "w", "th", "f", "s"];
  return dayKeys.reduce((count, key) => count + (days[key] ? 1 : 0), 0);
};

// Helper to calculate total hours for a draft
export const calculateTotalHours = (draft) => {
  const hoursPerDelivery = getHoursPerDelivery(draft);
  const numOfSelectedDays = countSelectedDays(draft.days);
  const weeks = Number(draft.weeks) || 15;
  return hoursPerDelivery * numOfSelectedDays * weeks;
};
