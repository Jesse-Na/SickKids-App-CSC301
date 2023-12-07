import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Device from "./device.entity";

// The reading entity
@Entity()
export default class Reading {
  // The id of the reading
  @PrimaryGeneratedColumn()
  id: number;

  // The timestamp of the reading
  @Column()
  timestamp: Date;

  // The date at which the data was synced from the device to the mobile app
  @Column()
  deviceSynced: Date;

  // The battery percentage when the reading was taken
  @Column()
  battery: number;

  // Whether or not touch sensor 1 was activated
  @Column()
  touchSensor1: boolean;

  // Whether or not touch sensor 2 was activated
  @Column()
  touchSensor2: boolean;

  // The heart rate reported in the reading
  @Column()
  heartRate: number;

  @Column("varchar", { length: 400 })
  rawData: string

  // The device that the reading corresponds to
  @ManyToOne(() => Device, (device) => device.readings)
  device: Device;
}
