import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import moment, { Moment } from "moment";

/**
 * CalendarDay Component
 * @param {Object} props - properties for CalendarDay component.
 * @param {Moment} props.date - date represented by CalendarDay.
 * @param {boolean} [props.hidden] - indicates whether the day should be hidden. CalendarDays that have a report and have passed should be hidden.
 * @param {boolean} props.hasReport - indicates whether there is a report for the day.
 * @returns {React.Component} - represents a day of reporting in the calendar.
 */

type Props = {
  date: Moment;
  hidden?: boolean;
  height: string;
  onPress?: () => void;
  isSelected?: boolean;
  hasReport: boolean;
};

const CalendarDay = (props: Props) => {
  // determine the background color based on the properties of the day. if yes, the the colour will be green. if not and CalendarDay is today, the colour is blue. 
  // if there is no report and CalendarDay has already passed, the colour is red to indicate a missing report.
  const backgroundColor = useMemo(() => {
    if (props.hasReport) return "green";
    if (props.date.isSame(moment(), "day")) return "blue";
    if (props.date.isAfter(moment(), "date")) return "#aaa";
    return "red";
  }, [props.date]);

  // determine the border width based on whether the day is selected. if not selected, the width is 0 so the day is hidden.
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
