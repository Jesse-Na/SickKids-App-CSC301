import { fullUUID } from "react-native-ble-plx";

export const DEVICE_TO_SERVER_BATCH_SIZE = 25;

export const MIN_RSSI = -80;
export const MTU_SIZE = 250;

export const DEFAULT_READ_INTERVAL = 60000;
export const MAX_SCAN_DURATION = 10000;

export const DATA_USAGE_SERVICE = "0000ef41-0000-1000-8000-00805f9b34fb";
export const DEVICE_CONFIGURATION_SERVICE = fullUUID("DA34");
export const CURRENT_TIME_SERVICE = fullUUID("1805");
export const SECURITY_SERVICE = "ef340000-0000-0000-0000-000000000000";

export const API_KEY_CHARACTERISTIC = "0000ccad-8e22-4541-9d4c-21edae82ed19";
export const DEVICE_UNIQUE_ID_CHARACTERISTIC = "00005bdf-8e22-4541-9d4c-21edae82ed19";
export const READ_INTERVAL_CHARACTERISTIC = fullUUID("C071");
export const DATA_CHARACTERISTIC = "00000000-8e22-4541-9d4c-21edae82ed19";
export const CURRENT_TIME_CHARACTERISTIC = fullUUID("2A2B");

