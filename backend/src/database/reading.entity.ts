import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Device from "./device.entity";

@Entity()
export default class Reading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column()
  deviceSynced: Date;

  @Column()
  touchSensor1: boolean;

  @Column()
  touchSensor2: boolean;

  @Column()
  battery: number;

  @Column()
  accelX: number;

  @Column()
  accelY: number;

  @Column()
  accelZ: number;

  @ManyToOne(() => Device, (device) => device.readings)
  device: Device;
}
