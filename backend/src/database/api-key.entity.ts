import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Device from "./device.entity";

@Entity()
export default class APIKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hashedKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Device, (device) => device.apiKey)
  @JoinColumn()
  device: Device;
}
