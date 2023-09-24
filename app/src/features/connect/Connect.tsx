import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "../../components/CustomButton";
import ScanForDevices from "./ScanForDevices";
import ActiveDevice from "./ActiveDevice";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DeviceStackParamList } from "../tabs/DeviceTab";
import PageView from "../../components/PageView";
import useBLE from "@BLE/useBLE";

type Props = NativeStackScreenProps<DeviceStackParamList, "Connect">;

const Connect = (props: Props) => {
  const BLE = useBLE();

  return BLE.device ? (
    <ActiveDevice />
  ) : (
    <ScanForDevices goBack={() => props.navigation.pop()} />
  );
};

export default Connect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
