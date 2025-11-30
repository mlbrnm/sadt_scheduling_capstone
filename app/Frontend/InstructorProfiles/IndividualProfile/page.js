"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function IndivProfile() {
  const [instructorData, setInstructorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const instructorId = searchParams.get("id");

  // Fetch instructor data from database based on instructorId (pk)
  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!instructorId) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("instructors")
          .select("*")
          .eq("instructor_id", instructorId)
          .single();

        if (error) {
          console.error("Error fetching instructor data:", error);
          setInstructorData(null);
        } else {
          console.log("Instructor data:", data);
          setInstructorData(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setIsLoading(false);
      }
    };

    if (instructorId) {
      fetchInstructorData();
    }
  }, [instructorId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        <span className="ml-3">Loading instructor...</span>
      </div>
    );
  }

  // Status colour conditional rendering
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "chip-active px-4 py-1 w-24 text-center rounded border";
      case "Renew":
        return "chip-renew px-4 py-1 w-24 text-center rounded border";
      case "Inactive":
        return "chip-inactive px-4 py-1 w-24 text-center rounded border";
      case "Expire":
        return "chip-expire px-4 py-1 w-24 text-center rounded border";
      case "On Leave":
        return "chip-onleave px-4 py-1 w-24 text-center rounded border";
      default:
        return "chip-blank px-4 py-1 w-24 text-center rounded border";
    }
  };

  const fullName = `${instructorData?.instructor_name || ""} ${
    instructorData?.instructor_lastname || ""
  }`.trim();
  const email = instructorData
    ? `${instructorData.instructor_name}.${instructorData.instructor_lastname}@sait.ca`
    : "-";

  return (
    /* MAIN CONTENT CONTAINER */
    <div className="p-8 bg-slate-50 min-h-[80vh] flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* TOP CARD: PROFILE SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex items-center justify-center">
            <div className="h-40 w-40 md:h-52 md:w-52 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <Image
                src="/default-avatar.jpg"
                alt={fullName || "Instructor avatar"}
                width={220}
                height={220}
                className="rounded-full object-cover h-full w-full"
              />
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1 space-y-4">
            {/* Name + status row */}
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
                {fullName || "Unnamed Instructor"}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-sm md:text-base text-slate-600">
                  ID:{" "}
                  <span className="font-medium text-slate-800">
                    {instructorData?.instructor_id || "-"}
                  </span>
                </span>

                <span
                  className={`text-sm md:text-base ${getStatusColor(
                    instructorData?.instructor_status
                  )}`}
                >
                  {instructorData?.instructor_status || "Status Unknown"}
                </span>

                <span className="text-sm md:text-base text-slate-600">
                  Since:{" "}
                  <span className="font-medium text-slate-800">
                    {instructorData?.salaried_begin_date || "-"}
                  </span>
                </span>
              </div>
            </div>

            {/* Contract + Target + Reporting */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Contract Type
                </p>
                <span className="inline-flex items-center rounded border chip-contract-type px-4 py-1 text-sm">
                  {instructorData?.contract_type || "-"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  CCH Target
                </p>
                <p className="font-medium">
                  {instructorData?.cch_target_ay2025 || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Reports To
                </p>
                <p className="font-medium">
                  {instructorData?.reporting_ac || "-"}
                </p>
              </div>
            </div>

            {/* Contract End + Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Contract Dates */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Contract Dates
                </p>
                <p className="text-sm text-slate-700">
                  Start:{" "}
                  <span className="font-medium">
                    {instructorData?.salaried_begin_date || "-"}
                  </span>
                </p>
                <p className="text-sm text-slate-700">
                  End:{" "}
                  <span className="font-medium">
                    {instructorData?.contract_end || "-"}
                  </span>
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Contact
                </p>
                <p className="text-sm">
                  <span className="font-medium text-slate-700">Email:</span>{" "}
                  <span className="text-sait-red underline">{email}</span>
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Office:</span> NN406
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Phone:</span> 403-555-1234
                  <span className="text-slate-500"> (ext. 9)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID: COURSES + NOTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Current Courses */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
            <h2 className="font-semibold text-lg text-slate-900">
              Current Courses
            </h2>
            <ul className="list-disc list-inside mt-3 space-y-1 text-sm text-slate-700">
              <li>CPRG-211 A</li>
              <li>CPRG-211 B</li>
              <li>CPRG-304 B</li>
              <li>CPRG-304 D</li>
            </ul>
            <div className="mt-3 text-sm font-semibold text-slate-800">
              Total: 4
            </div>
          </div>

          {/* Eligible Courses */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
            <h2 className="font-semibold text-lg text-slate-900">
              Eligible Courses
            </h2>
            <ul className="list-disc list-inside mt-3 space-y-1 text-sm text-slate-700">
              <li>CPRG-211</li>
              <li>CPRG-216</li>
              <li>CPRG-304</li>
              <li>CPSY 202</li>
              <li>INTP-302</li>
            </ul>
          </div>

          {/* Previously Taught */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
            <h2 className="font-semibold text-lg text-slate-900">
              Previously Taught
            </h2>
            <ul className="list-disc list-inside mt-3 space-y-1 text-sm text-slate-700">
              <li>CPRG-211</li>
              <li>CPRG-304</li>
              <li>INTP-302</li>
            </ul>
          </div>

          {/* Notes / Comments */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
            <h2 className="font-semibold text-lg text-slate-900">
              Notes / Comments
            </h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              <li>Work from home Thursdays</li>
              <li>PMP Certification in progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* first name, last name, id, cch target, contract type, instructor status, start date, end date, reporting ac */
