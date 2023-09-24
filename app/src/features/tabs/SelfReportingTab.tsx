import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Profile from "../profile/Profile";
import Settings from "../settings";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { HEADER_BACKGROUND_COLOR } from "../../utils/styles";
import { Ionicons } from "@expo/vector-icons";
import SelfReportPage from "../selfReporting/SelfReportPage";
import { RootTabParamList } from "App";

type Props = NativeStackScreenProps<RootTabParamList, "SelfReportingTab">;

const SelfReportingTab = (props: Props) => {
  return (
    <SelfReportPage
      goToDeviceSelect={() => props.navigation.navigate("DeviceTab")}
    />
  );
};

export default SelfReportingTab;
