import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Device from "./device.entity";
import Patient from "./patient.entity";

// The patient device pairing history entity
@Entity()
export default class PatientDeviceHistory {
  // The id of the patient device pairing
  @PrimaryGeneratedColumn()
  id: number;

  // The date at which the patient device pairing was created
  @CreateDateColumn()
  created: Date;

  // The date at which the patient device pairing was "removed" (no longer active), null if active
  @Column({ type: "timestamp", nullable: true })
  removed: Date;

  // The patient in the patient device pairing
  @ManyToOne(() => Patient, (patient) => patient.deviceUsages)
  patient: Patient;

  // The device in the patient device pairing
  @ManyToOne(() => Device, (device) => device.patientHistory)
  device: Device;
}
