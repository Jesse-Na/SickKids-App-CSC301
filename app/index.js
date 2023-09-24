import { registerRootComponent } from "expo";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { Amplify } from "aws-amplify";
import App from "./App";
import { AmplifyConfig } from "./src/utils/amplify";
import AuthWrapper from "./src/features/authentication/AuthWrapper";
import { useEffect } from "react";
import { registerBackgroundFetch } from "./src/utils/background";

import { launchForegroundService } from "./src/utils/foregroundService";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { cancelAllNotifications } from "./src/utils/notifications";
import BLEWrapper from "@BLE/BLEWrapper";
import READINGS from "@BLE/storage/readingsDB.utils";
Amplify.configure(AmplifyConfig);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const root = () => {
  useEffect(() => {
    READINGS.initializeDatabases();
    cancelAllNotifications();
    if (Platform.OS === "android") {
      launchForegroundService();
    }
    registerBackgroundFetch();
  }, []);
  return (
    <AuthWrapper>
      <BLEWrapper>
        <NavigationContainer>
          <AuthWrapper>
            <App />
          </AuthWrapper>
        </NavigationContainer>
      </BLEWrapper>
    </AuthWrapper>
  );
};
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(root);
