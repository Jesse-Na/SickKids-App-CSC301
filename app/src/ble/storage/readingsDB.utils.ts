import * as SQLite from "expo-sqlite";

const database_name = "sickkidspts.db";

const CREATE_READINGS_TABLE = `
CREATE TABLE IF NOT EXISTS readings (
   id INTEGER PRIMARY KEY AUTOINCREMENT, 
   synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deviceId TEXT NOT NULL,
    message TEXT NOT NULL
);
`;

export type Reading = {
  id: number;
  synced: string;
  deviceId: string;
  message: string;
};

const initializeDatabases = (): Promise<SQLite.WebSQLDatabase> => {
  console.log("INITIALIZING DATABASES");
  const db = SQLite.openDatabase(database_name);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(CREATE_READINGS_TABLE);
      },
      reject,
      () => resolve(db)
    );
  });
};
const getDatabase = (): SQLite.WebSQLDatabase => {
  const db = SQLite.openDatabase(database_name);
  return db;
};

export const saveReading = async (message: string, deviceId: string) => {
  const db = getDatabase();
  return new Promise<Reading>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "INSERT INTO readings (message, deviceId) VALUES (?, ?)",
          [message, deviceId],
          (_, { insertId, rows }) => {
            resolve({
              id: insertId!,
              synced: new Date().toISOString(),
              deviceId,
              message,
            });
          }
        );
      },
      (e) => {
        reject(e);
      }
    );
  });
};

export const getReadings = async (deviceId: string): Promise<Reading[]> => {
  const db = getDatabase();
  return new Promise<Reading[]>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "SELECT * FROM readings WHERE deviceId = ? ORDER BY id LIMIT 20",
          [deviceId],
          (_, { rows }) => {
            resolve(rows._array);
          }
        );
      },
      (e) => {
        reject(e);
      }
    );
  });
};

export const deleteReadings = async (ids: number[]) => {
  const db = getDatabase();
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM readings WHERE id IN (${ids.join(",")})`,
          [],
          (_, { rows }) => {
            resolve();
          }
        );
      },
      (e) => {
        reject(e);
      }
    );
  });
};

export default {
  initializeDatabases,
  getDatabase,
  saveReading,
  getReadings,
  deleteReadings,
};
