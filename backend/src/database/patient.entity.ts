import { CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import PatientDeviceHistory from "./patient-device-history.entity";
import PatientReport from "./patient-reports.entity";

@Entity()
export default class Patient {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => PatientDeviceHistory,
    (userDeviceUsage) => userDeviceUsage.patient
  )
  deviceUsages: PatientDeviceHistory[];

  @OneToMany(() => PatientReport, (report) => report.patient)
  reports: PatientReport[];
}
