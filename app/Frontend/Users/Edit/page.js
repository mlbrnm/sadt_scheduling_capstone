"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import mockdata from "../mockdata.json";

export default function EditUser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [assignedPrograms] = useState(["Information Systems Security"]);
  const [unassignedPrograms] = useState([
    "Software Development",
    "Cybersecurity",
    "Interactive Design",
    "Information Technology Services",
    "Data Analytics",
  ]);

  useEffect(() => {
    if (userId) {
      const foundUser = mockdata.find((u) => u.id === userId);
      setUser(foundUser);
    }
  }, [userId]);

  const handleBack = () => {
    router.push("/Frontend/Users");
  };

  const getRoleBadgeStyle = (role) => {
    if (role === "Admin") {
      return "bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium";
    } else if (role === "AC") {
      return "bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium";
    }
    return "bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium";
  };

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 px-80">
      {/* Header Section */}
      <div className="flex flex-col mb-6">
        <h1 className="text-xl font-bold text-center mb-4">
          Manage User Accounts
        </h1>
      </div>

      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Back / Cancel
        </button>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Left Section - User Profile */}
        <div className="flex flex-col items-center space-y-4 flex-shrink-0">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
            <img
              src={user.image}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Name */}
          <h2 className="text-xl font-bold text-gray-900">
            {user.first_name} {user.last_name}
          </h2>

          {/* Last Online */}
          <p className="text-gray-600 text-sm">
            Last Online: 2025-09-13 10:21pm
          </p>

          {/* Role Badge */}
          <div className={getRoleBadgeStyle(user.role)}>
            {user.role === "AC" ? "Academic Chair" : user.role}
          </div>

          {/* Change Role Link */}
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer">
            Change Role
          </button>
        </div>

        {/* Center Section - Form Fields */}
        <div className="flex-1 space-y-6 max-w-md">
          {/* Email Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Address:
            </label>
            <input
              type="email"
              value={user.email}
              className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Name:
            </label>
            <input
              type="text"
              value={`${user.first_name} ${user.last_name}`}
              className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password:
            </label>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer">
              Click to send a password reset link to the registered email
              address.
            </button>
          </div>
        </div>

        {/* Right Section - Programs */}
        <div className="flex-1 space-y-6">
          {/* Assigned Programs */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Assigned Programs
            </h3>
            <div className="space-y-3">
              {assignedPrograms.map((program, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
                >
                  <span className="text-gray-900">{program}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      {/* Need to add checkmark icon */}
                    </div>
                    {/* Need to add remove button */}
                    <button className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Programs */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Unassigned Programs
            </h3>
            <div className="space-y-3">
              {unassignedPrograms.map((program, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
                >
                  <span className="text-gray-900">{program}</span>
                  <button className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
                    {/* Need to add plus icon */}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer">
          Save
        </button>
      </div>
    </div>
  );
}
