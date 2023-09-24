import Patient from "../database/patient.entity";
import getDatabase from "../database/db";
import Device from "../database/device.entity";
import { hash } from "./hashing";

export const getDeviceFromApiKey = async (apiKey: string) => {
  console.log("api key", { apiKey, hashed: hash(apiKey) });
  const db = await getDatabase();
  return await db.getRepository(Device).findOne({
    where: { apiKey: { hashedKey: hash(apiKey) } },
  });
};

export const getCurrentPatientFromDevice = async (deviceId: string) => {
  const db = await getDatabase();
  return await db.getRepository(Patient).findOne({
    where: { deviceUsages: { device: { id: deviceId }, removed: null } },
  });
};
