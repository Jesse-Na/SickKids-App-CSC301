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

type Props = NativeStackScreenProps<DeviceStackParamList, "Monitor">;

const Monitor = ({ navigation }: Props) => {
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const device = BLEService.getConnectedDevice();
    setDevice(device);
    const apiKey = APIService.getApiKey();
    setApiKey(apiKey);

    if (device) {
      refreshDevice();
    } else {
      setApiKeyError(null);
    }
  }, [BLEService.getConnectedDevice(), APIService.getApiKey()]);

  const setReadingInterval = async (interval: number) => {
  }

  const refreshDevice = async () => {
    if (!device) return;
    if (!apiKey) {
      console.log("not registered");
      setApiKeyError(
        "This device has not been registered, please contact an admin to enable it"
      );
    } else {
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
    }
  };

  // const battery = useMemo(() => {
  //   if (!BLE.lastMessage) {
  //     return {
  //       percentage: 0,
  //       charging: false,
  //     };
  //   }
  //   return BLEDecode.getBatteryFromBase64(BLE.lastMessage.value);
  // }, [BLE.lastMessage]);

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
          <Battery
            batteryLevel={0}
            charging={false}
          />
          <HeartRate device={device}/>
          <Connectivity device={device}/>
          <ReadingInterval />
        </View>
      )}
    </PageView>
  );
};

export default Monitor;

const styles = StyleSheet.create({});
