import  { useMemo } from "react";
import GraphWrapper from "./GraphWrapper";
import { Scatter, ScatterChart, XAxis, YAxis, Tooltip } from "recharts";
import moment from "moment";

type Props = {
  batteryData: { timestamp: string; battery: number }[];
};

export default function BatteryPercentage({ batteryData }: Props) {
  const shownData = useMemo(() => {
    return batteryData.map((data) => {
      return {
        battery: data.battery,
        time: moment(data.timestamp).diff(moment(), "seconds"),
      };
    });
  }, [batteryData]);
  return (
    <GraphWrapper title="Battery Percentage">
      <ScatterChart
        width={400}
        height={200}
        data={shownData}
        style={{
          marginRight: "auto",
          paddingRight: "60px",
          marginTop: "10px",
        }}
      >
        <Scatter
          isAnimationActive={false}
          type="monotone"
          dataKey="battery"
          stroke="#8884d8"
          line={{ stroke: "red", strokeWidth: 2 }}
          shape={(props) => {
            return (
              <circle
                {...props}
                r={2}
                stroke="#8884d8"
                strokeWidth={1}
                fill="red"
                strokeOpacity={0.5}
              />
            );
          }}
        />
        
        {/* I want the data to show up witht the value from the field time but labeled with the field label */}
        <XAxis
          type="number"
          dataKey="time"
          tickFormatter={(value) => {
            return moment().add(value, "minutes").format("MMM D");
          }}
        />

        <YAxis />

        <Tooltip
          labelFormatter={(value) => {
            return "Battery Reading";
          }}
          formatter={(value) => {
            return moment()
              .add(value as string, "minutes")
              .format("MMM D, h:mm a");
          }}
        />

      </ScatterChart>
    </GraphWrapper>
  );
}
