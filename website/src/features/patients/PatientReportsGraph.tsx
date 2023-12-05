import React, { useEffect } from "react";
import { getPatientReports } from "../../api";
import PatientUsage from "../graphs/PatientUsage";

type Props = {
  patientId: string;
};

export default function PatientReportsGraph({ patientId }: Props) {
  const [reportsData, setReportsData] = React.useState<
    { minutes: number | null; date: string }[]
  >([]);

  useEffect(() => {
    getPatientReports(patientId).then((data) => {
      console.log("got reports", data);
      setReportsData(data);
    });
  }, [patientId]);
  return <PatientUsage patientId={patientId} patientUsage={reportsData} />;
}
