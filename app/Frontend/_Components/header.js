// This would conditionally render based on user just like Homepage.
// For now I made it look like Vanessa's.
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="background-headerfooter flex items-center text-white h-16">
      {/* Left: SAIT Logo */}
      <div className="flex items-center h-full px-6 relative">
        <Link href="/Frontend/Home">
          <Image
            src="/sadt_icon_color.png"
            width={32}
            height={32}
            alt="SAIT Logo"
            className="h-8"
          />
        </Link>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
      </div>
      {/* Middle: Navigation Links */}
      {/* !!!WE SHOULD PROBABLY MAP THIS!!!*/}
      <nav className="flex flex-1 justify-between items-stretch h-full">
        <div className="flex-1 h-full relative">
          <Link
            href={"/Frontend/Dashboards/InstructorWorkload"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            Dashboards
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>

        <div className="flex-1 h-full relative">
          <Link
            href={"/Frontend/UploadData"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            Upload Data
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>

        <div className="flex-1 h-full relative">
          <Link
            href={"#"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            Reports
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>

        <div className="flex-1 h-full relative">
          <Link
            href={"#"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            Forecasting
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>

        <div className="flex-1 h-full relative">
          <Link
            href={"/Frontend/Users"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            Users
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>
      </nav>
      {/* Right: User Profile & Notifications/Alerts */}
      {/* !!!THIS DOESN'T DO ANYTHING FOR NOW!!! */}
      <div className="flex items-center h-full px-6 space-x-2 relative">
        <button className="p-2 rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        <button className="p-2 rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
