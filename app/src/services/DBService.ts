import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "sickkidspts.db";

const CREATE_READINGS_TABLE_STATEMENT = `
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(20) NOT NULL,
    message VARCHAR(200) NOT NULL
);
`;

const CREATE_CLOUD_SYNC_INFO_TABLE_STATEMENT = `
CREATE TABLE IF NOT EXISTS cloud_sync_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ble_interface_id VARCHAR(20) UNIQUE NOT NULL,
    device_id VARCHAR(20) UNIQUE NOT NULL,
    last_synced_id INTEGER NOT NULL,
    api_key VARCHAR(20),
    reading_interval INTEGER NOT NULL
);
`;

export type Reading = {
    id: number; // internal id used by database
    synced: string; // ISO string
    device_id: string; // base64 unique id of the device
    message: string; // raw sensor sample from the device, stream of bytes in base64
};

export type CloudSyncInfo = {
    ble_interface_id: string; // MAC address of the BLE interface if Android and UUID if iOS
    device_id: string; // base64 unique id of the device
    last_synced_id: number; // internal id of the last synced reading
    api_key: string | null; // device's api key used to authenticate with the backend
    reading_interval: number; // device's reading interval in seconds
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

    getCloudSyncInfoForDeviceId = async (deviceId: string): Promise<CloudSyncInfo> => {
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

    getCloudSyncInfoForBleInterfaceId = async (bleInterfaceId: string): Promise<CloudSyncInfo> => {
        const db = this.getDatabase();
        return new Promise<CloudSyncInfo>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "SELECT * FROM cloud_sync_info WHERE ble_interface_id = ? LIMIT 1",
                        [bleInterfaceId],
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

    insertCloudSyncInfo = async (cloudSyncInfo: CloudSyncInfo) => {
        const db = this.getDatabase();
        const { ble_interface_id, device_id, last_synced_id, api_key, reading_interval } = cloudSyncInfo;
        return new Promise<void>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "INSERT INTO cloud_sync_info (ble_interface_id, device_id, last_synced_id, api_key, reading_interval) VALUES (?, ?, ?, ?, ?)",
                        [ble_interface_id, device_id, last_synced_id, api_key, reading_interval],
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

    updateCloudSyncInfoForDeviceId = async (cloudSyncInfo: CloudSyncInfo) => {
        const db = this.getDatabase();
        const { ble_interface_id, last_synced_id, api_key, reading_interval, device_id } = cloudSyncInfo;
        return new Promise<void>((resolve, reject) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "UPDATE cloud_sync_info SET ble_interface_id = ?, last_synced_id = ?, api_key = ?, reading_interval = ? WHERE device_id = ?",
                        [ble_interface_id, last_synced_id, api_key, reading_interval, device_id],
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