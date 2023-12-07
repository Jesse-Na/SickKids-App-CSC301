export const DEVICE_TO_SERVER_BATCH_SIZE = 25; // In number of readings

export const BACKEND_ADMIN_URL = "https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/admin";
export const BACKEND_USER_URL = "https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/users";
export const BACKEND_REGION = "ca-central-1";
export const BACKEND_USER_POOL_ID = "ca-central-1_heZehJBfQ";
export const BACKEND_USER_POOL_CLIENT_ID = "37ok0fbe88evr31re50r6m0rpg";

export const MIN_RSSI = -80;
export const DEFAULT_MTU_SIZE = 251; // In bytes

export const DATA_SYNC_INTERVAL = 30000; // In milliseconds
export const DEFAULT_READ_INTERVAL = 60000; // In seconds, unsigned 2 bytes
export const MAX_SCAN_DURATION = 10000; // In milliseconds
export const FRAGMENT_INDEX_SIZE = 2; // In bytes
export const READING_SAMPLE_LENGTH = 170; // In bytes
export const DATA_TRANSFER_FIN_CODE = 0XFFFF;
export const DATA_TRANSFER_TIMEOUT = 30000; // In milliseconds
export const DATA_TRANSFER_ACK_INTERVAL = 1000; // In milliseconds
export const DATA_TRANSFER_START_CODE = 0x00;
export const DATA_TRANSFER_OK_CODE = 0x01;
export const DATA_TRANSFER_OUT_OF_ORDER_CODE = 0X02;

export const TRANSFER_SERVICE_UUID = "906404A1-F555-48F5-90AA-EA4A691B82DB";
export const STATUS_CHARACTERISTIC_UUID = "906404A2-F555-48F5-90AA-EA4A691B82DB";
export const DATA_COMMUNICATION_CHARACTERISTIC_UUID = "906404A3-F555-48F5-90AA-EA4A691B82DB";
export const RAW_DATA_CHARACTERISTIC_UUID = "906404A4-F555-48F5-90AA-EA4A691B82DB";

export const CONFIGURATION_SERVICE_UUID = "920927B1-101E-442C-AA2D-3976829777BA";
export const CURRENT_TIME_CHARACTERISTIC_UUID = "920927B2-101E-442C-AA2D-3976829777BA";
export const UNIQUE_DEVICE_ID_CHARACTERISTIC_UUID = "920927B3-101E-442C-AA2D-3976829777BA";
export const API_KEY_CHARACTERISTIC_UUID = "920927B4-101E-442C-AA2D-3976829777BA";
export const READING_INTERVAL_CHARACTERISTIC_UUID = "920927B5-101E-442C-AA2D-3976829777BA";

