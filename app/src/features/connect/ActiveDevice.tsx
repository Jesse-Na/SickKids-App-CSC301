import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import DevicePreview from "@BLE/components/DevicePreview";
import CustomButton from "../../components/CustomButton";
import PageView from "../../components/PageView";
import { BLEService } from "@src/services/BLEService";
import { Device } from "react-native-ble-plx";
import { useBLEContext } from "@src/context/BLEContextProvider";

type Props = {
  device: Device;
};

const ActiveDevice = (props: Props) => {
  const { setDevice } = useBLEContext();
  const [error, setError] = useState<string | null>(null);

  const registerDevice = async () => {
    setError(null);
    console.log("Registering Device")

    BLEService.registerDevice()
      .then(() => {
        console.log("registered")
      })
      .catch((e) => {
        console.error(e)
      });
  };

  const disconnect = async () => {
    BLEService.disconnectDevice();
    setDevice(null)
    await BLEService.finishMonitor()
  };

  if (!props.device) return <Text>No Active Device</Text>;

  return (
    <PageView>
      <Text style={styles.title}>Active Device</Text>
      <DevicePreview device={props.device} showState />
      <View style={styles.buttonContainer}>
        <CustomButton title="Disconnect" onPress={disconnect} />
      </View>
      <CustomButton
        title={"Register Device"}
        onPress={registerDevice}
      />
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
