import React, { useEffect } from "react";
import { getAllPatients } from "../../api";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { convertMsToString } from "../../utils/time.utils";
import { PatientPreview } from "../../utils/types";
import AppTable from "../../components/AppTable";

// hard code me some patients for testing purposees
const dev = true;
const patients_test: PatientPreview[] = [
  {
    id: "patient-test",
    createdAt: "2023-01-01T10:00:00Z",
    removedAt: null,
    activeDevice: {
      id: "device-67890",
      interval: 60,
      name: "Heart Rate Monitor",
      createdAt: "2023-01-01T09:30:00Z",
    },
  },
];

export default function AllPatientsTable() {
  const navigate = useNavigate();
  const [patients, setPatients] = React.useState<PatientPreview[]>(
    dev ? patients_test : []
  );
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
