"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./Frontend/supabaseClient";
import Footer from "./Frontend/_Components/footer";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState("email"); // 'email' or 'password'
  const [redirecting, setRedirecting] = useState(false);

  //For Editing Purposes - can take out when done
  const DEV_MODE = process.env.NODE_ENV === "development";

  //useEffect(() => {
  //  if (DEV_MODE) {
  //    setRedirecting(true); // trigger render showing "Redirecting..."
  //    router.push("/Frontend/Home");
  //  }
  //}, [DEV_MODE, router]);

  if (DEV_MODE && redirecting) {
    // render a placeholder while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Redirecting to Home (Dev Mode)...</p>
      </div>
    );
  }

  // Calls the Edge Function to check the user's status and determines the next step.
  const checkEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Step 1: Call the Edge Function with the user's email
      const { data, error } = await supabase.functions.invoke(
        "check-email-existence",
        {
          body: { email },
        }
      );

      if (error) throw error;

      console.log("Edge Function Response:", data);

      // Step 2: Handle the status returned from the function
      switch (data.status) {
        case "neither":
          // User does not exist in the system at all.
          setMessage(
            "Account not found. Please contact Vanessa Diaz Lopez to set up your account."
          );
          setStage("email");
          break;
        case "auth_only":
          // User exists (Vanessa has created an account) but has not logged in before. Send a password setup link.
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
          });
          setMessage(
            "Welcome! To set your password for the first time, please check your email for a setup link."
          );
          setStage("email"); // Stay on the email stage to show the message
          break;
        case "both":
          // a returning user who has logged in before.
          setMessage("Welcome back! Please enter your password.");
          setStage("password"); // go to the password entry stage
          break;
        default:
          throw new Error(
            `Received an unknown status from server: ${data.status}`
          );
      }
    } catch (error) {
      setMessage(`An error occurred: ${error.message}`);
      console.error("Error checking email:", error);
    } finally {
      setLoading(false);
    }
  };

  // the final sign-in with email and password.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Invalid login credentials. Please try again.");
      } else if (data.user) {
        router.push("/Frontend/Home");
      }
    } catch (error) {
      setMessage("An error occurred during login. Please try again.");
      console.error("Login error:", error);
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
                SADT Instructor Management System
              </h1>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 rounded-md p-4 ${
                  message.includes("found") ||
                  message.includes("error") ||
                  message.includes("Invalid")
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Email Form - Stage 1 */}
            {stage === "email" && (
              <form className="space-y-6" onSubmit={checkEmail}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md border border-transparent background-headerfooter px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? "Checking..." : "Continue"}
                  </button>
                </div>
              </form>
            )}

            {/* Password Form - Stage 2 */}
            {stage === "password" && (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    disabled
                    className="block w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("email");
                      setMessage(""); // Clear previous message
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md border border-transparent background-headerfooter px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center">
          <div className="p-12 max-w-md">
            <div className="w-full h-auto rounded-lg flex items-center justify-center">
              <img
                src="sadt_icon_color.png"
                alt="SADT Logo"
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold sadt_blue_light">
                Welcome to the SADT schedule management tool.
              </h2>
              <p className="mt-2 sadt_blue_light">
                Please contact Vanessa Diaz Lopez at{" "}
                <a
                  href="mailto:Vanessa.DiazLopez@sait.ca"
                  className="text-blue-600 hover:underline"
                >
                  Vanessa.DiazLopez@sait.ca
                </a>{" "}
                for access.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
