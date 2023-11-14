import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import NetInfo from "@react-native-community/netinfo";
import { launchForegroundService } from "./foregroundService";
import { Platform } from "react-native";
import moment from "moment";
import { requestNotificationPermissions, sendLowBatteryNotification} from "./notifications";
import BLE from "@BLE/ble";
import { getActiveDevice, getStorage } from "@BLE/storage/asyncStorage.utils";
import { getBatteryFromBase64 } from "@BLE/bleDecode";
import { DATA_CHARACTERISTIC } from "@BLE/constants";
import { send } from "process";



const BLE_BACKGROUND_TASK = "sickkids-pts-background-task";
const BATTERY_CHECK_TASK = "battery-check-task";


export const checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BLE_BACKGROUND_TASK);
  return {
    status: BackgroundFetch.BackgroundFetchStatus[status ?? 0],
    isRegistered,
  };
};


    TaskManager.defineTask(BATTERY_CHECK_TASK, async () => {
      // get storage (set by BLEManager
      const storage = await getStorage();
      const lastMessage = storage.lastMessage;
      if (lastMessage && lastMessage.value && lastMessage.characteristicUUID == DATA_CHARACTERISTIC) {
        const {percentage} = getBatteryFromBase64(lastMessage?.value);
        await sendLowBatteryNotification(percentage);
      };
      return;
    }
  )
    TaskManager.defineTask(BLE_BACKGROUND_TASK, async () => {
      console.log("BLE Background task running", new Date().toISOString());
    
      // const device = await getActiveDevice();
      // if (
      //   !device ||
      //   Math.abs(moment(device.lastReading).diff(moment(), "hours")) > 3
      // ) {
      //   console.log(device?.lastReading);
      //   await scheduleNotifications();
      // }
    
      try {
        const { isConnected } = await NetInfo.fetch();
        if (!isConnected) return BackgroundFetch.BackgroundFetchResult.NoData;
        const activeDevice = await getActiveDevice();
        if (!activeDevice) return BackgroundFetch.BackgroundFetchResult.NoData;
        BLE.connectDevice(
          activeDevice,
          (storage) => {
            console.log("updated storage", storage);
          },
          (state) => {
            console.log("updated state", state);
          }
        );
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  




export const registerBatteryBackgroundFetch = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BATTERY_CHECK_TASK);
  if (isRegistered) {
    await unregisterBatteryBackgroundFetch();
  }
  try {
    BackgroundFetch.registerTaskAsync(BATTERY_CHECK_TASK, {
      minimumInterval: 60 * 1,
      stopOnTerminate: false,
      startOnBoot: true,
    })
      .then(() => {console.log("battery task registered")})
      .catch((err) => console.log("err", err.message, Object.keys(err)));
  } catch (e) {
    console.log("error", e);
  }
}


export const registerBLEBackgroundFetch = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BLE_BACKGROUND_TASK);
  if (isRegistered) {
    await unregisterBLEBackgroundFetch();
    return;
  }
  try {
    BackgroundFetch.registerTaskAsync(BLE_BACKGROUND_TASK, {
      minimumInterval: 60 * 1,
      stopOnTerminate: false,
      startOnBoot: false,
    })
      .then(() => console.log("TASK REGISTERED"))
      .catch((err) => console.log("err", err.message, Object.keys(err)));
  } catch (e) {
    console.log("error", e);
  }
};

export const launchBackground = async () => {
  // request permissions necessary to send notifs in background:
  await requestNotificationPermissions();
  if (Platform.OS === "android") {
    // Launch the foreground serve (only available on android)
    //await launchForegroundService();
  }
  await registerBLEBackgroundFetch();
  await registerBatteryBackgroundFetch();

  const registeredTasks = TaskManager.getRegisteredTasksAsync();

}

export const unregisterBLEBackgroundFetch = async () => {
  await BackgroundFetch.unregisterTaskAsync(BLE_BACKGROUND_TASK);
};

export const unregisterBatteryBackgroundFetch = async () => {
  await BackgroundFetch.unregisterTaskAsync(BATTERY_CHECK_TASK);
};
