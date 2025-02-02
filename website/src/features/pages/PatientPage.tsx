import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Patient } from "../../utils/types";
import * as API from "../../api";
import PatientReadingTable from "../patients/PatientReadingTable";
import PatientUsageGraph from "../patients/PatientUsageGraph";
import PatientBatteryGraph from "../patients/PatientBatteryGraph";
import { Box } from "@mui/material";
import PatientReportsGraph from "../patients/PatientReportsGraph";

export default function PatientPage() {
  const patientId = useParams<{ id: string }>().id;

  const [patient, setPatient] = React.useState<Patient | null>(null);

  useEffect(() => {
    if (!patientId) return;
    console.log("patientId", patientId);
    API.getPatient(patientId)
      .then((patient) => {
        console.log("patient", patient);
        setPatient(patient);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [patientId]);

  if (!patientId) return <div>Loading...</div>;

  return (
    <div>
      <h1>Patient {patientId}</h1>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <PatientUsageGraph patientId={patientId} />
        <PatientBatteryGraph patientId={patientId} />
        <PatientReportsGraph patientId={patientId} />
      </Box>
      <PatientReadingTable patientId={patientId} clearLastSynced={() => {}} />
    </div>
  );
}
