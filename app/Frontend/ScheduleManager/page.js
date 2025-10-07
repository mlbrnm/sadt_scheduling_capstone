"use client";
import { useState } from "react";
import dummydata from "./dummydata.json";

export default function ScheduleManager() {
  const [submittedSchedulesData, setSubmittedSchedulesData] = useState(dummydata);


  return (
    /*Main Content Container*/
    <div className="p-4">
      <h1 className="text-2xl text-center font-bold mb-6">Schedule Manager</h1>
      {/*Content Goes Here*/}
      <div className="bg-white shadow-md rounded-lg p-6">
        <p>This is the Schedule Manager page. The schedule manager will go here, once we get the proper data from the client.</p>
      </div>
    </div>
    );
}