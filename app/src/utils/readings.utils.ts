import { MTU_SIZE } from "../ble/constants";
import { DeviceReading, DeviceReadingDB } from "./types";

function convertStringToByteArray(str: string) {
  var bytes = [];
  for (var i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  while (bytes.length < MTU_SIZE - 3) {
    bytes.push(0);
  }
  return bytes;
}

function combineBytes(bytes: number[], from: number, to: number) {
  return bytes.slice(from, to).reduce((a, p) => 256 * a + p, 0);
}

export const decodeReading = (reading: DeviceReadingDB): DeviceReading => {
  const byteArray = convertStringToByteArray(reading.data);
  return {
    id: reading.id,
    deviceId: reading.deviceId,
    deviceSynced: new Date(reading.deviceSynced).toISOString(),
    timestamp: new Date(combineBytes(byteArray, 0, 4) * 1000).toISOString(),
    touchSensor1: byteArray[4],
    touchSensor2: byteArray[5],
    battery: (byteArray[6] * 100) / 255,
  };
};
