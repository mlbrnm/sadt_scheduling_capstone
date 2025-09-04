import Link from "next/link";
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        <li>
          <Link href="/Frontend/Dashboards/InstructorWorkload">
            Instructor Workload
          </Link>
        </li>
        <li>
          <Link href="/Frontend/Dashboards/ProgramSpecific">
            Program Specific
          </Link>
        </li>
      </ul>
    </div>
  );
}
