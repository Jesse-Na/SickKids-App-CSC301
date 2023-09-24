import Patient from "../database/patient.entity";
import getDatabase from "../database/db";
import Device from "../database/device.entity";
import APIKey from "../database/api-key.entity";
import * as hashing from "./hashing";

const DEFUALT_INTERVAL = 60000;

export const getOrRegisterPatient = async (patientId: string) => {
  const db = await getDatabase();
  const patient = await db
    .getRepository(Patient)
    .findOne({ where: { id: patientId } });
  if (patient) return patient;
  const newPatient = db.getRepository(Patient).create({
    id: patientId,
  });
  return await db.getRepository(Patient).save(newPatient);
};

export const getOrCreateDevice = async (deviceId: string) => {
  const db = await getDatabase();
  const device = await db.getRepository(Device).findOne({
    where: { id: deviceId },
    relations: { apiKey: true, users: { patient: true } },
  });
  if (device) return device;
  const newDevice = db.getRepository(Device).create({
    id: deviceId,
    name: deviceId,
    interval: DEFUALT_INTERVAL,
  });
  return await db.getRepository(Device).save(newDevice);
};

export const generateAPIKey = async (device: Device) => {
  const db = await getDatabase();
  const newKey = hashing.generateKey();
  const newKeyEntity = db.getRepository(APIKey).create({
    hashedKey: newKey.hashedKey,
    device,
  });
  await db.getRepository(APIKey).save(newKeyEntity);
  return newKey.key;
};
