import { BleManager, Subscription } from "react-native-ble-plx";
import {
  BLECharacteristic,
  BLEDevice,
  BLEState,
  NewBLEMessage,
} from "./ble.types";
import base64 from "react-native-base64";
import { API_KEY_CHARACTERISTIC, MIN_RSSI, MTU_SIZE } from "./constants";
import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";

const manager = new BleManager();

let running = false;

let transactions: Subscription[] = [];

const clearTransactions = () => {
  transactions.forEach((transaction) => transaction.remove());
  transactions = [];
};

export const scanAllDevices = async (
  maxDuration: number,
  onDeviceFound: (device: BLEDevice) => void
) => {
  console.log("Scanning");
  const granted = await requestPermissions();
  if (!granted) return;
  return new Promise((resolve, reject) => {
    manager.startDeviceScan(null, null, (error, dev) => {
      if (error) {
        console.log(
          "ERROR",
          error.cause,
          error.message,
          error.androidErrorCode,
          error.errorCode
        );
        reject(error);
      }
      if (dev && dev.rssi && dev.rssi > MIN_RSSI) {
        onDeviceFound({
          deviceId: dev.id,
          deviceName: dev.localName ?? dev.name ?? "Unknown",
          serviceUUIDs: dev.serviceUUIDs ?? [],
        });
      }
    });
    setTimeout(() => {
      manager.stopDeviceScan();
      resolve(null);
    }, maxDuration);
  });
};
export const cancelDeviceScan = manager.stopDeviceScan;

