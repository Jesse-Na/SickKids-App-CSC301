import { API } from "aws-amplify";
import { Device, DeviceReading, Patient, PatientPreview } from "../utils/types";

export const getAllUsers = () => {
  return API.get("AWSBackend", "/users", {});
};

export const getAllDevices = () => {
  return API.get("AWSBackend", "/devices", {});
};

export const getDevice = (deviceId: string): Promise<Device> => {
  return API.get("AWSBackend", `/device/${deviceId}`, {});
};

export const updateDevice = (
  deviceId: string,
  device: { name: string; interval: number; frequency: number }
): Promise<Device> => {
  return API.put("AWSBackend", `/device/${deviceId}`, { body: device });
};

export const disableDevice = (deviceId: string): Promise<Device> => {
  return API.del("AWSBackend", `/device/${deviceId}`, {});
};

export const getDeviceReadings = (
  deviceId: string
): Promise<DeviceReading[]> => {
  return API.get("AWSBackend", `/readings/${deviceId}`, {});
};

export const deleteReadings = (readingIds: number[]): Promise<void> => {
  return API.del("AWSBackend", `/readings`, {
    body: {
      readings: readingIds,
    },
  });
};

export const getAllAdmins = () => {
  return API.get("AWSCognitoBackend", "/admins", {});
};

export const deleteAdminAccount = (adminId: string) => {
  return API.del("AWSCognitoBackend", `/admins/${adminId}`, {});
};

export const createAdminAccount = (email: string) => {
  return API.post("AWSCognitoBackend", `/admins`, {
    body: {
      email: email,
    },
  });
};

export const getAllPatients = (): Promise<PatientPreview[]> => {
  return API.get("AWSBackend", "/patients", {});
};

export const getPatient = (patientId: string): Promise<Patient> => {
  return API.get("AWSBackend", `/patient/${patientId}`, {});
};

export const getPatientReadings = (
  patientId: string
): Promise<DeviceReading[]> => {
  return API.get("AWSBackend", `/patientReadings/${patientId}`, {});
};

export const getPatientDailyUsage = (
  patientId: string,
  numDays: number
): Promise<{ date: string; count: number }[]> => {
  return API.get(
    "AWSBackend",
    `/patient/${patientId}/dailyUsage?numDays=${numDays}`,
    {}
  );
};

export const getPatientBattery = (
  patientId: string,
  numDays: number
): Promise<{ timestamp: string; battery: number }[]> => {
  return API.get(
    "AWSBackend",
    `/patient/${patientId}/battery?numDays=${numDays}`,
    {}
  );
};

export const getPatientReports = (
  patientId: string
): Promise<{ date: string; minutes: number | null }[]> => {
  return API.get("AWSBackend", `/patient/${patientId}/reports`, {});
};
