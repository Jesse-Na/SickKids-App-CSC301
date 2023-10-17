import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export default class APIKey {
  @PrimaryGeneratedColumn("uuid")
  apiKeyValue: string;

  @CreateDateColumn()
  createdAt: Date;
}
