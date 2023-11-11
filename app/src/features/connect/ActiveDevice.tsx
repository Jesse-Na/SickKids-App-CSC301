import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import DevicePreview from "@BLE/components/DevicePreview";
import CustomButton from "../../components/CustomButton";
import PageView from "../../components/PageView";
import { BLEService } from "@src/services/BLEService";
import { Device } from "react-native-ble-plx";
import { useBLEContext } from "@src/context/BLEContextProvider";
import { AuthState } from "../authentication/AuthWrapper";
import ErrorMessage from "@src/components/ErrorMessage";
import CustomTextInput from "@src/components/CustomTextInput";
import { APIService } from "@src/services/APIService";
import { API_KEY_CHARACTERISTIC, SECURITY_SERVICE } from "@BLE/constants";
import base64 from "react-native-base64";

type Props = {
  device: Device;
};

const ActiveDevice = (props: Props) => {
  const { device, setDevice } = useBLEContext();
  const { isAuthenticated } = useContext(AuthState);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setRegistering] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  const registerDevice = async () => {
    setError(null);
    setRegistering(true);
    console.log("Registering Device")

    APIService.registerDevice(device?.id ?? null, userId)
      .then((apiKey) => {
        // Write the API Key to the device
        BLEService.writeCharacteristicWithoutResponseForDevice(SECURITY_SERVICE, API_KEY_CHARACTERISTIC, base64.encode(apiKey))
      })
      .then(() => {
        console.log("registered")
        setUserId("");
      })
      .catch((e) => {
        console.error(e)
        setError(e.message);
      })
      .finally(() => {
        setRegistering(false);
      });
  };

  const disconnect = async () => {
    BLEService.disconnectDevice();
    setDevice(null)
    BLEService.finishMonitor()
  };

  if (!props.device) return <Text>No Active Device</Text>;

  return (
    <PageView>
      <Text style={styles.title}>Active Device</Text>
      <DevicePreview device={props.device} showState />
      <View style={styles.buttonContainer}>
        <CustomButton title="Disconnect" onPress={disconnect} />
      </View>
      {isAuthenticated && device && (
        <>
          <Text style={{ textAlign: "center", fontSize: 18 }}>
            {device.name
              ? `This device is registered as ${device.name}`
              : "This device is not registered"}
          </Text>
          {/* <Text style={{ fontSize: 8 }}>{BLE.device.apiKey}</Text> */}

          {isRegistering ? (
            <Text style={{ textAlign: "center", fontSize: 18, padding: 10 }}>
              Registering
            </Text>
          ) : (
            <>
              <CustomTextInput
                value={userId}
                onChangeText={setUserId}
                placeholder="User Id"
              />
              <CustomButton
                title={"Register Device"}
                onPress={registerDevice}
              />
              {device.name && (
                <Text>
                  Registering the device will assign the connected device to the
                  new user. Do this whenever you are giving the device to a new person.
                </Text>
              )}
            </>
          )}
          {error && <ErrorMessage error={error} />}
        </>
      )}
    </PageView>
  );
};

export default ActiveDevice;

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 20,
    padding: 10,
  },
  container: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
