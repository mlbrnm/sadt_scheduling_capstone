**Made using AI**

# Handover Notes for Backend

## Components

### 1. CertificateSchedule (`page.js`)

- Entry point for **New Schedule**.
- Loads mock data (certificates + instructors).
- Handles user flow: delivery selection → edit → save.
- Computes instructor hour adjustments and updates state.

### 2. EditDelivery (`editdelivery.js`)

- Handles all editing for one or more deliveries.
- Converts weekday flags (`m`, `t`, `w`, etc.) to booleans for UI.
- Validates time/date inputs before save.
- Displays instructor utilization with color-coded preview.

### 3. InstructorPicker (`instructorpicker.js`)

- Lists available instructors for assignment.
- Shows contract type, total hours, and utilization color.

### 4. DeliveryPicker (`deliverypicker.js`)

- Modal to select which delivery the user wants to edit

### 5. CertificatesTable (`certificatestable.js`)

- Displays all deliveries with key scheduling fields.
- Shows assigned instructor name or “Unassigned”.

### 6. HoursUtil (`hoursUtil.js`)

- Contains reusable helper functions for time and hours calculations.
- Used by both EditDelivery and CertificateSchedule.

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
deliveryId: number | string, // unique stable key (backend ID)
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
