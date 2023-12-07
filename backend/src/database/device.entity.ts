import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Reading from "./reading.entity";
import PatientDeviceHistory from "./patient-device-history.entity";

// The device entity
@Entity()
export default class Device {
  // The id of the device
  @PrimaryColumn()
  id: string;

  // The name of the device
  @Column()
  name: string;

  // The reading interval of the device
  @Column()
  interval: number;

  // The questionnaire frequency of the device
  @Column()
  frequency: number;

  // The date at which this device entity was created
  @CreateDateColumn()
  createdAt: Date;
  
  // The patient history of the device
  @OneToMany(() => PatientDeviceHistory, (userDevice) => userDevice.device)
  patientHistory: PatientDeviceHistory[];

  // The readings of the device
  @OneToMany(() => Reading, (reading) => reading.device)
  readings: Reading[];
}
