import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Settings from "../settings";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HEADER_BACKGROUND_COLOR } from "../../utils/styles";
import { Ionicons } from "@expo/vector-icons";
import Login from "../authentication/Login";

type Props = {};

export type SettingsStackParamList = {
  Profile: undefined;
  Settings: undefined;
  AdminLogin: undefined;
};
const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsTab = (props: Props) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: HEADER_BACKGROUND_COLOR,
          },
        }}
      />
      <Stack.Screen
        name="AdminLogin"
        component={Login}
        options={{
          title: "Admin Sign In",
          headerStyle: {
            backgroundColor: HEADER_BACKGROUND_COLOR,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsTab;
