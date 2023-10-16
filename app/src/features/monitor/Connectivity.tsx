import { StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import Card from "../../components/Card";
import { MaterialIcons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import moment from "moment";
import { Device } from "react-native-ble-plx";

type Props = {
  device: Device | null;
};

const iconSize = 60;
const Connectivity = (props: Props) => {
  //get the state of the device internet connection

  const netInfo = useNetInfo();

  const connectionText = useMemo(() => {
    return null;
    // if (BLE.device && BLE.state === "connected") {
    //   return null;
    // } else if (moment(BLE.lastDisconnected).isAfter(BLE.lastConnected)) {
    //   return `${moment(BLE.lastDisconnected).fromNow()}`;
    // } else {
    //   return `${moment(BLE.lastConnected).fromNow()}`;
    // }
  }, []);

  return (
    <Card width={350} height={170}>
      <Text style={styles.title}>Connectivity</Text>
      <View
        style={{
          height: iconSize,
          marginTop: 20,
          width: iconSize * 5,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <MaterialIcons
          name={props.device ? "bluetooth" : "bluetooth-disabled"}
          size={iconSize}
          color={props.device ? "#11e" : "#aaa"}
        />
        <MaterialIcons
          name="arrow-right-alt"
          size={iconSize}
          color={props.device ? "#11e" : "#aaa"}
        />
        <MaterialIcons name="smartphone" size={iconSize} color="#000" />
        <MaterialIcons
          name="arrow-right-alt"
          size={iconSize}
          color={netInfo.isConnected ? "#171" : "#aaa"}
        />
        <MaterialIcons
          name={netInfo.isConnected ? "cloud-upload" : "cloud-off"}
          size={iconSize}
          color={netInfo.isConnected ? "#171" : "#aaa"}
        />
      </View>
      {!props.device && (
        <Text style={{ padding: 20, opacity: 0.5, fontSize: 13 }}>
          Bluetooth last connected {connectionText}
        </Text>
      )}
    </Card>
  );
};

export default Connectivity;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    color: "#222",
    textAlign: "center",
  },
});
