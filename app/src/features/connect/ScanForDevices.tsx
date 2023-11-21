import { StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import DevicePreview from "../../components/DevicePreview";
import PageView from "../../components/PageView";
import { BLEService } from "@src/services/BLEService";
import { Device, DeviceId } from "react-native-ble-plx";
import { UNIQUE_DEVICE_ID_CHARACTERISTIC, MAX_SCAN_DURATION, MIN_RSSI, CONFIGURATION_SERVICE } from "../../utils/constants";
import base64 from "react-native-base64";
import { useBLEContext } from "@src/context/BLEContextProvider";

type Props = {
  goBack: () => void;
};

const ScanForDevices = (props: Props) => {
  const {setDevice} = useBLEContext();
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isDuplicateDevice = (devices: Device[], device: Device) => {
    return devices.some((d) => d.id === device.id);
  }

  const addDevice = (device: Device) => {
    setFoundDevices((prevState) => {
      if (!isDuplicateDevice(prevState, device) && device.rssi && device.rssi > MIN_RSSI) {
        return [...prevState, device];
      }

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
    BLEService.connectToDevice(deviceId)
      .then((device) => {
        BLEService.readCharacteristicForDevice(CONFIGURATION_SERVICE, UNIQUE_DEVICE_ID_CHARACTERISTIC)
          .then(characteristic => {
            if (characteristic.value) {
              const buff = base64.decode(characteristic.value);
              console.log("Device Unique ID: ", buff.toString());
            } else {
              throw new Error('Read error')
            }
          })
          .catch(error => {
            console.error(error)
          });

        setIsConnecting(false);
        props.goBack();

        // update device in blecontext
        setDevice(device)

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
