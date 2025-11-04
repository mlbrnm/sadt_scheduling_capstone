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

    useEffect(() => {
        const fetchInstructorData = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("instructors")
                .select("*")
                .eq("id", instructorId)
                .single();

            if (error) {
                console.error("Error fetching instructor data:", error);
            } else {
                setInstructorData(data);
            }
            setIsLoading(false);
        };

        if (instructorId) {
            fetchInstructorData();
        }
    }, [instructorId]);

    return (
        <div className="p-8">
            {/* <Image src="/default-avatar.png" alt="Default Avatar" width={96} height={96} className="rounded-full" /> */}
            {/* Profile Pic */}
            <div className="flex mb-4 border border-gray-400">
                <div className="flex mb-4 border border-blue h-64 w-64 rounded-full items-center justify-center bg-gray-400 mr-10 mt-2 ml-12">
                    <span className="text-center text-xs">Placeholder for Profile Image</span>
                </div>
                <div className="mt-6 mx-9 border border-gray-400">
                    <span className="text-5xl font-semibold">Martina Cruz</span>
                    <div className="flex items-center mt-5 ml-2">
                        <span className="text-lg mr-10">ID: 573530</span>
                        <span className="text-lg chip-approved px-4 py-1 w-20 text-center rounded">Renew</span>
                        <span className="text-lg ml-6">Since: 2022-01-26</span>
                    </div>
                    <div className=" mt-4 ml-2">
                        <span className="text-lg chip-submitted px-4 py-2 w-30 text-center rounded">Temporary</span>
                        <span className="text-lg ml-6">CCH Target: 615</span>                    
                    </div>
                    <div className="text-lg mt-4 ml-2">
                        <span className="text-lg">Reports To: Kim Noble</span>
                        <span className="text-lg ml-6">End Date: 2026-01-23</span>
                    </div>
                </div>
                <div className="mt-12 mx-12 border border-gray-400">
                    <ul>
                        <li className="text-xl ml-64 text-sait-red font-medium italic underline">martina.cruz@sait.ca</li>
                        <li className="text-lg ml-64 mt-3">Office: NN406</li>
                        <li className="text-lg ml-64 mt-3">Phone: 403-555-1234 (ext. 9)</li>
                    </ul>
                </div>
            </div>
            <div className="flex mt-10 mx-14 gap-50 justify-center">
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
                <div>
                    <span className="font-semibold text-xl">Previously Taught</span>
                    <ul className="list-disc m-4">
                        <li className="text-lg mt-1">CPRG-211</li>
                        <li className="text-lg mt-1">CPRG-304</li>
                        <li className="text-lg mt-1">INTP-302</li>
                    </ul>
                </div>
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

{/* first name, last name, id, cch target, contract type, instructor status, start date, end date, reporting ac */}