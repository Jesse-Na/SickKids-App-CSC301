import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import CalendarDay from "./CalendarDay";
import moment from "moment";
import CustomTextInput from "@src/components/CustomTextInput";
import { UsageReport } from "./selfReporting.utils";

type Props = {
  selectedDate: moment.Moment;
  reports: UsageReport[];
  setSelectedDate: (date: moment.Moment) => void;
};

const Calendar = ({ selectedDate, setSelectedDate, reports }: Props) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const currentMonth = moment().startOf("month").add(monthOffset, "months");
  const numWeeksInMonth =
    currentMonth
      .clone()
      .endOf("month")
      .diff(currentMonth.clone().startOf("week"), "weeks") + 1;
  return (
    <View style={{ padding: 10, backgroundColor: "#eee" }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 35,
          marginLeft: "auto",
          marginRight: "auto",
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity onPress={() => setMonthOffset((o) => o - 1)}>
          <Text style={{ fontSize: 30 }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 30 }}>{currentMonth.format("MMMM YYYY")}</Text>
        <TouchableOpacity
          onPress={() => setMonthOffset((o) => o + 1)}
          disabled={monthOffset >= 0}
        >
          <Text style={{ fontSize: 30, opacity: monthOffset >= 0 ? 0.2 : 1 }}>
            {">"}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          maxHeight: 300,
          aspectRatio: `7/${numWeeksInMonth}`,
          flexDirection: "row",
          flexWrap: "wrap",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {[...new Array(7 * numWeeksInMonth)].map((_, i) => {
          const day = currentMonth.clone().startOf("week").add(i, "days");
          return (
            <CalendarDay
              onPress={() => {
                if (
                  day.isAfter(moment(), "date") ||
                  !day.isSame(currentMonth, "month")
                )
                  return;
                setSelectedDate(day.clone());
              }}
              hasReport={reports.some(
                (r) => r.date == day.format("YYYY-MM-DD")
              )}
              isSelected={selectedDate?.isSame(day, "date")}
              key={i}
              height={`${100 / numWeeksInMonth}%`}
              date={day}
              hidden={!day.isSame(currentMonth, "month")}
            />
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({});
