import React, { useEffect, useMemo } from "react";
import { getAllDevices, getAllPatients, getAllUsers } from "../../api";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import moment from "moment";
import SearchBar from "../../components/SearchBar";
import { Chip } from "@mui/material";
import { convertMsToString } from "../../utils/time.utils";
import { Device, PatientPreview } from "../../utils/types";
import AppTable from "../../components/AppTable";

type Props = {};

export default function AllPatientsTable({}: Props) {
  const navigate = useNavigate();
  const [patients, setPatients] = React.useState<PatientPreview[]>([]);
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
