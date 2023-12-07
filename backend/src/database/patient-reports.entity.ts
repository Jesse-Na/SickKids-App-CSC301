import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Patient from "./patient.entity";

// The patient report entity
@Entity()
export default class PatientReport {
  // The id of the patient report
  @PrimaryGeneratedColumn()
  id: string;

  // The date at which the patient report entity was created
  @CreateDateColumn()
  createdAt: Date;

  // The date at which the patient report was completed (they can be submitted retroactively)
  @Column()
  date: string;

  // The field in the patient report indicating the number of minutes the garment was worn
  @Column()
  minutesWorn: number;

  // The patient corresponding to the patient report
  @ManyToOne(() => Patient, (patient) => patient.reports)
  patient: Patient;
}
