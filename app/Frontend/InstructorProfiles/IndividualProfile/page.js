'use client';
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useRouter, useSearchParams } from "next/navigation"
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
            <div className="p-8 spinner rounded-full border-t-2 border-b border-gray-900">Loading...</div>
        );
    }

    // Status colour conditional rendering
    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return  "bg-[#86cb8a] px-4 py-1 w-20 text-center rounded border border-[#333333]";
            case "Renew":
                return "bg-[#f9d800] px-4 py-1 w-20 text-center rounded border border-[#333333]";
            case "Inactive":
                return "bg-[#b49494] px-4 py-1 w-20 text-center rounded border border-[#333333]";
            case "Expire":
                return "bg-[#ae132a] px-4 py-1 w-20 text-center rounded border border-[#333333]";
            case "On Leave":
                return "bg-[#74a8c9] px-4 py-1 w-20 text-center rounded border border-[#333333]";
            default:
                return "bg-[#bdbdbd] px-4 py-1 w-20 text-center rounded border border-[#333333]";
        }
    };

    return (
        /* MAIN CONTENT CONTAINER */
        <div className="p-8">
            {/* Top Half of Page Container */}
            <div className="flex mb-4">
                {/* Profile Pic */}
                <div className="flex mb-4 border border-blue h-64 w-64 rounded-full items-center justify-center bg-gray-400 mr-10 mt-2 ml-12">
                    <Image src="/default-avatar.jpg" alt={`${instructorData?.instructor_name} ${instructorData?.instructor_lastname}`} width={275} height={300} className="rounded-full object-cover" />
                </div>
                {/* Basic Instructor Info */}
                <div className="mt-6 mx-9">
                    <span className="text-5xl font-semibold">{instructorData?.instructor_name} {instructorData?.instructor_lastname}</span>
                    <div className="flex items-center mt-5 ml-2">
                        <span className="text-lg mr-10">ID: {instructorData?.instructor_id}</span>
                        <span className={`text-lg ${getStatusColor(instructorData?.instructor_status)}`}>{instructorData?.instructor_status || "-"}</span>
                        <span className="text-lg ml-6">Since: {instructorData?.salaried_begin_date || "-"}</span>
                    </div>
                    <div className=" mt-4 ml-2">
                        <span className="text-lg chip-contract-type border px-4 py-2 w-30 text-center rounded">{instructorData?.contract_type || "-"}</span>
                        <span className="text-lg ml-6">CCH Target: {instructorData?.cch_target_ay2025 || "-"}</span>
                    </div>
                    <div className="text-lg mt-4 ml-2">
                        <span className="text-lg">Reports To: {instructorData?.reports_to}</span>
                        <span className="text-lg ml-6">End Date: {instructorData?.end_date || "-"}</span>
                    </div>
                </div>
                <div className="mt-12 mx-12">
                    <ul>
                        <li className="text-xl ml-64 text-sait-red font-medium italic underline">{instructorData?.instructor_name}.{instructorData?.instructor_lastname}@sait.ca</li>
                        <li className="text-lg ml-64 mt-3">Office: NN406</li>
                        <li className="text-lg ml-64 mt-3">Phone: 403-555-1234 (ext. 9)</li>
                    </ul>
                </div>
            </div>
            {/* Bottom Half of Page Container */}
            <div className="flex mt-10 mx-14 gap-48 justify-center">
                {/* Current Courses */}
                <div>
                    <span className="font-semibold text-xl">Current Courses</span>
                    <ul className="list-disc m-4">
                        <li className="text-lg mt-1">CPRG-211 A</li>
                        <li className="text-lg mt-1">CPRG-211 B</li>
                        <li className="text-lg mt-1">CPRG-304 B</li>
                        <li className="text-lg mt-1">CPRG-304 D</li>
                    </ul>
                    <span className="font-semibold text-xl ml-5">Total: 4</span>
                </div>
                {/* Eligible Courses */}
                <div>
                    <span className="font-semibold text-xl">Eligible Courses</span>
                    <ul className="list-disc m-4">
                        <li className="text-lg mt-1">CPRG-211</li>
                        <li className="text-lg mt-1">CPRG-216</li>
                        <li className="text-lg mt-1">CPRG-304</li>
                        <li className="text-lg mt-1">CPSY 202</li>
                        <li className="text-lg mt-1">INTP-302</li>
                    </ul>
                </div>
                {/* Previously Taught */}
                <div>
                    <span className="font-semibold text-xl">Previously Taught</span>
                    <ul className="list-disc m-4">
                        <li className="text-lg mt-1">CPRG-211</li>
                        <li className="text-lg mt-1">CPRG-304</li>
                        <li className="text-lg mt-1">INTP-302</li>
                    </ul>
                </div>
                {/* Notes/Comments Section*/}
                <div>
                    <ul className="font-semibold text-xl">Notes/Comments:
                        <li className="text-lg my-2 font-normal">Work from home thursdays</li>
                        <li className="text-lg mt-4 mb-2 font-normal">PMP Certification in Progress</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* first name, last name, id, cch target, contract type, instructor status, start date, end date, reporting ac */