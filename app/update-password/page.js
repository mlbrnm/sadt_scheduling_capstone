"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../Frontend/supabaseClient";
import Footer from "../Frontend/_Components/footer";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"
  const [hashParams, setHashParams] = useState(null);

  // Check for auth state changes when the component loads
  useEffect(() => {
    // Set up listener for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        // Password recovery triggered - show the form
        setMessage("You can now set your new password.");
        setMessageType("success");
      } else if (event === "SIGNED_IN") {
        // Check if this is a recovery or a regular sign-in
        // Recovery sessions will have a param in the URL with type=recovery
        const isRecoverySession =
          window.location.hash.includes("type=recovery");

        if (!isRecoverySession) {
          // Only redirect for regular sign-ins, not recovery sessions
          setMessage("You are already logged in. Redirecting...");
          setMessageType("success");

          setTimeout(() => {
            router.push("/Frontend/Home");
          }, 2000);
        }
      }
    });

    // Cleanup subscription on unload
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // Password validation
  const validatePassword = () => {
    // Reset previous messages
    setMessage("");
    setMessageType("");

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return false;
    }

    // Check password length
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the password
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      // Get the current user's UUID
      const userId = data.user.id;

      // Insert or update the user record in the custom users table which will indicate for future sessions
      // that the user has logged in and set their password.
      const { error: userError } = await supabase.from("users").upsert(
        {
          id: userId,
          has_logged_in: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (userError) {
        console.error("Error updating users table:", userError);
        // Continue with the flow even if this fails
      } else {
        console.log("Successfully updated users table for user:", userId);
      }

      // Password updated successfully
      setMessage("Password updated successfully! Redirecting to login...");
      setMessageType("success");

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      setMessage(`Error updating password: ${error.message}`);
      setMessageType("error");
      console.error("Password update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl font-bold sadt_blue_light mb-2">
                Update Your Password
              </h1>
              <p className="text-gray-600">
                Please enter your new password below.
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 rounded-md p-4 ${
                  messageType === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Password Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter your new password"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200"
                  placeholder="Confirm your new password"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md border border-transparent background-headerfooter px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center">
          <div className="p-12 max-w-md">
            <div className="w-full h-auto rounded-lg flex items-center justify-center">
              <img
                src="/sadt_icon_color.png"
                alt="SADT Logo"
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold sadt_blue_light">
                Welcome to the SADT schedule management tool.
              </h2>
              <p className="mt-2 sadt_blue_light">
                Please set a secure password to access your account.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
