import React, { useEffect, useMemo, useState } from "react";
import GraphWrapper from "./GraphWrapper";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import moment from "moment";
import { Button } from "@mui/material";

type Props = {
  patientId: string;
  patientUsage: { date: string; minutes: number | null }[];
};

// hard code my a text example for patientUsage
const dev = true;
const test_patientUsage = [
  { date: "2021-10-01", minutes: 10 },
  { date: "2021-10-02", minutes: 20 },
  { date: "2021-10-03", minutes: 30 },
  { date: "2021-10-04", minutes: 40 },
  { date: "2021-10-05", minutes: 50 },
  { date: "2021-10-06", minutes: 60 },
  { date: "2021-10-07", minutes: 70 },
  { date: "2021-10-08", minutes: 80 },
  { date: "2021-10-09", minutes: 90 },
  { date: "2021-10-10", minutes: 100 },
];

export default function PatientUsage({ patientId, patientUsage = test_patientUsage }: Props) {
  // for testing purposes solely
  if (patientUsage.length === 0 && dev === true) {
    patientUsage = test_patientUsage;
  }

  const formatted = useMemo(
    () =>
      patientUsage.map((p) => ({
        date: p.date,
        minutes: p.minutes === null ? "No report" : p.minutes,
      })),
    [patientUsage]
  );

  // export the patients chart to csv
  const exportCSV = () => {
    // Create a csv file
    const parsedPatientUsage = patientUsage.map((p) => {
      const minutes = p.minutes === null ? 0 : p.minutes;
      return {
        date: p.date,
        minutes
      }
    });

    // convert to csv
    const headers = ["Date", "Minutes"].join(",") + "\n";
    const csv: BlobPart =
      headers + parsedPatientUsage.map((row) => Object.values(row)).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `${patientId}-${moment().format("DD-MM-YYYY")}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <GraphWrapper title="Minutes Reported">
      <BarChart
        width={Math.min(400, patientUsage.length * 125)}
        height={200}
        data={formatted}
        style={{
          marginRight: "auto",
          paddingRight: "60px",
          marginTop: "10px",
        }}
      >
        <Bar dataKey="minutes" fill="#8884d8" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            return moment(value).format("MMM D");
          }}
        />
        <YAxis />
        <Tooltip />
      </BarChart>
      <Button onClick={exportCSV}>EXPORT TO CSV</Button>
    </GraphWrapper>
  );
}
