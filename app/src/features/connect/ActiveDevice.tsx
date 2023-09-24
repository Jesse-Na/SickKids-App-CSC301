import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import DevicePreview from "@BLE/components/DevicePreview";
import CustomButton from "../../components/CustomButton";
import useBLE from "@BLE/useBLE";
import PageView from "../../components/PageView";
import { API, Auth } from "aws-amplify";
import { AuthState } from "../authentication/AuthWrapper";
import CustomTextInput from "@src/components/CustomTextInput";
import ErrorMessage from "@src/components/ErrorMessage";

type Props = {};

const ActiveDevice = (props: Props) => {
  const BLE = useBLE();
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReset, setReset] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const { isAuthenticated } = useContext(AuthState);

  useEffect(() => {
    if (isAuthenticated && BLE.device?.apiKey) {
      API.get("AdminBackend", "/linked-device", {
        queryStringParameters: {
          apiKey: BLE.device.apiKey,
        },
      })
        .then((device) => {
          setDeviceName(device.name);
        })
        .catch(() => setDeviceName(null));
    } else {
      setDeviceName(null);
    }
  }, [isAuthenticated, BLE.device?.apiKey]);

  const registerDevice = async () => {
    setError(null);

    try {
      await BLE.registerActiveDevice(userId.length > 0 ? userId : undefined);
      setReset(true);
      setUserId("");
      setTimeout(() => {
        setReset(false);
      }, 5000);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const disconnect = () => {
    BLE.disconnectDevice();
  };
  if (!BLE.device) return <Text>No Active Device</Text>;

  return (
    <PageView>
      <Text style={styles.title}>Active Device</Text>
      <DevicePreview device={BLE.device} showState />
      <View style={styles.buttonContainer}>
        <CustomButton title="Disconnect" onPress={disconnect} />
      </View>
      {isAuthenticated && BLE.state === "connected" && (
        <>
          <Text style={{ textAlign: "center", fontSize: 18 }}>
            {deviceName
              ? `This device is registered as ${deviceName}`
              : "This device is not registered"}
          </Text>
          {/* <Text style={{ fontSize: 8 }}>{BLE.device.apiKey}</Text> */}

          {isReset ? (
            <Text style={{ textAlign: "center", fontSize: 18, padding: 10 }}>
              Reset successful
            </Text>
          ) : (
            <>
              <CustomTextInput
                value={userId}
                onChangeText={setUserId}
                placeholder="User Id"
              />
              <CustomButton
                title={deviceName ? "Reset Device" : "Register Device"}
                onPress={registerDevice}
              />
              {deviceName && (
                <Text>
                  Resetting the device will force everyone else to reconnect
                  before they are able to sync their data. Do this whenever you
                  are giving the device to a new person.
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
