import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import moment, { Moment } from "moment";

type Props = {
  date: Moment;
  hidden?: boolean;
  height: string;
  onPress?: () => void;
  isSelected?: boolean;
  hasReport: boolean;
};

const CalendarDay = (props: Props) => {
  const backgroundColor = useMemo(() => {
    if (props.hasReport) return "green";
    if (props.date.isSame(moment(), "day")) return "blue";
    if (props.date.isAfter(moment(), "date")) return "#aaa";
    return "red";
  }, [props.date]);

  const borderWidth = useMemo(() => {
    if (props.isSelected) return 4;
    return 0;
  }, [props.date]);

  return (
    <Pressable
      disabled={props.hidden || props.date.isAfter(moment(), "date")}
      onPress={props.onPress}
      style={{ height: props.height, width: `${100 / 7}%` }}
    >
      {!props.hidden && (
        <View
          style={{
            borderRadius: 5,
            backgroundColor,
            borderWidth,
            width: "90%",
            height: "90%",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            {props.date.format("D")}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default CalendarDay;

const styles = StyleSheet.create({});
