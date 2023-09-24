import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import CustomButton from "../../components/CustomButton";
import useBLE from "@BLE/useBLE";
import DevicePreview from "@BLE/components/DevicePreview";
import PageView from "../../components/PageView";
import { BLEDevice } from "@BLE/ble.types";

type Props = {
  goBack: () => void;
};

const ScanForDevices = (props: Props) => {
  const BLE = useBLE();

  const { foundDevices, scanning } = BLE;

  const startScan = async () => {
    BLE.startScan();
  };

  const handleForgetDevice = (deviceId: string) => {
    BLE.forgetDevice(deviceId);
  };

  const knownDevices = useMemo(
    () => foundDevices.filter((d) => d.known),
    [foundDevices]
  );
  const newDevices = useMemo(
    () => foundDevices.filter((d) => !d.known),
    [foundDevices]
  );

  const connectToDevice = (device: BLEDevice) => {
    BLE.connectDevice(device);
    props.goBack();
  };
  useEffect(() => {
    startScan();
    // return () => BLE.stopScan();
  }, []);

  return (
    <PageView>
      <CustomButton
        title={scanning ? "Scanning" : "Scan For Devices"}
        disabled={scanning}
        onPress={startScan}
      />
      {knownDevices.length > 0 && (
        <Text style={styles.title}>Known Devices</Text>
      )}
      {knownDevices.map((device) => (
        <DevicePreview
          key={device.deviceId}
          device={device}
          onPress={() => connectToDevice(device)}
          onLongPress={() => handleForgetDevice(device.deviceId)}
        />
      ))}
      {newDevices.length > 0 && <Text style={styles.title}>New Devices</Text>}
      {newDevices.map((device) => (
        <DevicePreview
          key={device.deviceId}
          device={device}
          onPress={() => connectToDevice(device)}
        />
      ))}
    </PageView>
  );
};

export default ScanForDevices;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  deviceList: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    padding: 10,
  },
  emptyDeviceListText: {
    textAlign: "center",
    fontSize: 15,
    padding: 10,
  },
});
