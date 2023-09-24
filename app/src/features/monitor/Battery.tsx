import { StyleSheet, Text, View } from "react-native";
import React, { useMemo, useState } from "react";
import ProgressCircle from "react-native-progress-circle";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import { CARD_BACKGROUND_COLOR } from "../../utils/styles";

type Props = {
  batteryLevel: number;
  charging: boolean;
};
const Battery = ({ batteryLevel, charging }: Props) => {
  const estimatedLife = useMemo(() => {
    const hours = Math.round((batteryLevel / 100) * 168);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${
      days > 0 ? `${days} day${days != 1 ? "s" : ""}, ` : ""
    }${remainingHours} hour${remainingHours != 1 ? "s" : ""}`;
  }, [batteryLevel]);
  return (
    <Card height={170} width={170}>
      <Text style={styles.title}>Battery</Text>
      <ProgressCircle
        percent={batteryLevel}
        radius={50}
        borderWidth={8}
        color={
          charging || batteryLevel > 50
            ? "#07ab07"
            : batteryLevel > 20
            ? "#b4bd17"
            : "#bd1717"
        }
        shadowColor="#999"
        bgColor={CARD_BACKGROUND_COLOR}
      >
        <Text style={{ fontSize: 21 }}>{`${Math.ceil(batteryLevel)}%`}</Text>
        {charging && <Ionicons name="flash" size={20} />}
      </ProgressCircle>
      <Text style={styles.estimatedLife}>~{estimatedLife}</Text>
    </Card>
  );
};

export default Battery;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    color: "#222",
  },
  container: {
    width: 175,
    backgroundColor: "white",
    alignItems: "center",
    padding: 2,
    margin: 20,
    borderRadius: 10,
    elevation: 3,
  },
  estimatedLife: {
    fontSize: 12,
    color: "#666",
    paddingTop: 10,
  },
});
