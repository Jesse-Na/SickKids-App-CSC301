import Patient from "../database/patient.entity";
import getDatabase from "../database/db";
import Device from "../database/device.entity";
import APIKey from "../database/api-key.entity";
import * as hashing from "./hashing";

const DEFAULT_INTERVAL = 60000;

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
    relations: { patientHistory: { patient: true } },
  });
  if (device) return device;
  const newDevice = db.getRepository(Device).create({
    id: deviceId,
    name: deviceId,
    interval: DEFAULT_INTERVAL,
  });
  return await db.getRepository(Device).save(newDevice);
};

export const getOrCreateAPIKey = async () => {
  const db = await getDatabase();
  
  if (await db.getRepository(APIKey).count() == 0) {
    const newKeyEntity = db.getRepository(APIKey).create({});
    await db.getRepository(APIKey).save(newKeyEntity);
  }  

  const apiKeyEntity = await db.getRepository(APIKey).findOne({
    order: { createdAt: "DESC"}
  });
  return apiKeyEntity.apiKeyValue
};