export const selectDevice = async (
  device: BLEDevice,
  onNotification: (message: NewBLEMessage) => void,
  onDeviceUpdate: (device: BLEDevice) => void,
  onStateChange: (state: BLEState) => void,
  onConnected: (device: BLEDevice, apiKey: string | null) => void,
  onDisconnected: (device: BLEDevice) => void
) => {
  console.log("Selecting device", device, running);
  if (running) return;
  running = true;
  while (!(await requestPermissions())) {
    console.log("Waiting for permissions");
  }
  onStateChange("searching");

  const bleState = await manager.state();
  if (bleState !== "PoweredOn") {
    try {
      manager.enable();
    } catch (e) {
      console.log("ERROR ENABLING BLUETOOTH", e);
      onStateChange("disconnected");
      return;
    }
  }

  const connected = await manager.isDeviceConnected(device.deviceId);
  clearTransactions();
  console.log("Scanning");
  if (!connected) {
    let found = false;
    while (!found) {
      try {
        await new Promise((resolve, reject) => {
          console.log("Starting scan", device.serviceUUIDs);
          manager.startDeviceScan(device.serviceUUIDs, null, (error, dev) => {
            if (error) {
              reject(error);
            } else if (dev && device.deviceId === dev.id) {
              found = true;
              device.serviceUUIDs = dev.serviceUUIDs ?? [];
              onDeviceUpdate({ ...device });
              resolve(dev);
            }
          });
        });
      } catch (e) {
        console.log("ERROR SCANNING", e);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.log("About to connect", connected);

  onStateChange("connecting");

  while (true) {
    try {
      manager.cancelTransaction("discover");
      console.log("discovered cancelled");
      const deviceConn = await manager.connectToDevice(device.deviceId);
      console.log("connected");
      await deviceConn.discoverAllServicesAndCharacteristics("discover");
      console.log("discovered");
      await deviceConn.requestMTU(MTU_SIZE);
      break;
    } catch (e) {
      console.log("failed");
      try {
        await manager.cancelDeviceConnection(device.deviceId);
      } catch (e) {
        console.log("ERROR DISCONNECTING", e);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const services = await manager.servicesForDevice(device.deviceId);
  const characteristics = (
    await Promise.all(
      services.map((ser) =>
        manager.characteristicsForDevice(device.deviceId, ser.uuid)
      )
    )
  ).flat();
  const apiKeyCharacteristic = characteristics.find((c) =>
    c.uuid.toLowerCase().startsWith(API_KEY_CHARACTERISTIC.toLowerCase())
  );
  const apiKey = (await apiKeyCharacteristic?.read())?.value ?? null;

  onConnected({ ...device }, apiKey ? base64.decode(apiKey) : null);

  characteristics
    .filter((char) => char.isNotifiable)
    .forEach((char) => {
      transactions.push(
        char.monitor(async (error, char) => {
          if (error) {
            console.log(
              "ERROR MONITORING CHARACTERISTIC",
              error,
              error.errorCode
            );
          } else if (char?.value) {
            console.log("NOTIFYING YAY!!!", char?.value);
            onNotification({
              value: char.value,
              deviceId: device.deviceId,
              serviceUUID: char.serviceUUID,
              characteristicUUID: char.uuid,
            });
          }
        })
      );
    });

  transactions.push(
    manager.onDeviceDisconnected(device.deviceId, (error, dev) => {
      console.log("DISCONNECTED", error, dev);
      onDisconnected(device);
      running = false;
      if (error) {
        console.log("ERROR DISCONNECTING", error);
      } else {
        console.log("DISCONNECTED");
        onStateChange("disconnected");
        selectDevice(
          device,
          onNotification,
          onDeviceUpdate,
          onStateChange,
          onConnected,
          onDisconnected
        );
      }
    })
  );
};

export const disconnect = (deviceId: string) => {
  clearTransactions();
  running = false;
  manager.cancelDeviceConnection(deviceId);
};

export const getWriteableCharacteristics = async (
  deviceId: string
): Promise<BLECharacteristic[]> => {
  const services = await manager.servicesForDevice(deviceId);
  console.log("services", services);
  const characteristics = (
    await Promise.all(
      services.map((ser) =>
        manager.characteristicsForDevice(deviceId, ser.uuid)
      )
    )
  ).flat();
  return characteristics
    .filter((c) => c.isWritableWithoutResponse || c.isWritableWithResponse)
    .map((c) => ({
      deviceId: deviceId,
      characteristicUUID: c.uuid,
      serviceUUID: c.serviceUUID,
    }));
};

export const sendMessageToCharacteristic = async (
  characteristic: BLECharacteristic,
  message: string
) => {
  console.log("Sending message", message + " to", characteristic);
  manager.writeCharacteristicWithoutResponseForDevice(
    characteristic.deviceId,
    characteristic.serviceUUID,
    characteristic.characteristicUUID,
    base64.encode(message)
  );
};

export const readCharacteristic = async (characteristic: BLECharacteristic) => {
  const char = await manager.readCharacteristicForDevice(
    characteristic.deviceId,
    characteristic.serviceUUID,
    characteristic.characteristicUUID
  );
  return char.value;
};

export const requestPermissions = async () => {
  const state = await manager.state();
  if (state === "PoweredOff") {
    return new Promise((resolve, reject) => {
      Alert.alert(
        "Bluetooth Required",
        "App needs bluetooth to connect to the device. Please turn on bluetooth.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Open Settings",
            onPress: () =>
              Platform.OS === "ios"
                ? Linking.openURL("App-Prefs:Bluetooth").then(() =>
                    resolve(false)
                  )
                : Linking.sendIntent(
                    "android.settings.BLUETOOTH_SETTINGS"
                  ).then(() => resolve(false)),
          },
        ]
      );
    });
  }
  if (Platform.OS === "ios") {
    if (state !== "PoweredOn") {
      return new Promise((resolve, reject) => {
        Alert.alert(
          "Bluetooth Permission Required",
          "App needs access bluetooth to connect to the device. Please go to app settings and grant permission.",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings().then(() => resolve(false)),
            },
          ]
        );
      });
    }
    return true;
  } else {
    console.log("Requesting permissions");
    console.log(await manager.state());
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    console.log("result", result);
    const results = Object.values(result);
    if (!results.some((r) => r !== PermissionsAndroid.RESULTS.GRANTED)) {
      console.log("Permissions Granted.");
      return true;
      // } else if (results.includes(PermissionsAndroid.RESULTS.DENIED)) {
      //   console.log("Bluetooth Permission Denied.");
      //   return false;
      // } else if (results.includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
      //   console.log("Bluetooth Permission Denied with Never Ask Again.");
    }
    return new Promise((resolve, reject) => {
      Alert.alert(
        "Bluetooth Permission Required",
        "App needs access bluetooth to connect to the device. Please go to app settings and grant permission.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings().then(() => resolve(false)),
          },
        ]
      );
    });
  }
};
