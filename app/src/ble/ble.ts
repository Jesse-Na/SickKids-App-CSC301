import base64 from "react-native-base64";
import { BLEState } from "@BLE/ble.types";
import { BLEAsyncStorage, BLEDevice, NewBLEMessage } from "./ble.types";
import * as STORAGE from "./storage/asyncStorage.utils";
import {
  API_KEY_CHARACTERISTIC,
  DEVICE_UNIQUE_ID_CHARACTERISTIC,
} from "./constants";
import * as MANAGER from "./bleManager";
import READINGS from "./storage/readingsDB.utils";
import { API } from "aws-amplify";

let syncTimeout: NodeJS.Timeout | null = null;
const syncToBackend = (
  deviceId: string,
  apiKey: string,
  onStorageUpdate: (storage: BLEAsyncStorage) => void
) => {
  console.log("syncing to backend");
  if (!!syncTimeout) return;
  console.log("setting timeout");
  syncTimeout = setTimeout(() => {
    syncTimeout = null;
    READINGS.getReadings(deviceId).then((readings) => {
      console.log(
        "sending readings to server",
        readings.map((r) => r.id)
      );
      API.post("UserBackend", "/readings", {
        body: readings.map((r) => ({
          synced: r.synced,
          message: r.message,
        })),
        queryStringParameters: {
          apiKey: apiKey,
        },
      })
        .then(({ interval }) => {
          READINGS.deleteReadings(readings.map((r) => r.id));
          STORAGE.syncToCloud(deviceId, interval).then(onStorageUpdate);
          if (readings.length === 20) {
            syncToBackend(deviceId, apiKey, onStorageUpdate);
          }
        })
        .catch((e) => {
          console.log("failed to sync", e);
        });
    });
  }, 10000);
};

const onNotification = (
  message: NewBLEMessage,
  onStorageUpdate: (storage: BLEAsyncStorage) => void
) => {
  console.log("New Message", message);
  READINGS.saveReading(message.value, message.deviceId).then((dbReading) => {
    console.log("Saved reading", dbReading.id);
    STORAGE.setLastMessage({ ...message, id: dbReading.id }).then((storage) => {
      onStorageUpdate(storage);
      const apiKey = storage.savedDevices.find(
        (d) => d.deviceId === message.deviceId
      )?.apiKey;
      if (!apiKey) return;
      syncToBackend(message.deviceId, apiKey, onStorageUpdate);
    });
  });
};

const onDeviceUpdate = (
  device: BLEDevice,
  onStorageUpdate: (storage: BLEAsyncStorage) => void
) => {
  STORAGE.saveDeviceToStorage(device, false).then(onStorageUpdate);
};

const setInterval = (
  deviceId: string,
  interval: number,
  onStorageUpdate: (storage: BLEAsyncStorage) => void
) => {
  STORAGE.setDeviceInterval(deviceId, interval).then(onStorageUpdate);
};

const connectDevice = (
  device: BLEDevice,
  onStorageUpdate: (storage: BLEAsyncStorage, bleState?: BLEState) => void,
  setBLEState: (state: BLEState) => void
) => {
  STORAGE.saveDeviceToStorage(device, true).then(onStorageUpdate);
  console.log("Connecting to device", device);
  MANAGER.selectDevice(
    device,
    (message) => onNotification(message, onStorageUpdate),
    (device) => onDeviceUpdate(device, onStorageUpdate),
    setBLEState,
    (device: BLEDevice, apiKey: string | null) => {
      console.log("Connected with api key", apiKey);
      STORAGE.connectDevice(device, apiKey).then((storage) => {
        onStorageUpdate(storage, "connected");
        API.get("UserBackend", "/interval", {
          queryStringParameters: {
            apiKey,
          },
        })
          .then((interval) => {
            console.log("updating interval", interval);
            //TODO send to device
            STORAGE.setDeviceInterval(device.deviceId, parseInt(interval)).then(
              onStorageUpdate
            );
          })
          .catch()
          .finally(() => setBLEState("connected"));
      });
    },
    () => {
      STORAGE.setLastDisconnected(new Date().toISOString()).then((newStorage) =>
        onStorageUpdate(newStorage, "disconnected")
      );
    }
  );
};

const disconnectDevice = (
  deviceId: string,
  onStorageUpdate: (storage: BLEAsyncStorage, bleState?: BLEState) => void
) => {
  MANAGER.disconnect(deviceId);
  STORAGE.disconnectDevice().then((newStorage) =>
    onStorageUpdate(newStorage, "disconnected")
  );
};
const forgetDevice = (
  deviceId: string,
  onStorageUpdate: (storage: BLEAsyncStorage) => void
) => {
  MANAGER.disconnect(deviceId);
  STORAGE.removeDeviceFromStorage(deviceId).then(onStorageUpdate);
};

const registerActiveDevice = async (
  bleState: BLEState,
  onStorageUpdate: (storage: BLEAsyncStorage) => void,
  userId?: string
) => {
  const { activeDeviceId, savedDevices } = await STORAGE.getStorage();
  const activeDevice = savedDevices.find((d) => d.deviceId === activeDeviceId);
  if (!activeDeviceId || !activeDevice || bleState !== "connected") {
    throw new Error("No device connected");
  }

  const characteristics = await MANAGER.getWriteableCharacteristics(
    activeDeviceId
  );

  const deviceUniqueIdCharacteristic = characteristics.find((c) =>
    c.characteristicUUID
      .toLowerCase()
      .startsWith(DEVICE_UNIQUE_ID_CHARACTERISTIC.toLowerCase())
  );

  console.log(characteristics.map((c) => c.characteristicUUID));

  if (!deviceUniqueIdCharacteristic) throw new Error("No id characteristic");
  const uniqueId = await MANAGER.readCharacteristic(
    deviceUniqueIdCharacteristic
  );
  if (!uniqueId) throw new Error("Could not read id characteristic");

  const raw = base64.decode(uniqueId);
  let hexId = "";
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16).toUpperCase();
    hexId += hex.length === 2 ? hex : "0" + hex;
  }
  console.log("id", hexId);

  let apiKey = null;
  try {
    const response = await API.post("AdminBackend", "/register-device", {
      body: { deviceId: hexId, userId },
    });
    console.log("Response", response);
    apiKey = response;
  } catch (e) {
    console.log("sending failed", { deviceId: hexId, userId }, e);
    throw new Error("Failed to register with backend");
  }

  const bleCharacteristc = characteristics.find((c) =>
    c.characteristicUUID
      .toLowerCase()
      .startsWith(API_KEY_CHARACTERISTIC.toLowerCase())
  );
  if (!bleCharacteristc)
    throw new Error("Failed to find API key characteristic");
  try {
    await MANAGER.sendMessageToCharacteristic(bleCharacteristc, apiKey);
  } catch (e) {
    console.log(
      "Failed to write to API key characteristic",
      apiKey,
      bleCharacteristc
    );
    throw new Error("Failed to write to API key characteristic");
  }
  STORAGE.connectDevice(activeDevice, apiKey).then(onStorageUpdate);
};

export default {
  connectDevice,
  forgetDevice,
  registerActiveDevice,
  disconnectDevice,
  setInterval,
};
