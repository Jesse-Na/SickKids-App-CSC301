export type BLEDevice = {
  deviceId: string;
  deviceName: string;
  serviceUUIDs: string[];
};

export type SavedBLEDevice = BLEDevice & {
  readInterval: number;
  apiKey: string | null;
};

export type BLEMessage = {
  id: number;
  deviceId: string;
  serviceUUID: string;
  characteristicUUID: string;
  value: string;
};

export type BLEAsyncStorage = {
  activeDeviceId: string | null;
  savedDevices: SavedBLEDevice[];
  lastMessage: BLEMessage | null;
  lastSyncedToCloud: string | null;
  lastConnected: string | null;
  lastDisconnected: string | null;
};

export type NewBLEMessage = Omit<BLEMessage, "id">;

export type BLEState =
  | "searching"
  | "connected"
  | "connecting"
  | "disconnected";

export type FoundBLEDevice = BLEDevice & {
  known: boolean;
};

export type BLEContextState = {
  device: SavedBLEDevice | null;
  state: BLEState;
  lastSyncedToCloud: string | null;
  lastConnected: string | null;
  lastDisconnected: string | null;
  lastMessage: BLEMessage | null;
  foundDevices: FoundBLEDevice[];
};

export type BLEContextActions = {
  connectDevice: (device: BLEDevice) => void;
  disconnectDevice: () => void;
  forgetDevice: (deviceId: string) => void;
  startScan: () => void;
  stopScan: () => void;
  registerActiveDevice: (userId: string | undefined) => Promise<void>;
  setInterval: (deviceId: string, interval: number) => void;
};

export type BLEContextType = BLEContextState &
  BLEContextActions & {
    isDeviceConnected: boolean;
    scanning: boolean;
  };

export type BLECharacteristic = {
  deviceId: string;
  serviceUUID: string;
  characteristicUUID: string;
};
