import React, { useEffect, useMemo, useState } from "react";
import GraphWrapper from "./GraphWrapper";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import moment from "moment";

type Props = {
  patientUsage: { date: string; minutes: number | null }[];
};

export default function PatientUsage({ patientUsage }: Props) {
  const formatted = useMemo(
    () =>
      patientUsage.map((p) => ({
        date: p.date,
        minutes: p.minutes === null ? "No report" : p.minutes,
      })),
    [patientUsage]
  );
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
    </GraphWrapper>
  );
}
