"use client";
import { useState } from "react";
import Image from "next/image";
import mockdata from "./mockdata.json";

export default function Users() {
  const [usersData, setUsersData] = useState(mockdata);

  // Get role badge styling
  const getRoleBadgeStyle = (role) => {
    if (role === "Admin") {
      return "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium";
    } else if (role === "AC") {
      return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
    }
    return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
  };

  return (
    <div className="p-8 px-80">
      {/* Header Section */}
      <div className="flex flex-col mb-6">
        <h1 className="text-xl font-bold text-center mb-4">
          Manage User Accounts
        </h1>
        <div className="flex justify-end -mt-8">
          <button className="button-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {usersData.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg p-6 flex items-center hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
          >
            {/* Left Section - User Info */}
            <div className="flex items-center space-x-4 flex-shrink-0 w-96">
              {/* Profile Pic */}
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <img
                  src={user.image}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* User name and email */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <span className="text-gray-600 text-sm">{user.email}</span>
              </div>
            </div>

            {/* Middle Section - Role */}
            <div className="flex items-center justify-center flex-shrink-0 w-48">
              <span className={getRoleBadgeStyle(user.role)}>
                {user.role === "AC" ? "Academic Chair" : user.role}
              </span>
            </div>

            {/* Right Section - Edit/Delete */}
            <div className="flex items-center justify-end space-x-3 flex-grow">
              <button className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                Edit Account/Permissions...
              </button>
              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                <img src="/trash.svg" alt="Delete User" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* If no users. */}
        {usersData.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
}
