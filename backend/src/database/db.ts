import { DataSource, DataSourceOptions } from "typeorm";

import dotenv from "dotenv";
dotenv.config();

const datasourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + "/../**/*.entity.js"],
  synchronize: true,
  ...(process.env.NODE_ENV === "development"
    ? {}
    : {
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
};

let connection: DataSource | null = null; // Declare a variable to hold the TypeORM connection

// Function to create the TypeORM connection
export default async function createTypeORMConnection(): Promise<DataSource> {
  console.log("Checking for existing connection...", !!connection);
  if (!connection) {
    console.log("Creating new connection...", datasourceOptions);
    try {
      connection = new DataSource(datasourceOptions);
      await connection.initialize();
      console.log("Connected to RDS instance");
    } catch (error) {
      console.log("Error connecting to RDS instance:", error);
      throw error;
    }
  }

  return connection;
}
