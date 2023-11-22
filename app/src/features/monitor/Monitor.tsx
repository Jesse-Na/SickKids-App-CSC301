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
import { APIService } from "@src/services/APIService";
import { DATA_COMMUNICATION_CHARACTERISTIC, DATA_TRANSFER_ACK_INTERVAL, DATA_TRANSFER_FIN, DATA_TRANSFER_OK, DATA_TRANSFER_OUT_OF_ORDER, DATA_TRANSFER_START, DATA_TRANSFER_TIMEOUT, FRAGMENT_INDEX_SIZE, RAW_DATA_CHARACTERISTIC, READING_SAMPLE_LENGTH, TRANSFER_SERVICE } from "../../utils/constants";
import base64 from "react-native-base64";
import { DBService } from "@src/services/DBService";
import { Buffer } from "buffer";
import {
  useBLEContext,
  defaultDeviceProperties,
} from "@src/context/BLEContextProvider";
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
  const [sendTransferAckInterval, setSendTransferAckInterval] = useState<any>(null);
  const [transferTimeoutInterval, setTransferTimeoutInterval] = useState<any>(null);

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

    if (isMonitoring) {
      return;
    }

    // Write to Transfer Request Char to indicate we are ready to receive data
    let prevExpectedFragmentIndex = 0;
    let nextExpectedFragmentIndex = 0;
    let totalFragmentsReceived = 0;
    let fragmentArray: string[] = [];
    let bytesRemainingToCompleteSample = READING_SAMPLE_LENGTH;

    setSendTransferAckInterval(setInterval(() => {
      // Send an acknowledgement to the device that we successfully received the message
      BLEService.writeCharacteristicWithoutResponseForDevice(
        TRANSFER_SERVICE,
        DATA_COMMUNICATION_CHARACTERISTIC,
        base64.encode(DATA_TRANSFER_OK.toString() + (nextExpectedFragmentIndex - 1).toString())
      ).then(() => {
        console.log("acknowledged fragments up to and including: ", nextExpectedFragmentIndex - 1);
      });
    }, DATA_TRANSFER_ACK_INTERVAL));

    setTransferTimeoutInterval(setInterval(() => {
      if (prevExpectedFragmentIndex === nextExpectedFragmentIndex) {
        console.log("no fragments received in the last ", DATA_TRANSFER_TIMEOUT, " seconds, restarting");
        finishMonitoring();
      } else {
        prevExpectedFragmentIndex = nextExpectedFragmentIndex;
      }
    }, DATA_TRANSFER_TIMEOUT));

    BLEService.writeCharacteristicWithoutResponseForDevice(
      TRANSFER_SERVICE,
      DATA_COMMUNICATION_CHARACTERISTIC,
      base64.encode(DATA_TRANSFER_START.toString())
    ).then(() => {
      console.log("wrote to transfer request char");
      BLEService.setupMonitor(
        TRANSFER_SERVICE,
        RAW_DATA_CHARACTERISTIC,
        async (characteristic) => {
          if (characteristic.value) {
            const decodedString = base64.decode(characteristic.value);
            const fragmentIndex = combineBytes(Buffer.from(decodedString), 0, FRAGMENT_INDEX_SIZE);

            // Check if the fragment is a termination fragment
            if (fragmentIndex === DATA_TRANSFER_FIN) {
              // Check if we have received all the fragments
              const numFragmentsSentFromDevice = combineBytes(Buffer.from(decodedString), FRAGMENT_INDEX_SIZE, FRAGMENT_INDEX_SIZE + 2);
              if (totalFragmentsReceived === numFragmentsSentFromDevice) {
                // Acknowledge the termination fragment
                BLEService.writeCharacteristicWithoutResponseForDevice(
                  TRANSFER_SERVICE,
                  DATA_COMMUNICATION_CHARACTERISTIC,
                  base64.encode(DATA_TRANSFER_OK.toString()  + DATA_TRANSFER_FIN.toString())
                ).then(() => {
                  console.log("acknowledged termination");
                });
                finishMonitoring();
                return;
              }
            }

            // Drop out of order fragments
            if (fragmentIndex !== nextExpectedFragmentIndex) {
              BLEService.writeCharacteristicWithoutResponseForDevice(
                TRANSFER_SERVICE,
                DATA_COMMUNICATION_CHARACTERISTIC,
                base64.encode(DATA_TRANSFER_OUT_OF_ORDER.toString() + (nextExpectedFragmentIndex - 1).toString())
              ).then(() => {
                console.log("chunk out of sequence error thrown");
              });
              return;
            }

            const fragmentData = decodedString.substring(FRAGMENT_INDEX_SIZE);
            fragmentArray.push(fragmentData);
            bytesRemainingToCompleteSample -= fragmentData.length;
            totalFragmentsReceived++;
            nextExpectedFragmentIndex++;

            if (nextExpectedFragmentIndex >= DATA_TRANSFER_FIN) {
              nextExpectedFragmentIndex = 0;
            }

            if (bytesRemainingToCompleteSample <= 0) {
              // Compile fragments into sample and save to DB
              const sample = fragmentArray.join("").substring(0, READING_SAMPLE_LENGTH);

              DBService.saveReading(sample, deviceUniqueId);
              APIService.syncToCloudForDevice(device.id);

              // Reset state
              fragmentArray = [];
              bytesRemainingToCompleteSample = READING_SAMPLE_LENGTH;
            }
          }
        },
        async (error) => {
          console.error(error);
          finishMonitoring();
        }
      );
    }).catch((e) => {
      console.error(e);
    });

  }, [device, apiKey, deviceUniqueId]);

  const setReadingInterval = async (interval: number) => { };

  const refreshDevice = async () => {
    try {
      if (device) {
        const resp = await APIService.getReadingInterval(device.id);
        setReadingInterval(parseInt(resp));
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

  const finishMonitoring = () => {
    setMonitoring(false);
    clearInterval(sendTransferAckInterval);
    clearInterval(transferTimeoutInterval);
    BLEService.finishMonitor();
  }

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
