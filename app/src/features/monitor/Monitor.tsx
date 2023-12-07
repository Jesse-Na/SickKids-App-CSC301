import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ConnectedDevice from "./ConnectedDevice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DeviceStackParamList } from "../tabs/DeviceTab";
import Battery from "./Battery";
import PageView from "../../components/PageView";
import HeartRate from "./HeartRate";
import Connectivity from "./Connectivity";
import { BLEService } from "@src/services/BLEService";
import { APIService } from "@src/services/APIService";
import { DATA_COMMUNICATION_CHARACTERISTIC_UUID, DATA_TRANSFER_ACK_INTERVAL, DATA_TRANSFER_FIN_CODE, DATA_TRANSFER_OK_CODE, DATA_TRANSFER_OUT_OF_ORDER_CODE, DATA_TRANSFER_START_CODE, DATA_TRANSFER_TIMEOUT, DEVICE_TO_SERVER_BATCH_SIZE, FRAGMENT_INDEX_SIZE, RAW_DATA_CHARACTERISTIC_UUID, READING_SAMPLE_LENGTH, STATUS_CHARACTERISTIC_UUID, TRANSFER_SERVICE_UUID } from "../../utils/constants";
import { DBService } from "@src/services/DBService";
import { Buffer } from "buffer";
import {
  useBLEContext,
  defaultDeviceProperties,
} from "@src/context/BLEContextProvider";
import base64 from "react-native-base64";
import { combineBytes, convertHexToBase64, convertNumberToHex } from "@src/utils/utils";
type Props = NativeStackScreenProps<DeviceStackParamList, "Monitor">;

const Monitor = ({ navigation }: Props) => {
  const { device, setDevice, deviceProperties, setDeviceProperties } =
    useBLEContext();
  const { batteryLevel, isCharging, heartRate } =
    deviceProperties || defaultDeviceProperties;

  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [deviceUniqueId, setDeviceUniqueId] = useState<string | null>(null);
  const [isMonitoring, setMonitoring] = useState<boolean>(false);
  const [isTransferring, setTransferring] = useState<boolean>(false);

  // Decode the status characteristic value for realtime updates of battery level, heart rate, and charging status
  const decodeStatusCharacteristic = (characteristicValue: string) => {
    const decoded = base64.decode(characteristicValue);

    const battery: number = !Number.isNaN(decoded.charCodeAt(4))
      ? decoded.charCodeAt(4)
      : 0;
    setDeviceProperties("batteryLevel", battery);

    const heartRate: number = !Number.isNaN(decoded.charCodeAt(14))
      ? decoded.charCodeAt(8)
      : 0;

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

      // Check if there is a device cached in the DB
      DBService.getLatestCloudSyncInfo()
        .then(async (info) => {
          await BLEService.connectToDevice(info.ble_interface_id)
            .then((device) => {
              setDevice(device);
            }).catch((e) => {
              console.error(e);
            });
        }).catch((e) => {
          console.error(e);
        });

      return;
    }

    setDevice(device);

    if (!apiKey || !deviceUniqueId) {
      // Get the API key and unique device ID for this device
      DBService.getCloudSyncInfoForBleInterfaceId(device.id)
        .then((info) => {
          if (info.api_key && info.device_id) {
            setDeviceUniqueId(info.device_id);
            setApiKey(info.api_key);
          } else {
            console.log("not registered");
            setApiKeyError(
              "This device has not been registered, please contact an admin to enable it"
            );
          }
        })
        .catch((e) => {
          console.error(e);
        });

      return;
    } else {
      refreshDevice();
    }

    if (!isMonitoring) {
      setMonitoring(true);

      // Setup monitor for status characteristic which tracks realtime battery level, heart rate, and charging status
      BLEService.setupMonitor(
        TRANSFER_SERVICE_UUID,
        STATUS_CHARACTERISTIC_UUID,
        async (characteristic) => {
          if (characteristic.value) {
            decodeStatusCharacteristic(characteristic.value);
          }
        },
        async (error) => {
          console.error(error);
          setMonitoring(false);
          BLEService.finishMonitor();
        }
      );
    }

    if (isTransferring) {
      return;
    }

    // Start data transfer
    setTransferring(true);

    if (BLEService.startDataTransfer(deviceUniqueId)) {
      // More data to transfer so immediately start the next transfer
      setTransferring(false);
    } else {
      setTimeout(() => {
        setTransferring(false);
      }, 30000);
    }

  }, [device, apiKey, deviceUniqueId, isTransferring]);

  const refreshDevice = async () => {
    try {
      if (device) {
        console.log("refreshing device");
        await APIService.getReadingInterval(device.id); // Reading interval will be written to device upon next connection
        setApiKeyError(null);
      }
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
        </View>
      )}
    </PageView>
  );
};

export default Monitor;



const styles = StyleSheet.create({});
