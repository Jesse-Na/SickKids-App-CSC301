import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import Patient from "./patient.entity";

@Entity()
export default class PatientReport {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  date: string;

  @Column()
  minutesWorn: number;

  @ManyToOne(() => Patient, (patient) => patient.reports)
  patient: Patient;
}
