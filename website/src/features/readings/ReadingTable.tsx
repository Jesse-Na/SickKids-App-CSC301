import React from "react";
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

  {
    field: "deviceSynced",
    headerName: "Synced to Phone",
    width: 200,
    editable: false,
  },

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

  { field: "heartRate", headerName: "Heart Rate", width: 150, editable: false },

  {
    field: "rawData",
    headerName: "Raw Data",
    width: 500,
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
    const headers = ["Timestamp", "Device Synced", "Raw Data"].join(",") + "\n";
    const csv: BlobPart =
      headers + data.map((row) => [row.timestamp, row.deviceSynced, row.rawData]).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `${fileId}-readings-${moment().format("DD-MM-YYYY")}.csv`
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

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={exportCSV}
          style={{ marginTop: "20px" }} // You can also apply the margin directly to the button if preferred
        >
          Export to CSV
        </Button>
      </div>

      {selected.length > 0 && (
        <Button variant="contained" color="error" onClick={deleteSelectedRows}>
          Delete Selected Rows
        </Button>
      )}
    </div>
  );
}
