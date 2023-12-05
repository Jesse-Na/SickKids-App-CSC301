import React, { useEffect } from "react";
import { getAllPatients } from "../../api";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { convertMsToString } from "../../utils/time.utils";
import { PatientPreview } from "../../utils/types";
import AppTable from "../../components/AppTable";

type Props = {};

// hard code me some patients for testing purposees 
// ,ust follow this structure
// export type PatientPreview = {
//   id: string;
//   createdAt: string;
//   removedAt: string | null;
//   activeDevice: {
//     id: string;
//     interval: number;
//     name: string;
//     createdAt: string;
//   } | null;
// };

const patients_test: PatientPreview[] = [
  {
    "id": "patient-12345",
    "createdAt": "2023-01-01T10:00:00Z",
    "removedAt": null,
    "activeDevice": {
      "id": "device-67890",
      "interval": 60,
      "name": "Heart Rate Monitor",
      "createdAt": "2023-01-01T09:30:00Z"
    }
  }
]


export default function AllPatientsTable({ }: Props) {
  const navigate = useNavigate();
  const [patients, setPatients] = React.useState<PatientPreview[]>(patients_test);
  const filterSearch = (device: any, search: string) => {
    return (
      device.id.toLowerCase().includes(search.toLowerCase()) ||
      device.name?.toLowerCase().includes(search.toLowerCase()) ||
      device.user?.toLowerCase().includes(search.toLowerCase())
    );
  };
  useEffect(() => {
    getAllPatients()
      .then((patients) => {
        console.log("Patients", patients);
        setPatients(patients);
      })
      .catch((err) => {
        console.log("ERROR", err);
      });
  }, []);
  return (
    <div>
      <AppTable
        title="Patients"
        filterSearch={filterSearch}
        rows={patients.map((patient) => ({
          id: patient.id,
          createdAt: moment(patient.createdAt).fromNow(),
          activeDevice: patient.activeDevice?.name ?? "",
          removedAt: patient.removedAt
            ? moment(patient.removedAt).fromNow()
            : "",
          readingInterval: patient.activeDevice
            ? convertMsToString(patient.activeDevice.interval)
            : "",
        }))}
        columns={[
          {
            id: "id",
            title: "Patient Id",
          },
          {
            id: "createdAt",
            title: "Registered",
          },
          {
            id: "removedAt",
            title: "Removed",
          },
          {
            id: "activeDevice",
            title: "Active Device Name",
          },
          {
            id: "readingInterval",
            title: "Reading Interval",
          },
        ]}
        onRowClick={(row) => navigate(`/patient/${row.id}`)}
      />
    </div>
  );
}
