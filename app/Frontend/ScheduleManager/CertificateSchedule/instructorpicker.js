export default function InstructorPicker({ instructors }) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">
        Select Instructor
      </label>
      <div className="border border-gray-300 rounded p-2 w-full">
        {instructors.map((instructor) => (
          <div key={instructor.instructor_id} className="flex cursor-pointer">
            <span>{instructor.instructor_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
