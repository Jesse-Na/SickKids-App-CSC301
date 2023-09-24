import { CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import UserDeviceUsage from "./user-device.entity";
import PatientReport from "./patient-reports.entity";

@Entity()
export default class Patient {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => UserDeviceUsage,
    (userDeviceUsage) => userDeviceUsage.patient
  )
  deviceUsages: UserDeviceUsage[];

  @OneToMany(() => PatientReport, (report) => report.patient)
  reports: PatientReport[];
}
