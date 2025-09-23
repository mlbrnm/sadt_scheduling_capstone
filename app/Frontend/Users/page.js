"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";
import AddUserModal from "../_Components/AddUserModal";

export default function Users() {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const router = useRouter();

  // Pull in user data from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get users data from the users table, filtering by deleted status
      let query = supabase.from("users").select(`
          id,
          email,
          first_name,
          last_name,
          role,
          image,
          has_logged_in,
          is_deleted,
          created_at,
          updated_at
        `);

      // Filter based on showDeleted state
      if (showDeleted) {
        query = query.eq("is_deleted", true);
      } else {
        query = query.eq("is_deleted", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Format the data and handle empty fields
      const formattedUsers = data.map((user) => ({
        ...user,
        email: user.email || "No email found",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "",
        image: user.image || "/default-avatar.jpg",
      }));

      setUsersData(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showDeleted]);

  const handleEditUser = (userId) => {
    router.push(`/Frontend/Users/Edit?id=${userId}`);
  };

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleUserCreated = () => {
    // Refresh the users list after a new user is created
    fetchUsers();
  };

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
        <div className="flex justify-between items-center -mt-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                showDeleted
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {showDeleted ? "Show Active Users" : "Show Deleted Users"}
            </button>
          </div>
          <button
            onClick={handleAddUser}
            className="button-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md p-4 bg-red-50 text-red-700">
          Error loading users: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      )}

      {/* Users List */}
      {!loading && !error && (
        <div className="space-y-4">
          {usersData.map((user) => (
            <div
              key={user.id}
              className={`rounded-lg p-6 flex items-center transition-colors shadow-sm border ${
                user.is_deleted
                  ? "bg-gray-100 border-gray-300 opacity-75"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {/* Left Section - User Info */}
              <div className="flex items-center space-x-4 flex-shrink-0 w-96">
                {/* Profile Pic */}
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  <img
                    src={user.image}
                    alt={`${user.first_name} ${user.last_name}`}
                    className={`w-full h-full object-cover ${
                      user.is_deleted ? "grayscale" : ""
                    }`}
                  />
                </div>

                {/* User name and email */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-medium ${
                        user.is_deleted ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {user.first_name} {user.last_name}
                    </span>
                    {user.is_deleted && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                        DELETED
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      user.is_deleted ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Middle Section - Role */}
              <div className="flex items-center justify-center flex-shrink-0 w-48">
                <span className={getRoleBadgeStyle(user.role)}>
                  {user.role === "AC" ? "Academic Chair" : user.role}
                </span>
              </div>

              {/* Right Section - Edit */}
              <div className="flex items-center justify-end flex-grow">
                <button
                  onClick={() => handleEditUser(user.id)}
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer"
                >
                  Edit Account/Permissions...
                </button>
              </div>
            </div>
          ))}

          {/* If no users. */}
          {usersData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
