import React, { createContext, useEffect, useState } from "react";
import { BLEState } from "@BLE/ble.types";
import {
  BLEAsyncStorage,
  BLEContextActions,
  BLEContextState,
  BLEContextType,
  BLEDevice,
  FoundBLEDevice,
  SavedBLEDevice,
} from "./ble.types";
import * as STORAGE from "./storage/asyncStorage.utils";
import { SCAN_DURATION } from "./constants";
import * as MANAGER from "./bleManager";
import BLE from "./ble";

type Props = {
  children: React.ReactNode | React.ReactNode[];
  handleCloudSync: (readings: string[]) => Promise<boolean>;
};

const defualtState: BLEContextState = {
  device: null,
  state: "disconnected",
  lastSyncedToCloud: null,
  lastConnected: null,
  lastDisconnected: null,
  lastMessage: null,
  foundDevices: [],
};

const defualtActions: BLEContextActions = {
  connectDevice: (device: BLEDevice) => {},
  disconnectDevice: () => {},
  forgetDevice: (deviceId: string) => {},
  startScan: () => {},
  stopScan: () => {},
  registerActiveDevice: async (userId: string | undefined) => {},
  setInterval: (deviceId: string, interval: number) => {},
};

const defualtContext: BLEContextType = {
  ...defualtActions,
  ...defualtState,
  isDeviceConnected: false,
  scanning: false,
};

export const BLEContext = createContext<BLEContextType>(defualtContext);

export default function BLEWrapper({ children }: Props) {
  const [BLEState, setBLEState] = useState<BLEContextState>(defualtState);
  const [knownDevices, setKnownDevices] = useState<SavedBLEDevice[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleStorageUpdate = (
    storage: BLEAsyncStorage,
    bleState?: BLEState
  ) => {
    setKnownDevices(storage.savedDevices);
    setBLEState((state) => ({
      ...state,
      device: storage.activeDeviceId
        ? storage.savedDevices.find(
            (device) => device.deviceId === storage.activeDeviceId
          ) ?? null
        : null,
      lastConnected: storage.lastConnected,
      lastDisconnected: storage.lastDisconnected,
      lastSyncedToCloud: storage.lastSyncedToCloud,
      lastMessage: storage.lastMessage,
      state: bleState ?? state.state,
      foundDevices: storage.savedDevices.map((device) => ({
        ...device,
        known: true,
      })),
    }));
  };
  const startScan = () => {
    setScanning(true);
    MANAGER.scanAllDevices(SCAN_DURATION, (device: BLEDevice) => {
      const isDeviceKnown = knownDevices.some(
        (d) => d.deviceId === device.deviceId
      );
      const dev: FoundBLEDevice = {
        ...device,
        known: isDeviceKnown,
      };
      if (device.deviceName == "Unknown") return;
      setBLEState((s) => ({
        ...s,
        foundDevices: [
          ...s.foundDevices.filter((d) => d.deviceId != dev.deviceId),
          dev,
        ].sort((a, b) => (a.deviceId > b.deviceId ? 1 : -1)),
      }));
    }).then(() => setScanning(false));
  };
  const stopScan = () => {
    MANAGER.cancelDeviceScan();
    setScanning(false);
  };

  const updateBLEState = (state: BLEState) => {
    setBLEState((curr) => ({ ...curr, state }));
  };

  useEffect(() => {
    STORAGE.getStorage().then((storage) => {
      handleStorageUpdate(storage);
      const device = storage.savedDevices.find(
        (device) => device.deviceId === storage.activeDeviceId
      );
      if (storage.activeDeviceId && device) {
        BLE.connectDevice(device, handleStorageUpdate, updateBLEState);
      }
    });
  }, []);

  return (
    <BLEContext.Provider
      value={{
        isDeviceConnected: BLEState.state === "connected",
        scanning,
        ...BLEState,
        connectDevice: (device: BLEDevice) =>
          BLE.connectDevice(device, handleStorageUpdate, updateBLEState),
        disconnectDevice: () =>
          BLEState.device &&
          BLE.disconnectDevice(BLEState.device.deviceId, handleStorageUpdate),
        forgetDevice: (deviceId: string) =>
          BLE.forgetDevice(deviceId, handleStorageUpdate),
        startScan,
        stopScan,
        registerActiveDevice: (userId: string | undefined) =>
          BLE.registerActiveDevice(BLEState.state, handleStorageUpdate, userId),
        setInterval,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
}
