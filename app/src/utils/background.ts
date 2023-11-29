import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { requestNotificationPermissions, sendLowBatteryNotification } from "./notifications";
import { useBLEContext } from "@src/context/BLEContextProvider";

const BATTERY_CHECK_TASK = "battery-check-task";

TaskManager.defineTask(BATTERY_CHECK_TASK, async () => {
  const { deviceProperties } = useBLEContext();
  if (deviceProperties?.batteryLevel) {
    await sendLowBatteryNotification(deviceProperties.batteryLevel);
  };

  return;
})

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
      .then(() => { console.log("battery task registered") })
      .catch((err) => console.log("err", err.message, Object.keys(err)));
  } catch (e) {
    console.log("error", e);
  }
}

export const launchBackground = async () => {
  // request permissions necessary to send notifications in background:
  await requestNotificationPermissions();
  if (Platform.OS === "android") {
    // Launch the foreground serve (only available on android)
    //await launchForegroundService();
  }
  await registerBatteryBackgroundFetch();

  const registeredTasks = TaskManager.getRegisteredTasksAsync();

}

export const unregisterBatteryBackgroundFetch = async () => {
  await BackgroundFetch.unregisterTaskAsync(BATTERY_CHECK_TASK);
};
