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
import { DATA_COMMUNICATION_CHARACTERISTIC, DATA_TRANSFER_ACK_INTERVAL, DATA_TRANSFER_FIN, DATA_TRANSFER_OK, DATA_TRANSFER_OUT_OF_ORDER, DATA_TRANSFER_START, DATA_TRANSFER_TIMEOUT, FRAGMENT_INDEX_SIZE, RAW_DATA_CHARACTERISTIC, READING_SAMPLE_LENGTH, STATUS_CHARACTERISTIC, TRANSFER_SERVICE } from "../../utils/constants";
import { DBService } from "@src/services/DBService";
import { Buffer } from "buffer";
import {
  useBLEContext,
  defaultDeviceProperties,
} from "@src/context/BLEContextProvider";
import base64 from "react-native-base64";
import { combineBytes, convertHexToBase64, convertNumberToHex } from "@src/utils/utils";
type Props = NativeStackScreenProps<DeviceStackParamList, "Monitor">;

let sendTransferAckInterval: string | number | NodeJS.Timer | undefined;
let transferTimeoutInterval: string | number | NodeJS.Timer | undefined;
let startTime = performance.now();

const Monitor = ({ navigation }: Props) => {
  const { device, setDevice, deviceProperties, setDeviceProperties } =
    useBLEContext();
  const { batteryLevel, isCharging, heartRate } =
    deviceProperties || defaultDeviceProperties;

  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [deviceUniqueId, setDeviceUniqueId] = useState<string | null>(null);
  const [isMonitoring, setMonitoring] = useState<boolean>(false);

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

    BLEService.setupMonitor(
      TRANSFER_SERVICE,
      STATUS_CHARACTERISTIC,
      async (characteristic) => {
        if (characteristic.value) {
          decodeDataCharacteristic(characteristic.value);
        }
      },
      async (error) => {
        console.error(error);
        BLEService.finishMonitor();
      }
    );

    if (isMonitoring) {
      return;
    }

    startTime = performance.now();
    setMonitoring(true);

    // Write to Transfer Request Char to indicate we are ready to receive data
    let prevExpectedFragmentIndex = 0;
    let lastReceivedFragmentIndex = DATA_TRANSFER_FIN;
    let nextExpectedFragmentIndex = 0;
    let totalFragmentsReceived = 0;
    let fragmentArray: string[] = [];
    let bytesRemainingToCompleteSample = READING_SAMPLE_LENGTH;

    sendTransferAckInterval = setInterval(() => {
      // Send an acknowledgement to the device that we successfully received the message
      BLEService.writeCharacteristicWithoutResponseForDevice(
        TRANSFER_SERVICE,
        DATA_COMMUNICATION_CHARACTERISTIC,
        convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OK) + convertNumberToHex(lastReceivedFragmentIndex, 4))
      ).then(() => {
        console.log("acknowledged fragments up to and including: ", lastReceivedFragmentIndex);
      }).catch((e) => {
        console.error(e);
        finishMonitoring();
      });
    }, DATA_TRANSFER_ACK_INTERVAL);

    transferTimeoutInterval = setInterval(() => {
      if (prevExpectedFragmentIndex === lastReceivedFragmentIndex) {
        console.log("no fragments received in the last ", DATA_TRANSFER_TIMEOUT, " seconds, stopping monitor");
        finishMonitoring();
      } else {
        prevExpectedFragmentIndex = lastReceivedFragmentIndex;
      }
    }, DATA_TRANSFER_TIMEOUT);

    BLEService.writeCharacteristicWithoutResponseForDevice(
      TRANSFER_SERVICE,
      DATA_COMMUNICATION_CHARACTERISTIC,
      convertHexToBase64(convertNumberToHex(DATA_TRANSFER_START))
    ).then(() => {
      console.log("wrote to transfer request char");
      BLEService.setupMonitor(
        TRANSFER_SERVICE,
        RAW_DATA_CHARACTERISTIC,
        (characteristic) => {
          if (characteristic.value) {
            const bufferForCharacteristic = Buffer.from(characteristic.value, "base64");
            console.log("buffer: ", bufferForCharacteristic)
            const fragmentIndex = combineBytes(bufferForCharacteristic, 0, FRAGMENT_INDEX_SIZE);
            console.log("fragment index: ", fragmentIndex)

            // Check if the fragment is a termination fragment
            if (fragmentIndex === DATA_TRANSFER_FIN) {
              // Check if we have received all the fragments
              const numFragmentsSentFromDevice = combineBytes(bufferForCharacteristic, FRAGMENT_INDEX_SIZE, FRAGMENT_INDEX_SIZE + 2);
              console.log(numFragmentsSentFromDevice)
              if (totalFragmentsReceived === numFragmentsSentFromDevice) {
                // Acknowledge the termination fragment
                BLEService.writeCharacteristicWithoutResponseForDevice(
                  TRANSFER_SERVICE,
                  DATA_COMMUNICATION_CHARACTERISTIC,
                  convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OK) + convertNumberToHex(DATA_TRANSFER_FIN, 4))
                ).then(() => {
                  console.log(convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OK) + convertNumberToHex(DATA_TRANSFER_FIN, 4)))
                  console.log("acknowledged termination fragment");
                })

                if (totalFragmentsReceived === 0) {
                  finishMonitoring();
                } else {
                  resetMonitoring();
                }

                return;
              }
            }

            // Drop out of order fragments
            if (fragmentIndex !== nextExpectedFragmentIndex) {
              BLEService.writeCharacteristicWithoutResponseForDevice(
                TRANSFER_SERVICE,
                DATA_COMMUNICATION_CHARACTERISTIC,
                convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OUT_OF_ORDER) + convertNumberToHex(lastReceivedFragmentIndex, 4))
              ).then(() => {
                console.log(convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OUT_OF_ORDER) + convertNumberToHex(lastReceivedFragmentIndex, 4)))
                console.log("chunk out of sequence error thrown");
              });
              return;
            }

            const fragmentData = bufferForCharacteristic.subarray(FRAGMENT_INDEX_SIZE, FRAGMENT_INDEX_SIZE + READING_SAMPLE_LENGTH);
            console.log("fragment data: ", fragmentData)
            fragmentArray.push(fragmentData.join(""));
            bytesRemainingToCompleteSample -= fragmentData.length;
            totalFragmentsReceived++;
            nextExpectedFragmentIndex++;
            lastReceivedFragmentIndex = fragmentIndex;

            if (nextExpectedFragmentIndex >= DATA_TRANSFER_FIN) {
              nextExpectedFragmentIndex = 0;
            }

            if (bytesRemainingToCompleteSample <= 0) {
              // Compile fragments into sample and save to DB
              const sample = fragmentArray.join("").substring(0, READING_SAMPLE_LENGTH);

              // decodeDataCharacteristic(sample);
              console.log("sample: ", sample);
              DBService.saveReading(sample, deviceUniqueId);
              // APIService.syncToCloudForDevice(device.id);

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
      finishMonitoring();
    });

  }, [device, apiKey, deviceUniqueId, isMonitoring]);

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

  const resetMonitoring = () => {
    setMonitoring(false);
    clearInterval(sendTransferAckInterval);
    clearInterval(transferTimeoutInterval);
    BLEService.finishMonitor();
  }

  const finishMonitoring = () => {
    console.log("finished monitoring in", performance.now() - startTime);
    setMonitoring(true);
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
