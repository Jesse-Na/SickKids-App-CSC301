import GraphWrapper from "./GraphWrapper";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";
import moment from "moment";

type Props = {
  readingData: { date: string; count: number }[];
};

export default function ReadingsPerDay({ readingData }: Props) {
  return (
    <GraphWrapper title="Readings per day">
      <BarChart
        width={Math.min(400, readingData.length * 125)}
        height={200}
        data={readingData}
        style={{
          marginRight: "auto",
          paddingRight: "60px",
          marginTop: "10px",
        }}
      >
        <Bar dataKey="count" fill="#8884d8" />
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
