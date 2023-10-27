import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "sickkidspts.db";

const CREATE_READINGS_TABLE_STATEMENT = `
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(20) NOT NULL,
    message VARCHAR(20) NOT NULL
);
`;

const CREATE_CLOUD_SYNC_INFO_TABLE_STATEMENT = `
CREATE TABLE IF NOT EXISTS cloud_sync_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id VARCHAR(20) NOT NULL,
    last_synced_id INTEGER NOT NULL,
    api_key VARCHAR(20) NOT NULL
);
`;

export type Reading = {
    id: number;
    synced: string;
    device_id: string;
    message: string;
};

export type CloudSyncInfo = {
    id: number;
    device_id: string;
    last_synced_id: number;
    api_key: string;
};

class DBServiceInstance {
    dbConnection: SQLite.WebSQLDatabase;;

    constructor() {
        this.initializeDatabases();
        this.dbConnection = SQLite.openDatabase(DATABASE_NAME);
    }

    initializeDatabases = (): Promise<SQLite.WebSQLDatabase> => {
        console.log("INITIALIZING DATABASES");
        const db = SQLite.openDatabase(DATABASE_NAME);
        return new Promise((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(CREATE_READINGS_TABLE_STATEMENT);
                    tx.executeSql(CREATE_CLOUD_SYNC_INFO_TABLE_STATEMENT);
                },
                reject,
                () => resolve(db)
            );
        });
    };

    getDatabase = (): SQLite.WebSQLDatabase => {
        return this.dbConnection;
    };

    saveReading = async (message: string, deviceId: string) => {
        const db = this.getDatabase();
        return new Promise<Reading>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "INSERT INTO readings (message, device_id) VALUES (?, ?)",
                        [message, deviceId],
                        (_, { insertId, rows }) => {
                            resolve({
                                id: insertId!,
                                synced: new Date().toISOString(),
                                device_id: deviceId,
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

    getReadings = async (deviceId: string, after: number): Promise<Reading[]> => {
        const db = this.getDatabase();
        return new Promise<Reading[]>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "SELECT * FROM readings WHERE device_id = ? AND id > ? ORDER BY id",
                        [deviceId, after],
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

    getCloudSyncInfoForDevice = async (deviceId: string): Promise<CloudSyncInfo> => {
        const db = this.getDatabase();
        return new Promise<CloudSyncInfo>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "SELECT * FROM cloud_sync_info WHERE device_id = ? LIMIT 1",
                        [deviceId],
                        (_, { rows }) => {
                            resolve(rows._array[0]);
                        }
                    );
                },
                (e) => {
                    reject(e);
                }
            );
        });
    }

    insertCloudSyncInfoForDevice = async (deviceId: string, lastSyncedId: number, apiKey: string) => {
        const db = this.getDatabase();
        return new Promise<void>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "INSERT INTO cloud_sync_info (device_id, last_synced_id, api_key) VALUES (?, ?, ?)",
                        [deviceId, lastSyncedId, apiKey],
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
    }

    updateCloudSyncInfoForDevice = async (deviceId: string, lastSyncedId: number, apiKey: string) => {
        const db = this.getDatabase();
        return new Promise<void>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "UPDATE cloud_sync_info SET last_synced_id = ?, api_key = ? WHERE device_id = ?",
                        [lastSyncedId, apiKey, deviceId],
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
    }

    deleteReadings = async (before: number) => {
        const db = this.getDatabase();
        return new Promise<void>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        `DELETE FROM readings WHERE id < ?`,
                        [before],
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

}

export const DBService = new DBServiceInstance();