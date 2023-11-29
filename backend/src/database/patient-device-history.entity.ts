import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Device from "./device.entity";
import Patient from "./patient.entity";

@Entity()
export default class PatientDeviceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column({ type: "timestamp", nullable: true })
  removed: Date;

  @ManyToOne(() => Patient, (patient) => patient.deviceUsages)
  patient: Patient;

  @ManyToOne(() => Device, (device) => device.patientHistory)
  device: Device;
}
