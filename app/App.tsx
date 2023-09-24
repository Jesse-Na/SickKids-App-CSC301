import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DeviceTab from "./src/features/tabs/DeviceTab";
import SettingsTab from "./src/features/tabs/SettingsTab";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  CARD_BACKGROUND_COLOR,
  HEADER_BACKGROUND_COLOR,
  TAB_BAR_BACKGROUND_COLOR,
} from "./src/utils/styles";
import SelfReportingTab from "./src/features/tabs/SelfReportingTab";

export type RootTabParamList = {
  DeviceTab: undefined;
  SettingsTab: undefined;
  SelfReportingTab: undefined;
};
const Tab = createBottomTabNavigator<RootTabParamList>();
export default function App() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: TAB_BAR_BACKGROUND_COLOR,
        },
        headerStyle: {
          backgroundColor: HEADER_BACKGROUND_COLOR,
        },
      }}
    >
      <Tab.Screen
        name="DeviceTab"
        component={DeviceTab}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <Ionicons name="bluetooth" size={24} color="black" />
          ),
          title: "Device",
        }}
      />
      <Tab.Screen
        name="SelfReportingTab"
        component={SelfReportingTab}
        options={{
          tabBarIcon: () => (
            <Ionicons name="calendar" size={24} color="black" />
          ),
          title: "Self Reporting",
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsTab}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <Ionicons name="settings" size={24} color="black" />
          ),
          title: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}
