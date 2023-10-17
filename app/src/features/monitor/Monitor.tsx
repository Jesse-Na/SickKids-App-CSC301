import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ConnectedDevice from "./ConnectedDevice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DeviceStackParamList } from "../tabs/DeviceTab";
import Battery from "./Battery";
import PageView from "../../components/PageView";
import HeartRate from "./HeartRate";
import Connectivity from "./Connectivity";
import ReadingInterval from "./ReadingInterval";
import { BLEService } from "@src/services/BLEService";
import { Device } from "react-native-ble-plx";
import { APIService } from "@src/services/APIService";
import { DATA_CHARACTERISTIC, DATA_USAGE_SERVICE } from "@BLE/constants";
import base64 from "react-native-base64";
import { DBService } from "@src/services/DBService";
import { Buffer } from "buffer";

type Props = NativeStackScreenProps<DeviceStackParamList, "Monitor">;

const Monitor = ({ navigation }: Props) => {
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<Device | null>(BLEService.getConnectedDevice());
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  const combineBytes = (bytes: Buffer, from: number, to: number) => {
    return bytes.subarray(from, to).reduce((a, p) => 256 * a + p, 0);
  };

  const decodeDataCharacteristic = (characteristicValue: string) => {
    const decoded = base64.decode(characteristicValue);

    const timestamp = combineBytes(Buffer.from(decoded), 0, 4) * 1000;
    console.log("Timestamp: ", timestamp);
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
    setBatteryLevel(battery);

    const isCharging: number = !Number.isNaN(decoded.charCodeAt(7))
      ? decoded.charCodeAt(7)
      : 0;
    console.log("Charging: ", isCharging);
    setIsCharging(isCharging === 2);
  };

  useEffect(() => {
    if (!deviceId) {
      setApiKeyError(null);
      setDeviceId(null);
      return;
    }

    setDeviceId(deviceId);

    const apiKey = APIService.getApiKey();
    if (!apiKey) {
      console.log("not registered");
      setApiKeyError(
        "This device has not been registered, please contact an admin to enable it"
      );
    } else {
      refreshDevice();
    }

    BLEService.setupMonitor(
      DATA_USAGE_SERVICE,
      DATA_CHARACTERISTIC,
      async (characteristic) => {
        if (characteristic.value) {
          decodeDataCharacteristic(characteristic.value);
          await DBService.saveReading(characteristic.value, "4C4493");
          await APIService.syncToCloudForDevice("4C4493");
        }
      },
      async (error) => {
        console.error(error);
        BLEService.finishMonitor();
      }
    );
  }, [deviceId]);

  const setReadingInterval = async (interval: number) => {};

  const refreshDevice = async () => {
    try {
      const resp = await APIService.getReadingInterval();
      setReadingInterval(parseInt(resp));
      setApiKeyError(null);
    } catch (e: any) {
      if (e.response.status === 401) {
        setApiKeyError(
          "Device has been disabled remotely, please contact an admin to re-enable it"
        );
      } else {
        setApiKeyError(null);
      }
    }
  };

  return (
    <PageView refresh={deviceId ? refreshDevice : undefined}>
      <ConnectedDevice
        goToDevice={() => {
          navigation.navigate("Connect");
        }}
      />

      {apiKeyError ? (
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 18, textAlign: "center" }}>
            {apiKeyError}
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Battery batteryLevel={batteryLevel} charging={isCharging} />
          <HeartRate device={deviceId} />
          <Connectivity device={deviceId} />
          <ReadingInterval />
        </View>
      )}
    </PageView>
  );
};

export default Monitor;

const styles = StyleSheet.create({});
