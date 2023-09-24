// @ts-ignore
import VIForegroundService from "@voximplant/react-native-foreground-service";
import { Platform } from "react-native";

export const launchForegroundService = async () => {
  console.log("Launching foreground service");
  const foregroundService = VIForegroundService.getInstance();
  foregroundService.on("VIForegroundServiceButtonPressed", async () => {
    await foregroundService.stopService();
    foregroundService.off();
  });

  if (Platform.OS !== "android") {
    console.log("Only Android platform is supported");
    return;
  }

  if (Platform.Version >= 26) {
    const channelConfig = {
      id: "ForegroundServiceChannel",
      name: "Notification Channel",
      description: "Notification Channel for Foreground Service",
      enableVibration: false,
      importance: 2,
    };
    await foregroundService.createNotificationChannel(channelConfig);
  }
  const notificationConfig = {
    channelId: "ForegroundServiceChannel",
    id: 3456,
    title: "Foreground Service",
    text: "Foreground service is running",
    icon: "ic_notification",
    priority: 0,
    button: "Stop service",
  };
  try {
    await foregroundService.startService(notificationConfig);
    console.log("Foreground started successfully");
  } catch (_) {
    foregroundService.off();
  }
};
