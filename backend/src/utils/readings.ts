import Device from "../database/device.entity";
import Reading from "../database/reading.entity";

export type CreateReadingType = {
  synced: string;
  message: string;
};

function combineBytes(bytes, from, to) {
  return bytes.subarray(from, to).reduce((a, p) => 256 * a + p, 0);
}

export const decodeReading = (
  reading: CreateReadingType,
  device: Device
): Omit<Reading, "id"> => {
  const buff = Buffer.from(reading.message, "base64");
  console.log(reading.message, buff);
  return {
    deviceSynced: new Date(reading.synced),
    timestamp: new Date(combineBytes(buff, 0, 4) * 1000),
    touchSensor1: !!combineBytes(buff, 8, 10),
    touchSensor2: !!combineBytes(buff, 10, 12),
    heartRate: buff[14],
    battery: buff[4],
    rawData: reading.message,
    device,
  };
};
