import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import NetInfo from "@react-native-community/netinfo";
import { launchForegroundService } from "./foregroundService";
import { Platform } from "react-native";
import moment from "moment";
import { scheduleNotifications } from "./notifications";
import BLE from "@BLE/ble";
import { getActiveDevice } from "@BLE/storage/asyncStorage.utils";

const BACKGROUND_TASK = "sickkids-pts-background-task";

export const checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
  return {
    status: BackgroundFetch.BackgroundFetchStatus[status ?? 0],
    isRegistered,
  };
};

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  console.log("Background task running", new Date().toISOString());
  if (Platform.OS === "android") {
    await launchForegroundService();
  }
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

export const registerBackgroundFetch = async () => {
  // console.log('Registering background task');
  console.log("registering");
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
  console.log("Registering background task", isRegistered);
  if (isRegistered) {
    // await unregisterBackgroundFetch();
    return;
  }
  try {
    BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 60 * 1,
      stopOnTerminate: false,
      startOnBoot: true,
    })
      .then(() => console.log("TASK REGISTERED"))
      .catch((err) => console.log("err", err.message, Object.keys(err)));
  } catch (e) {
    console.log("error", e);
  }
};

export const unregisterBackgroundFetch = () => {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK);
};
