"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Get current user and listen for auth changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfilePopup && !event.target.closest('.profile-popup-container')) {
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      router.push('/');
      setShowProfilePopup(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
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
          {/* Need to add the dropdowns here for the different types of dashboards, cuz right now it's only linking to instructor workload!!*/}
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

        {/*Schedule Manager*/}
        <div className="flex-1 h-full relative">
          <Link
            href={"/Frontend/ScheduleManager"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            
            Schedule Manager
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>

        <div className="flex-1 h-full relative">
          <Link
            href={"/Frontend/InstructorProfiles"}
            className="
            absolute inset-0 flex justify-center items-center
            text-white hover:bg-[#00A3E0] transition-colors font-medium
          "
          >
            Instructor Profiles
          </Link>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>

        <div className="flex-1 h-full relative">
          <Link
            href={"/Frontend/Reports"}
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
            href={"/Frontend/Forecasting"}
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
