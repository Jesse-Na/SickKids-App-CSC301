import AsyncStorage from "@react-native-async-storage/async-storage";
import { BLEAsyncStorage, BLEMessage, BLEDevice } from "../ble.types";
import { DEFAULT_READ_INTERVAL } from "../constants";

export const getStorage = async (): Promise<BLEAsyncStorage> => {
  const storage = await AsyncStorage.getItem("bleStorage");
  if (storage) {
    return JSON.parse(storage);
  } else {
    return {
      activeDeviceId: null,
      savedDevices: [],
      lastMessage: null,
      lastSyncedToCloud: null,
      lastConnected: null,
      lastDisconnected: null,
    };
  }
};

export const saveDeviceToStorage = async (
  device: BLEDevice,
  isActive: boolean
): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const currentDevice = storage.savedDevices.find(
    (d) => d.deviceId === device.deviceId
  );
  const newDevice = {
    ...device,
    apiKey: null,
    readInterval: currentDevice?.readInterval ?? DEFAULT_READ_INTERVAL,
  };
  const newStorage: BLEAsyncStorage = {
    ...storage,
    activeDeviceId: isActive ? device.deviceId : storage.activeDeviceId,
    savedDevices: [
      ...storage.savedDevices.filter((d) => d.deviceId !== device.deviceId),
      newDevice,
    ],
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const removeDeviceFromStorage = async (
  deviceId: string
): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const newStorage: BLEAsyncStorage = {
    ...storage,
    activeDeviceId:
      storage.activeDeviceId === deviceId ? null : storage.activeDeviceId,
    savedDevices: [
      ...storage.savedDevices.filter((d) => d.deviceId !== deviceId),
    ],
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const setLastMessage = async (
  message: BLEMessage | null
): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const newStorage: BLEAsyncStorage = {
    ...storage,
    lastMessage: message,
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const syncToCloud = async (
  deviceId: string,
  newInterval: number
): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const newStorage: BLEAsyncStorage = {
    ...storage,
    lastSyncedToCloud: new Date().toISOString(),
    savedDevices: storage.savedDevices.map((d) =>
      d.deviceId === deviceId ? { ...d, readInterval: newInterval } : d
    ),
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const connectDevice = async (
  device: BLEDevice,
  apiKey: string | null
): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const currentDevice = storage.savedDevices.find(
    (d) => d.deviceId === device.deviceId
  );
  const newDevice = {
    ...device,
    apiKey: apiKey,
    readInterval: currentDevice?.readInterval ?? DEFAULT_READ_INTERVAL,
  };
  const newStorage: BLEAsyncStorage = {
    ...storage,
    activeDeviceId: device.deviceId,
    lastConnected: new Date().toISOString(),
    savedDevices: [
      ...storage.savedDevices.filter((d) => d.deviceId !== device.deviceId),
      newDevice,
    ],
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const setDeviceInterval = async (deviceId: string, interval: number) => {
  const storage = await getStorage();
  const newStorage: BLEAsyncStorage = {
    ...storage,
    savedDevices: storage.savedDevices.map((d) =>
      d.deviceId === deviceId ? { ...d, readInterval: interval } : d
    ),
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const setLastDisconnected = async (
  timestamp: string | null
): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const newStorage: BLEAsyncStorage = {
    ...storage,
    lastDisconnected: timestamp,
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const disconnectDevice = async (): Promise<BLEAsyncStorage> => {
  const storage = await getStorage();
  const newStorage: BLEAsyncStorage = {
    ...storage,
    activeDeviceId: null,
    lastDisconnected: new Date().toISOString(),
  };
  await AsyncStorage.setItem("bleStorage", JSON.stringify(newStorage));
  return newStorage;
};

export const getActiveDevice = async (): Promise<BLEDevice | null> => {
  const storage = await getStorage();
  const activeDevice = storage.activeDeviceId
    ? storage.savedDevices.find((d) => d.deviceId === storage.activeDeviceId) ??
      null
    : null;
  return activeDevice;
};
