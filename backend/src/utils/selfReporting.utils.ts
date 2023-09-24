import PatientReport from "../database/patient-reports.entity";
import getDatabase from "../database/db";

export const getCurrentPatientReports = async (deviceId: string) => {
  const db = await getDatabase();
  const patientReports = await db
    .getRepository(PatientReport)
    .createQueryBuilder("report")
    .leftJoin("report.patient", "patient")
    .leftJoin("patient.deviceUsages", "deviceUsages")
    .where("deviceUsages.removed IS NULL")
    .leftJoin("deviceUsages.device", "device")
    .andWhere("device.id = :id", { id: deviceId })
    .getMany();
  return patientReports;
};
