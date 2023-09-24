import moment from "moment";
import { DeviceReading } from "./types";

export type WearUsage = {
  touchSensor1: string;
  touchSensor2: string;
  time: number;
};

export const getWearUsage = (data: DeviceReading[]): WearUsage[] => {
  return data
    .map((reading) => ({
      touchSensor1: !!reading.touchSensor1 ? "ON" : "OFF",
      touchSensor2: !!reading.touchSensor2 ? "ON" : "OFF",
      time: moment(reading.timestamp).diff(moment(), "seconds") / 60,
    }))
    .sort((a, b) => a.time - b.time);
};

export const getTimeWorn = (wearUsageData: WearUsage[]) => {
  if (!wearUsageData.length) return 0;
  let amt = 0;
  for (let i = 0; i < wearUsageData.length - 1; i++) {
    if (
      wearUsageData[i].touchSensor1 === "ON" &&
      wearUsageData[i + 1].touchSensor1 === "ON"
    ) {
      console.log(wearUsageData[i + 1].time, wearUsageData[i].time);
      amt += wearUsageData[i + 1].time - wearUsageData[i].time;
    }
  }
  return Math.round(amt);
};
