import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useMemo } from "react";
import DevicePreview from "@BLE/components/DevicePreview";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import useBLE from "@BLE/useBLE";

type Props = {
  goToDevice: () => void;
};

const ConnectedDevice = (props: Props) => {
  const BLE = useBLE();

  if (!BLE.device)
    return (
      <View style={{ marginHorizontal: 20 }}>
        <Card height={50} onPress={props.goToDevice} width={350}>
          <View style={{ flexDirection: "row", height: "100%" }}>
            <Text style={{ marginTop: "auto", marginBottom: "auto" }}>
              Please select a device
            </Text>
            <View style={styles.chevronContainer}>
              <Ionicons name={"chevron-forward"} size={20} />
            </View>
          </View>
        </Card>
      </View>
    );

  return (
    <DevicePreview
      device={BLE.device}
      onPress={props.goToDevice}
      showState
      showChevron
    />
  );
};

export default ConnectedDevice;

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    margin: 2,
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 5,
    elevation: 3,
    flexDirection: "row",
  },
  chevronContainer: {
    flexGrow: 1,
    alignItems: "flex-end",
    marginTop: "auto",
    marginBottom: "auto",
  },
});
