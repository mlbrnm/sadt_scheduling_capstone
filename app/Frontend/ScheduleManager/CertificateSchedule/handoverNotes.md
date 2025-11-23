**Made using AI**

# Handover Notes for Backend

## Components

### 1. CertificateSchedule (`page.js`)

- Entry point for **New Schedule**.
- Loads mock data (certificates + instructors).
- Handles user flow: delivery selection → edit → save.
- Computes instructor hour adjustments and updates state.
- Sends final updated deliveries + instructor totals back to parent after Save.
- Expects backend to return updated deliveries + updated instructors after saving.

### 2. EditDelivery (`editdelivery.js`)

- Handles all editing for one or more deliveries.
- Converts weekday flags (`m`, `t`, `w`, etc.) to booleans for UI.
- Validates dates, times, and ordering rules before save.
- Calculates preview instructor total hours using base hours + planned changes.
- On save, converts boolean weekday sections back to "X" or "".

### 3. InstructorPicker (`instructorpicker.js`)

- Lists available instructors for assignment.

### 4. DeliveryPicker (`deliverypicker.js`)

- Modal to select which delivery the user wants to edit

### 5. CertificatesTable (`certificatestable.js`)

- Displays all deliveries with key scheduling fields.
- Shows assigned instructor name or “Unassigned”.
- Only DISPLAYS, doesn't allow selection for editing (Future Feature).

### 6. HoursUtil (`hoursUtil.js`)

- Contains reusable helper functions for time and hours calculations.
- Used by both EditDelivery and CertificateSchedule.
- Backend must match formulas in library.

## Data

### Instructor Object

{
instructor_id: number | string,
instructor_name: string,
instructor_lastName: string,
contract_type: "Permanent" | "Temporary" | "Casual",
total_hours: number, // total assigned across all deliveries
semester_hours: number, // display field
instructor_status: "Active" | "On Leave"
}

### Delivery (Certificate) Object

{
deliveryId: string, // unique stable key for FRONTEND, BACKEND must generate real persistent ID for use
course_code: string,
course_name: string,
course_section: string,
section: string,
delivery_mode: string,
start_date: "MM/DD/YYYY",
end_date: "MM/DD/YYYY",
start_time: "HH:MM", // 24-hour format
end_time: "HH:MM", // 24-hour format
m, t, w, th, f, s: "X" | "", // weekday flags
weeks: number,
assigned_instructor_id: number | null,
assigned_instructor_name: string | null,
assigned_instructor_hours: number // per-delivery snapshot
}

### Backend Integration Notes:

- Replace mockcertificates and mockinstructors
- Persistent Delivery IDs:
  - Frontend currently generates a temporary UUID
  - Backend must replace this with a real database deliveryId
- Change date inputs to <input type="date"> once backend confirms format.

### Hours Logic (Backend must match frontend)

- Backend must replicate exactly:
  hoursPerSession = end*time - start_time (in hours)
  daysPerWeek = count of weekday flags === "X"
  totalHours = hoursPerSession * daysPerWeek \_ weeks

### Instructor Hour Reconciliation

- If instructor unchanged:
  difference = newHours - oldHours
  add difference to instructor.total_hours

- If instructor changed:
  subtract oldHours from previous instructor
  add newHours to new instructor

Backend must return updated totals.

### Save Response Required Format

- Backend must return an object containing:
  {
  deliveries: [...], // updated delivery objects
  instructors: [...] // updated instructor totals
  }

Frontend replaces its local state with these arrays.
