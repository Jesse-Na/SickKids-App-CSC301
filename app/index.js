import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import App from "./App";
import AuthWrapper from "./src/features/authentication/AuthWrapper";
import { useEffect } from "react";
import { launchForegroundService } from "./src/utils/foregroundService";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { cancelAllNotifications } from "./src/utils/notifications";
import BLEWrapper from "@BLE/BLEWrapper";
import BLEContextProvider from "@src/context/BLEContextProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const root = () => {
  useEffect(() => {
    cancelAllNotifications();
    if (Platform.OS === "android") {
      launchForegroundService();
    }
  }, []);
  return (
    <AuthWrapper>
      <BLEContextProvider>
        <BLEWrapper>
          <NavigationContainer>
            <AuthWrapper>
              <App />
            </AuthWrapper>
          </NavigationContainer>
        </BLEWrapper>
      </BLEContextProvider>
    </AuthWrapper>
  );
};
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(root);
