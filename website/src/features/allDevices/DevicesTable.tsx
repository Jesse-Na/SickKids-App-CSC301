import React, { useEffect } from "react";
import { getAllDevices } from "../../api";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Chip } from "@mui/material";
import { convertMsToString } from "../../utils/time.utils";
import type { Device } from "../../utils/types";
import AppTable from "../../components/AppTable";

type Props = {};

export default function DevicesTable({}: Props) {
  const navigate = useNavigate();
  const [devices, setDevices] = React.useState<Device[]>([]);
  const filterSearch = (device: any, search: string) => {
    return (
      device.id.toLowerCase().includes(search.toLowerCase()) ||
      device.name?.toLowerCase().includes(search.toLowerCase()) ||
      device.user?.toLowerCase().includes(search.toLowerCase())
    );
  };
  useEffect(() => {
    console.log("Devices TABLE");
    getAllDevices()
      .then((devices) => {
        console.log("DEVICES", devices);
        setDevices(devices);
      })
      .catch((err) => {
        console.log("ERROR", err);
      });
  }, []);
  return (
    <div>
      <AppTable
        title="Devices"
        filterSearch={filterSearch}
        rows={devices.map((device) => ({
          id: device.id,
          name: device.name,
          user: device.user,
          interval: convertMsToString(device.interval),
          frequency: device.frequency,
          lastSynced: device.lastSynced
            ? moment(device.lastSynced).fromNow()
            : "Not Synced",
          lastReset: device.lastReset ? (
            moment(device.lastReset).fromNow()
          ) : (
            <Chip color="error" label="Disabled" />
          ),
        }))}
        columns={[
          {
            id: "id",
            title: "Device Id",
          },
          {
            id: "name",
            title: "Device Name",
          },
          {
            id: "user",
            title: "Active Patient Id",
          },
          {
            id: "interval",
            title: "Reading Interval",
          },
          {
            id: "frequency",
            title: "Questionnaire Frequency",
          },
          {
            id: "lastSynced",
            title: "Last Synced",
          },
          {
            id: "lastReset",
            title: "Last Reset",
          },
        ]}
        onRowClick={(row) => navigate(`/device/${row.id}`)}
      />
    </div>
  );
}
