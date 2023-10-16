import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Card from "../../components/Card";
import { Ionicons } from "@expo/vector-icons";
import { Device } from "react-native-ble-plx";

type Props = {
  device: Device | null;
};

const heartRate = 120;

const HeartRate = (props: Props) => {
  const [isBig, setIsBig] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (props.device) {
      intervalRef.current && clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setIsBig(true);
        setTimeout(() => {
          setIsBig(false);
        }, ((60 / heartRate) * 1000) / 4);
      }, (60 / heartRate) * 1000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      intervalRef.current && clearInterval(intervalRef.current);
    }
  }, [heartRate, props.device]);
  const size = isBig ? 100 : 96;
  return (
    <Card height={170} width={170}>
      <Text style={styles.title}>HeartRate</Text>
      <View style={{ height: 100 }}>
        <Ionicons
          name={props.device ? "heart" : "heart-dislike"}
          size={size}
          color={props.device ? "#b44" : "#aaa"}
        />
      </View>
      <Text style={{ fontSize: 18 }}>{heartRate} bpm</Text>
    </Card>
  );
};

export default HeartRate;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    color: "#222",
  },
});
