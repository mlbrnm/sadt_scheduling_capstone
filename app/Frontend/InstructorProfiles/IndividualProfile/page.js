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
            <div className="flex mb-4">
                <div className="flex mb-4 border border-blue h-62 w-62 rounded-full items-center justify-center bg-gray-400">
                    <span className="text-center text-xs">Placeholder for Profile Image</span>
                </div>
                <div className="mt-6 mx-12">
                    <span className="text-5xl font-semibold">Daniel López</span>
                    <div className="flex items-center mt-6 ml-2">
                        <span className="text-lg mr-10">ID: 295594</span>
                        <span className="text-lg chip-approved px-4 py-1 w-20 text-center rounded">Active</span>
                        <span className="text-lg ml-6">Since: 2024-10-09</span>
                    </div>
                    <div className=" mt-4 ml-2">
                        <span className="text-lg chip-submitted px-4 py-2 w-30 text-center rounded">Casual</span>
                        <span className="text-lg ml-6">CCH Target: 615</span>                    
                    </div>
                    <div className="text-lg mt-6 ml-2">
                        <span className="text-lg">Reporting AC: Rod MacIntosh</span>
                        <span className="text-lg ml-6">End Date: 2025-09-23</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

{/* first name, last name, id, cch target, contract type, instructor status, start date, end date, reporting ac */}