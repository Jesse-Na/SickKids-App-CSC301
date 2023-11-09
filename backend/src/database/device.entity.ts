import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Reading from "./reading.entity";
import PatientDeviceHistory from "./patient-device-history.entity";

@Entity()
export default class Device {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  interval: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PatientDeviceHistory, (userDevice) => userDevice.device)
  patientHistory: PatientDeviceHistory[];

  @OneToMany(() => Reading, (reading) => reading.device)
  readings: Reading[];
}
