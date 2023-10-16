import { StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import DevicePreview from "@BLE/components/DevicePreview";
import PageView from "../../components/PageView";
import { BLEService } from "@src/services/BLEService";
import { Device, DeviceId } from "react-native-ble-plx";
import { DATA_CHARACTERISTIC, DATA_USAGE_SERVICE, DEVICE_CONFIGURATION_SERVICE, DEVICE_UNIQUE_ID_CHARACTERISTIC, MAX_SCAN_DURATION, MIN_RSSI, SECURITY_SERVICE } from "@BLE/constants";
import base64 from "react-native-base64";
import { Buffer } from "buffer";
import { DBService } from "@src/services/DBService";
import { APIService } from "@src/services/APIService";

type Props = {
  goBack: () => void;
};

const ScanForDevices = (props: Props) => {
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sensorMsg, setSensorMsg] = useState("");

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

  const combineBytes = (bytes: Buffer, from: number, to: number) => {
    return bytes.subarray(from, to).reduce((a, p) => 256 * a + p, 0);
  }

  const decodeDataCharacteristic = (characteristicValue: string) => {
    const decoded = base64.decode(characteristicValue);

    // console.log(characteristicValue, buff);
    const timestamp = combineBytes(Buffer.from(decoded), 0, 4) * 1000;
    console.log("Timestamp: ", timestamp);
    // console.log("Timestamp: ", combineBytes(buff, 0, 4) * 1000);
    const touchSensor1: number = !Number.isNaN(decoded.charCodeAt(4))
      ? decoded.charCodeAt(4)
      : 0;
    console.log("Touch Sensor 1:", touchSensor1);
    const touchSensor2: number = !Number.isNaN(decoded.charCodeAt(5))
      ? decoded.charCodeAt(5)
      : 0;
    console.log("Touch Sensor 2:", touchSensor2);
    const battery: number = !Number.isNaN(decoded.charCodeAt(6))
      ? decoded.charCodeAt(6)
      : 0;
    console.log("Battery: ", battery);
  }

  const connectToDevice = (deviceId: DeviceId) => {
    stopScan();
    BLEService.connectToDevice(deviceId)
      .then(() => {
        BLEService.readCharacteristicForDevice(SECURITY_SERVICE, DEVICE_UNIQUE_ID_CHARACTERISTIC)
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

        BLEService.setupMonitor(
          DATA_USAGE_SERVICE,
          DATA_CHARACTERISTIC,
          async characteristic => {
            if (characteristic.value) {
              decodeDataCharacteristic(characteristic.value);
              DBService.saveReading(characteristic.value, deviceId);
              APIService.syncToCloudForDevice(deviceId);
              // await BLEService.finishMonitor()
              // const data = base64.decode(characteristic.value);
              // setSensorMsg(data);
            }
          },
          async error => {
            console.error(error)
            BLEService.finishMonitor()
          });
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
