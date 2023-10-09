import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import ScanForDevices from "./ScanForDevices";
import ActiveDevice from "./ActiveDevice";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DeviceStackParamList } from "../tabs/DeviceTab";
import { Device } from "react-native-ble-plx";
import { BLEService } from "@src/services/BLEService";

type Props = NativeStackScreenProps<DeviceStackParamList, "Connect">;

const Connect = (props: Props) => {
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    setDevice(BLEService.getConnectedDevice());
  }, [BLEService.getConnectedDevice()]);

  return device ? (
    <ActiveDevice device={device}/>
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
