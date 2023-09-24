import { Device } from "react-native-ble-plx";

export interface DeviceData extends Device {
  key?: string;
  status?: string;
}

export type DeviceReading = {
  deviceId: string;
  timestamp: string;
  touchSensor1?: number;
  touchSensor2?: number;
  battery?: number;
  internalElectrodermalActivity?: number;
  externalElectrodermalActivity?: number;
  heartRate?: number;
  SpO2?: number;
  IMUFrequency?: number;
  numIMUSamples?: number;
  accelX?: number[];
  accelY?: number[];
  accelZ?: number[];
  deviceSynced?: string;
  id?: number;
};

export type DeviceReadingDB = {
  deviceId: string;
  data: string;
  deviceSynced: string;
  id: number;
};
