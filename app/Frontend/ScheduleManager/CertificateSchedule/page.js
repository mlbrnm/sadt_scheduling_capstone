import mockCertificates from "./mockCertificates.json"; // MOCK DATA - REMOVE LATER
import { useState } from "react";
export default function CertificateSchedule() {
  const [certificatesData, setCertificatesData] = useState(mockCertificates); // Currently holds Mock data for certificates - REPLACE WITH API CALL
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Certificate Schedule
      </h1>
    </div>
  );
}
