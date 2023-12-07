import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

// We will only have a singular API key generated at any given point in time
@Entity()
export default class APIKey {
  // The value of the singular API key 
  @PrimaryGeneratedColumn("uuid")
  apiKeyValue: string;

  // The date at which the API key was created
  @CreateDateColumn()
  createdAt: Date;
}
