import React, { useEffect } from "react";
import * as API from "../../api";
import { PatientPreview } from "../../utils/types";
import AllPatientsTable from "../patients/AllPatientsTable";

type Props = {};

export default function AllPatients({}: Props) {
  const [patients, setPatients] = React.useState<PatientPreview[]>([]);
  useEffect(() => {
    API.getAllPatients().then((patients) => {
      console.log(patients);
      setPatients(patients);
    });
  }, []);
  return (
    <div>
      <AllPatientsTable />
    </div>
  );
}
