import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Reading from "./reading.entity";
import UserDeviceUsage from "./user-device.entity";

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

  @OneToMany(() => UserDeviceUsage, (userDevice) => userDevice.device)
  users: UserDeviceUsage[];

  @OneToMany(() => Reading, (reading) => reading.device)
  readings: Reading[];
}
