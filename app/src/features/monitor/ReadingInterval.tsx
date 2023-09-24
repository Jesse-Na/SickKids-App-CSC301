import React, { useContext } from "react";
import Card from "../../components/Card";
import { StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BLEContext } from "@BLE/BLEWrapper";
import { convertMsToString } from "@src/utils/utils";

type Props = {};

export default function ReadingInterval({}: Props) {
  const { device } = useContext(BLEContext);
  const interval = device?.readInterval;
  return (
    <Card height={170} width={170}>
      <Text style={styles.title}>Reading Interval</Text>

      <MaterialIcons
        name="timer"
        size={80}
        color="#000"
        style={{ padding: 10 }}
      />
      {interval && (
        <Text style={{ padding: 5, opacity: 0.5, fontSize: 13 }}>
          Every {convertMsToString(interval)}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    color: "#222",
  },
});
