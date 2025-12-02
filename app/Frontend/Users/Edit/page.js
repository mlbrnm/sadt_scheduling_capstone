"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../supabaseClient";

export default function EditUser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [unassignedPrograms, setUnassignedPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programError, setProgramError] = useState(null);
  const [programOperationLoading, setProgramOperationLoading] = useState(null);

  // Pull in user data from Supabase
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        setError("No user ID provided");
        return;
      }

      // Get user data from the users table by ID
      const { data, error } = await supabase
        .from("users")
        .select(
          `
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
        `
        )
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (!data) {
        setError("User not found");
        return;
      }

      // Format the data and handle empty fields
      const formattedUser = {
        ...data,
        email: data.email || "No email found",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        role: data.role || "",
        image: data.image || "/default-avatar.jpg",
      };

      setUser(formattedUser);

      // Populate form data
      setFormData({
        email: formattedUser.email,
        first_name: formattedUser.first_name,
        last_name: formattedUser.last_name,
        role: formattedUser.role,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Fetch programs and categorize them based on user assignment
  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      setProgramError(null);

      // Fetch assigned programs for this user
      const { data: assignedPrograms, error: assignedError } = await supabase
        .from("programs")
        .select("program_id, program")
        .eq("ac_id", userId);

      if (assignedError) throw assignedError;

      // Fetch unassigned programs
      const { data: unassignedPrograms, error: unassignedError } =
        await supabase
          .from("programs")
          .select("program_id, program")
          .is("ac_id", null)
          .order("program");

      if (unassignedError) throw unassignedError;

      // Update state
      setAssignedPrograms(assignedPrograms);
      setUnassignedPrograms(unassignedPrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setProgramError("Failed to load programs: " + error.message);
    } finally {
      setProgramsLoading(false);
    }
  };

  const addUserToProgram = async (programId) => {
    try {
      setProgramOperationLoading(programId);
      setProgramError(null);

      // Just update ac_id directly
      const { error: updateError } = await supabase
        .from("programs")
        .update({ ac_id: userId })
        .eq("program_id", programId);

        if (updateError) throw updateError;
      }

      // Refresh programs list
      await fetchPrograms();
    } catch (error) {
      console.error("Error assigning program:", error);
      setProgramError("Failed to assign program: " + error.message);
    } finally {
      setProgramOperationLoading(null);
    }
  };

  const removeUserFromProgram = async (programId) => {
    try {
      setProgramOperationLoading(programId);
      setProgramError(null);

      // Set ac_id to null
      const { error: updateError } = await supabase
        .from("programs")
        .update({ ac_id: null })
        .eq("program_id", programId);

      if (updateError) throw updateError;

      // Refresh programs list
      await fetchPrograms();
    } catch (error) {
      console.error("Error removing program assignment:", error);
      setProgramError("Failed to remove program assignment: " + error.message);
    } finally {
      setProgramOperationLoading(null);
    }
  };

  // Fetch programs when user role changes to AC
  useEffect(() => {
    if (formData.role === "AC" && userId) {
      fetchPrograms();
    }
  }, [formData.role, userId]);

  // Add unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle form input changes (excluding email which is read-only)
  const handleInputChange = (field, value) => {
    if (field === "email") return; // Email is read-only

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
    setSaveMessage(null); // Clear any previous save messages
  };

  // Handle save functionality
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveMessage(null);

      // Update the public users table (email is read-only, so we don't update auth table)
      const { error: usersError } = await supabase
        .from("users")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (usersError) {
        throw new Error(`Failed to update user data: ${usersError.message}`);
      }

      // Update the user state with new data
      setUser((prev) => ({
        ...prev,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      }));

      setHasUnsavedChanges(false);
      setSaveMessage("User updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Failed to save user: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle password reset functionality
  const handlePasswordReset = async () => {
    if (!window.confirm("Send a password reset email to this user?")) {
      return;
    }

    try {
      setSendingReset(true);
      setError(null);
      setResetMessage(null);

      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        throw new Error(`Failed to send password reset: ${error.message}`);
      }

      setResetMessage(`Password reset email sent to ${formData.email}`);

      // Clear reset message after 5 seconds
      setTimeout(() => setResetMessage(null), 5000);
    } catch (error) {
      console.error("Error sending password reset:", error);
      setError("Failed to send password reset: " + error.message);
    } finally {
      setSendingReset(false);
    }
  };

  // Handle delete/restore functionality
  const handleDeleteRestore = async () => {
    const isDeleted = user.is_deleted;
    const action = isDeleted ? "restore" : "delete";
    const confirmMessage = isDeleted
      ? `Are you sure you want to restore ${user.first_name} ${user.last_name}? This will make their account active again.`
      : `Are you sure you want to delete ${user.first_name} ${user.last_name}? This will deactivate their account but preserve their data.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setDeleteMessage(null);

      // Update the is_deleted flag
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_deleted: !isDeleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(`Failed to ${action} user: ${updateError.message}`);
      }

      // Update the user state
      setUser((prev) => ({
        ...prev,
        is_deleted: !isDeleted,
      }));

      const successMessage = isDeleted
        ? `${user.first_name} ${user.last_name} has been restored successfully!`
        : `${user.first_name} ${user.last_name} has been deleted successfully!`;

      setDeleteMessage(successMessage);

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteMessage(null), 3000);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      setError(`Failed to ${action} user: ` + error.message);
    } finally {
      setDeleting(false);
    }
  };

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

  return (
    <div className="p-8 px-80">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Back / Cancel
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md p-4 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {saveMessage && (
        <div className="mb-6 rounded-md p-4 bg-green-50 text-green-700">
          {saveMessage}
        </div>
      )}

      {/* Password Reset Message */}
      {resetMessage && (
        <div className="mb-6 rounded-md p-4 bg-blue-50 text-blue-700">
          {resetMessage}
        </div>
      )}

      {/* Delete/Restore Message */}
      {deleteMessage && (
        <div className="mb-6 rounded-md p-4 bg-green-50 text-green-700">
          {deleteMessage}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
          <span className="ml-3">Loading users...</span>
        </div>
      )}

      {/* User not found */}
      {!loading && !error && !user && (
        <div className="text-center py-8 text-gray-500">User not found.</div>
      )}

      {/* Main Content - Only show when user is loaded */}
      {!loading && !error && user && (
        <div>
          {/* Main Content */}
          <div className="flex gap-8">
            {/* Left Section - User Profile */}
            <div className="flex flex-col items-center space-y-4 flex-shrink-0">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
                <img
                  src={user.image}
                  alt={`${user.first_name} ${user.last_name}`}
                  className={`w-full h-full object-cover ${
                    user.is_deleted ? "grayscale opacity-60" : ""
                  }`}
                />
              </div>

              {/* User Name */}
              <div className="text-center">
                <h2
                  className={`text-xl font-bold ${
                    user.is_deleted ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {user.first_name} {user.last_name}
                </h2>
                {user.is_deleted && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block">
                    DELETED USER
                  </span>
                )}
              </div>

              {/* Last Online */}
              <p
                className={`text-sm ${
                  user.is_deleted ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Last Online: 2025-09-13 10:21pm
              </p>

              {/* Role Badge */}
              <div className={getRoleBadgeStyle(user.role)}>
                {user.role === "AC" ? "Academic Chair" : user.role}
              </div>

              {/* Change Role Link */}
              <button
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  user.is_deleted
                    ? "text-gray-400 hover:text-gray-500"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
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
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 border bg-gray-100 border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed from this interface
                </p>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  First Name:
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Last Name:
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Role:
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="AC">Academic Chair</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password:
                </label>
                <button
                  onClick={handlePasswordReset}
                  disabled={sendingReset}
                  className={`text-sm font-medium transition-colors ${
                    sendingReset
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800 cursor-pointer"
                  }`}
                >
                  {sendingReset
                    ? "Sending reset email..."
                    : "Click to send a password reset link to the registered email address."}
                </button>
              </div>
            </div>

            {/* Right Section - Programs - Only show for AC role */}
            {formData.role === "AC" && (
              <div className="flex-1 space-y-6">
                {/* Program Error Message */}
                {programError && (
                  <div className="rounded-md p-4 bg-red-50 text-red-700">
                    {programError}
                  </div>
                )}

                {/* Programs Loading State */}
                {programsLoading && (
                  <div className="text-center py-4 text-gray-500">
                    Loading programs...
                  </div>
                )}

                {/* Assigned Programs */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Assigned Programs
                  </h3>
                  <div className="space-y-3">
                    {assignedPrograms.length === 0 && !programsLoading ? (
                      <div className="text-gray-500 text-sm italic">
                        No programs assigned
                      </div>
                    ) : (
                      assignedPrograms.map((program) => (
                        <div
                          key={program.program_id}
                          className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-900">
                            {program.program}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <button
                              onClick={() => removeUserFromProgram(program.id)}
                              disabled={programOperationLoading === program.id}
                              className={`w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors ${
                                programOperationLoading === program.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {programOperationLoading === program.id ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Unassigned Programs */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Unassigned Programs
                  </h3>
                  <div className="space-y-3">
                    {unassignedPrograms.length === 0 && !programsLoading ? (
                      <div className="text-gray-500 text-sm italic">
                        All programs are assigned
                      </div>
                    ) : (
                      unassignedPrograms.map((program) => (
                        <div
                          key={program.program_id}
                          className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-900">
                            {program.program}
                          </span>
                          <button
                            onClick={() => addUserToProgram(program.program_id)}
                            disabled={
                              programOperationLoading === program.program_id
                            }
                            className={`w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors flex-shrink-0 ${
                              programOperationLoading === program.program_id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {programOperationLoading === program.program_id ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="3"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6v12m6-6H6"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            {/* Delete/Restore Button */}
            <button
              onClick={handleDeleteRestore}
              disabled={deleting}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                user.is_deleted
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "button-primary hover:bg-red-700 text-white"
              } ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {deleting
                ? user.is_deleted
                  ? "Restoring..."
                  : "Deleting..."
                : user.is_deleted
                ? "Restore User"
                : "Delete User"}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                saving || !hasUnsavedChanges
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "button-primary hover:bg-red-700 text-white cursor-pointer"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
