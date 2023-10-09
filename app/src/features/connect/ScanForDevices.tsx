import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import CustomButton from "../../components/CustomButton";
import useBLE from "@BLE/useBLE";
import DevicePreview from "@BLE/components/DevicePreview";
import PageView from "../../components/PageView";
import { BLEService } from "@src/services/BLEService";
import { Device, DeviceId } from "react-native-ble-plx";
import { MAX_SCAN_DURATION, MIN_RSSI } from "@BLE/constants";

type Props = {
  goBack: () => void;
};

const ScanForDevices = (props: Props) => {
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isDuplicateDevice = (devices: Device[], device: Device) => {
    return devices.some((d) => d.id === device.id);
  }

  const addDevice = (device: Device) => {
    setFoundDevices((prevState) => {
      console.log(prevState.length, device.id)
      if (!isDuplicateDevice(prevState, device) && device.rssi && device.rssi > MIN_RSSI) {
        return [...prevState, device];
      }

      console.log("DUPLICATE")
      return prevState;
    });
  }

  const startScan = async () => {
    setIsSearching(true);
    BLEService.scanAllDevices(addDevice);
    setTimeout(() => {
      stopScan();
    }, MAX_SCAN_DURATION);
  };

  const stopScan = () => {
    setIsSearching(false);
    BLEService.stopDeviceScan();
  }

  const connectToDevice = (deviceId: DeviceId) => {
    stopScan();
    BLEService.connectToDevice(deviceId).then(() => {
      setIsConnecting(false);
      props.goBack();
    }).catch((e) => {
      console.log(e);
      setIsConnecting(false);
    });
  };
  useEffect(() => {
    startScan();
    // return () => BLE.stopScan();
  }, []);

  return (
    <PageView>
      <CustomButton
        title={isSearching ? "Scanning" : "Scan For Devices"}
        disabled={isSearching}
        onPress={startScan}
      />
      {foundDevices.length > 0 && (
        <Text style={styles.title}>Found Devices</Text>
      )}
      {foundDevices.map((device) => (
        <DevicePreview
          key={device.id}
          device={device}
          isLoading={isSearching || isConnecting}
          onPress={() => {
            setIsConnecting(true);
            connectToDevice(device.id);
          }}
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
