import React, { useEffect, useState } from "react";
import { deleteReadings, getDeviceReadings } from "../../api";
import { DeviceReading } from "../../utils/types";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import { Button } from "@mui/material";

type Props = {
  fileId: string;
  data: DeviceReading[];
  reload: () => void;
};

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90, editable: false },
  { field: "timestamp", headerName: "Timestamp", width: 200, editable: false },
  { field: "battery", headerName: "Battery", width: 100 },
  {
    field: "touchSensor1",
    headerName: "Touch 1",
    width: 100,
    editable: false,
  },
  {
    field: "touchSensor2",
    headerName: "Touch 2",
    width: 100,
    editable: false,
  },

  {
    field: "internalElectrodermalActivity",
    headerName: "Internal Electrodermal Activity",
    width: 150,
    editable: false,
  },
  {
    field: "externalElectrodermalActivity",
    headerName: "External Electrodermal Activity",
    width: 150,
    editable: false,
  },
  { field: "heartRate", headerName: "Heart Rate", width: 150, editable: false },
  { field: "SpO2", headerName: "SpO2", width: 150, editable: false },
  {
    field: "IMUFrequency",
    headerName: "IMU Frequency",
    width: 150,
    editable: false,
  },
  {
    field: "numIMUSamples",
    headerName: "Number of IMU Samples",
    width: 150,
    editable: false,
  },
  { field: "accelX", headerName: "Accel X", width: 150, editable: false },
  { field: "accelY", headerName: "Accel Y", width: 150, editable: false },
  { field: "accelZ", headerName: "Accel Z", width: 150, editable: false },
  {
    field: "deviceSynced",
    headerName: "Synced to Phone",
    width: 200,
    editable: false,
  },
];
export default function ReadingTable({ data, reload, fileId }: Props) {
  const [selected, setSelected] = React.useState<number[]>([]);
  const deleteSelectedRows = () => {
    console.log("delete selected rows");
    deleteReadings(selected)
      .then((res) => {
        reload();
      })
      .catch((err) => {
        console.log("error", err);
      });
  };
  const exportCSV = () => {
    // Create a csv file
    const headers = Object.keys(data[0]).join(",") + "\n";
    const csv: BlobPart =
      headers + data.map((row) => Object.values(row)).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `${fileId}-${moment().format("DD-MM-YYYY")}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <div>
      <DataGrid
        rows={data}
        density="compact"
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        autoHeight
        pageSizeOptions={[10, 20, 50]}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => {
          setSelected(newSelection as number[]);
        }}
      />
      <Button variant="contained" color="primary" onClick={exportCSV}>
        Export to CSV
      </Button>
      {selected.length > 0 && (
        <Button variant="contained" color="error" onClick={deleteSelectedRows}>
          Delete Selected Rows
        </Button>
      )}
    </div>
  );
}
