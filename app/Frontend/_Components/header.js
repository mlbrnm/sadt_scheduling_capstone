"use client";

import { useState, useEffect, act } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Get current user and listen for auth changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfilePopup &&
        !event.target.closest(".profile-popup-container")
      ) {
        setShowProfilePopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfilePopup]);

  const handleProfileClick = () => {
    if (user) {
      router.push(`/Frontend/Users/Edit?id=${user.id}`);
      setShowProfilePopup(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      setShowProfilePopup(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // DYNAMIC TAB FUNCTIONALITY
  const adminTabs = [
    //Should work on dynamic home tabs
    //{ label: "Home", href: "/Frontend/Home" },
    {
      label: "Schedule Manager",
      href: "/Frontend/ScheduleManager", // Goes to approval list rather than NewSchedule.
      submenu: [
        {
          label: "Certificate Schedule",
          href: "/Frontend/ScheduleManager/CertificateSchedule",
        },
      ],
    },
    { label: "Dashboards", href: "/Frontend/Dashboards/InstructorWorkload" },
    { label: "Upload Data", href: "/Frontend/UploadData" },
    { label: "Instructor Profiles", href: "/Frontend/InstructorProfiles" },
    { label: "Reports", href: "/Frontend/Reports" },
    { label: "Forecasting", href: "/Frontend/Forecasting" },
    { label: "Users", href: "/Frontend/Users" },
  ];
  const acTabs = [
    //Should work on dynamic home tabs
    //{ label: "Home", href: "/Frontend/Home" },
    { label: "Schedule Manager", href: "/Frontend/ACScheduleManager" },
    { label: "Dashboards", href: "/Frontend/Dashboards/InstructorWorkload" },
    { label: "Instructor Profiles", href: "/Frontend/InstructorProfiles" },
  ];

  //get user's role to determiine correct nav tabs
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data?.role) {
        setUserRole(data.role);
      }
    };
    fetchUserRole();
  }, [user]);

  const tabs = userRole === "Admin" ? adminTabs : acTabs;

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
      </div>
      {/* Middle: Navigation Links */}
      <nav className="flex flex-1 justify-between items-stretch h-full border-l border-gray-300">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className="flex-1 h-full relative group border-r border-gray-300"
          >
            {/* Main tab link */}
            <Link
              href={tab.href}
              className="absolute inset-0 flex justify-center items-center
          text-white hover:bg-[#00A3E0] transition-colors font-medium"
            >
              {tab.label}
            </Link>

            {/* Dropdown (only if submenu exists) */}
            {tab.submenu && (
              <div
                className="absolute left-0 right-0 top-full
                     background-headerfooter
                     opacity-0 pointer-events-none
                     group-hover:opacity-100 group-hover:pointer-events-auto
                     z-50"
              >
                {tab.submenu.map((item, subIndex) => (
                  <Link
                    key={subIndex}
                    href={item.href}
                    className="block px-4 py-2 font-medium text-white hover:bg-[#00A3E0]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Right: User Profile & Notifications/Alerts */}
      {!loading && user && (
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

          {/* User Profile Button with Popup */}
          <div className="profile-popup-container relative">
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setShowProfilePopup(!showProfilePopup)}
            >
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

            {/* Profile Popup */}
            {showProfilePopup && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-3 text-gray-500"
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
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-3 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
