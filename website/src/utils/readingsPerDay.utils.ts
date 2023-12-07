import { DeviceReading } from "./types";
export const getReadingsPerDay = (data: DeviceReading[]) => {
  
  // get format [{"2021-03-01":1,"2021-03-02":2}]
  const timeWorn = data.reduce((acc: any, reading) => {
    const date = reading.timestamp?.split("T")[0] ?? 0;
    if (acc[date]) {
      acc[date] += 1;
    } else {
      acc[date] = 1;
    }
    return acc;
  }, {});

  /*
  convert to this format
  [{date:2021-03-01, min:1}, {date:2021-03-02, min:2}]
  */
  const timeWornArray = Object.keys(timeWorn)
    .map((date) => {
      return { date, readings: timeWorn[date] };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return timeWornArray.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};
