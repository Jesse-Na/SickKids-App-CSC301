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
import { useBLEContext, defaultDeviceProperties } from "@src/context/BLEContextProvider";
type Props = NativeStackScreenProps<DeviceStackParamList, "Monitor">;

const Monitor = ({ navigation }: Props) => {
  const { device, setDevice, deviceProperties, setDeviceProperties } = useBLEContext();
  const { batteryLevel, isCharging, heartRate } = deviceProperties || defaultDeviceProperties;

  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const combineBytes = (bytes: Buffer, from: number, to: number) => {
    return bytes.subarray(from, to).reduce((a, p) => 256 * a + p, 0);
  };

  const decodeDataCharacteristic = (characteristicValue: string) => {
    const decoded = base64.decode(characteristicValue);

    const timestamp = combineBytes(Buffer.from(decoded), 0, 4) * 1000;
    const touchSensor1: number = !Number.isNaN(decoded.charCodeAt(4))
      ? decoded.charCodeAt(4)
      : 0;
    const touchSensor2: number = !Number.isNaN(decoded.charCodeAt(5))
      ? decoded.charCodeAt(5)
      : 0;
    const battery: number = !Number.isNaN(decoded.charCodeAt(6))
      ? decoded.charCodeAt(6)
      : 0;
    setDeviceProperties("batteryLevel", battery);

    const heartRate: number = !Number.isNaN(decoded.charCodeAt(8))
      ? decoded.charCodeAt(8)
      : 0;

    console.log("monitior.tsx", heartRate)
    setDeviceProperties("heartRate", heartRate);

    const isCharging: number = !Number.isNaN(decoded.charCodeAt(7))
      ? decoded.charCodeAt(7)
      : 0;
    setDeviceProperties("isCharging", isCharging > 0);
  };

  useEffect(() => {
    if (!device) {
      setApiKeyError(null);
      setDevice(null);
      return;
    }

    setDevice(device);

    const apiKey = APIService.getApiKey();
    // if (!apiKey) {
    //   console.log("not registered");
    //   setApiKeyError(
    //     "This device has not been registered, please contact an admin to enable it"
    //   );
    // } else {
    //   refreshDevice();
    // }

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
  }, [device]);

  const setReadingInterval = async (interval: number) => { };

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
    <PageView refresh={device ? refreshDevice : undefined}>
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
          <HeartRate heartRate={heartRate} device={device} />
          <Connectivity device={device} />
          <ReadingInterval />
        </View>
      )}
    </PageView>
  );
};

export default Monitor;

const styles = StyleSheet.create({});
