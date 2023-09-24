import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";

import ConnectedDevice from "./ConnectedDevice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DeviceStackParamList } from "../tabs/DeviceTab";
import { API, Auth } from "aws-amplify";
import Battery from "./Battery";
import CustomButton from "../../components/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import PageView from "../../components/PageView";
import useBLE from "@BLE/useBLE";
import * as BLEDecode from "@BLE/bleDecode";
import HeartRate from "./HeartRate";
import Connectivity from "./Connectivity";
import ReadingInterval from "./ReadingInterval";

type Props = NativeStackScreenProps<DeviceStackParamList, "Monitor">;

const Monitor = ({ navigation }: Props) => {
  const BLE = useBLE();

  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (BLE.device && BLE.state === "connected") {
      refreshDevice();
    } else {
      setApiKeyError(null);
    }
  }, [BLE.device?.apiKey, BLE.state]);

  const refreshDevice = async () => {
    if (!BLE.device) return;
    if (!BLE.device.apiKey) {
      console.log("not registered");
      setApiKeyError(
        "This device has not been registered, please contact an admin to enable it"
      );
    } else {
      try {
        const resp = await API.get("UserBackend", "/interval", {
          queryStringParameters: {
            apiKey: BLE.device.apiKey,
          },
        });
        BLE.setInterval(BLE.device.deviceId, parseInt(resp));
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

  const battery = useMemo(() => {
    if (!BLE.lastMessage) {
      return {
        percentage: 0,
        charging: false,
      };
    }
    return BLEDecode.getBatteryFromBase64(BLE.lastMessage.value);
  }, [BLE.lastMessage]);

  return (
    <PageView refresh={BLE.device ? refreshDevice : undefined}>
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
            batteryLevel={battery.percentage}
            charging={battery.charging}
          />
          <HeartRate />
          <Connectivity />
          <ReadingInterval />
        </View>
      )}
    </PageView>
  );
};

export default Monitor;

const styles = StyleSheet.create({});
