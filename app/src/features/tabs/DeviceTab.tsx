import Connect from "../connect/Connect";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Monitor from "../monitor/Monitor";
import { HEADER_BACKGROUND_COLOR } from "../../utils/styles";

export type DeviceStackParamList = {
  Monitor: undefined;
  Connect: undefined;
};
const Stack = createNativeStackNavigator<DeviceStackParamList>();

export default function DeviceTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Monitor"
        component={Monitor}
        options={({ navigation }) => ({
          title: "Monitor",
          headerStyle: {
            backgroundColor: HEADER_BACKGROUND_COLOR,
          },
        })}
      />
      <Stack.Screen
        name="Connect"
        component={Connect}
        options={{
          title: "Connect To Device",
          headerStyle: {
            backgroundColor: HEADER_BACKGROUND_COLOR,
          },
        }}
      />
    </Stack.Navigator>
  );
}
