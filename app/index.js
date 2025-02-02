import { registerRootComponent } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import App from "./App";
import AuthWrapper from "./src/context/AuthContextProvider";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { cancelAllNotifications } from "./src/utils/notifications";
import BLEContextProvider from "@src/context/BLEContextProvider";
import { launchBackground } from "@src/utils/background";

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
    launchBackground(); // For notifications
  }, []);
  return (
    <AuthWrapper>
      <BLEContextProvider>
        <NavigationContainer>
          <AuthWrapper>
            <App />
          </AuthWrapper>
        </NavigationContainer>
      </BLEContextProvider>
    </AuthWrapper>
  );
};
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(root);
