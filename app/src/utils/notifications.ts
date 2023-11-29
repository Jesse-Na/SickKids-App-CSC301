import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

export const scheduleNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Please Reconnect PTS Device",
      body: "The device has not been connected recently, please open the app to reconnect.",
    },
    trigger: { minute: 1, repeats: true },
    
  });
};
// cancel notifications
export const onAppLoad = async () => {};
//Every few hours send a notification to reconnect the device if device isn't connected
export const disconnected = async () => {};
//cancel disconnected
export const connected = async () => {};
export const syncedToCloud = async () => {};
export const cloudSyncedFailed = async () => {};



export const sendLowBatteryNotification = async (batteryLevel: number) => {
  // Sends a notification that the battery is low.
    if (batteryLevel < 10) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Low Battery Warning",
          body: `Your battery level is low (${batteryLevel}%). Please charge your device.`,
        },
        trigger: null, // This notification is a one-time alert
      });
    }
};


export const sendOneTimeNotification = async (
  title: string,
  body: string,
  delay: number = 1
) => {
  console.log("Sending one time notification", title, body);
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: { seconds: delay },
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const requestNotificationPermissions = async () => {
  const status = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
    },
    android: {
      allowAlert: true,
    },
  });
  if (Platform.OS == "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    })
  }
  if (!status.granted) {
    console.log("Notification permission not granted");

    Alert.alert(
      "Please enable notifications in settings to receive alerts",
      "To enable notifications, please open settings and enable notifications for the app.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }
  else {
    console.log("Notification permissions granted!");
  }
};
