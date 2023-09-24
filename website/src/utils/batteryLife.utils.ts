import { DeviceReading } from "./types";
import moment from "moment";

export const getBatteryLife = (data: DeviceReading[]) => {
  const validReadings = data.filter((reading) => reading.battery !== undefined);

  const twoWeeksAgo = moment().subtract(2, "weeks").toDate();
  const pastTwoWeeks = validReadings.filter((reading) => {
    return new Date(reading.timestamp) > twoWeeksAgo;
  });
  const readings = pastTwoWeeks.map((reading) => ({
    battery: reading.battery,
    time: moment(reading.timestamp).diff(moment(), "seconds") / 60,
  }));
  // console.log(readings);
  return readings;
};
