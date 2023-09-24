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
  id: number;
};

export type Admin = {
  created: string;
  email: string;
  email_verified: boolean;
  lastModified: string;
  username: string;
  status: string;
};

export type Device = {
  id: string;
  interval: number;
  lastReset: string | null;
  lastSynced: string | null;
  name: string;
  user: string | null;
};

export type PatientPreview = {
  id: string;
  createdAt: string;
  removedAt: string | null;
  activeDevice: {
    id: string;
    interval: number;
    name: string;
    createdAt: string;
  } | null;
};

export type Patient = {
  id: string;
  createdAt: string;
  removedAt: string | null;
  activeDevice: {
    id: string;
    interval: number;
    name: string;
    createdAt: string;
  } | null;
};
