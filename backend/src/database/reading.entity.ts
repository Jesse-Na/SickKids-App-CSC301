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
  battery: number;

  @Column()
  touchSensor1: boolean;

  @Column()
  touchSensor2: boolean;

  @Column()
  heartRate: number;

  @Column("varchar", { length: 200 })
  rawData: string

  @ManyToOne(() => Device, (device) => device.readings)
  device: Device;
}
