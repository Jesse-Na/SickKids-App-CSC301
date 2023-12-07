import { CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import PatientDeviceHistory from "./patient-device-history.entity";
import PatientReport from "./patient-reports.entity";

// The patient entity
@Entity()
export default class Patient {
  // The id of the patient
  @PrimaryColumn()
  id: string;

  // The date at which the patient entity was created
  @CreateDateColumn()
  createdAt: Date;

  // The device history of the patient
  @OneToMany(
    () => PatientDeviceHistory,
    (userDeviceUsage) => userDeviceUsage.patient
  )
  deviceUsages: PatientDeviceHistory[];

  // The reports of the patient
  @OneToMany(() => PatientReport, (report) => report.patient)
  reports: PatientReport[];
}
