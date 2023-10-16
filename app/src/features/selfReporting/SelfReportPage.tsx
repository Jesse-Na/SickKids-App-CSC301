import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import CustomTextInput from "@src/components/CustomTextInput";
import CustomButton from "@src/components/CustomButton";
import Calendar from "./Calendar";
import moment from "moment";
import {
  UsageReport,
  addReport,
  getAllReports,
  removeReport,
} from "./selfReporting.utils";
import { API } from "aws-amplify";
import { APIService } from "@src/services/APIService";

type Props = {
  goToDeviceSelect: () => void;
};

const SelfReportPage = (props: Props) => {
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const [reports, setReports] = useState<UsageReport[]>([]);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  const reloadReports = () => {
    if (apiKey) {
      API.get("UserBackend", "/selfReporting", {
        queryStringParameters: {
          apiKey: apiKey,
        },
      }).then((reports) => {
        console.log("GOT REPORTS", reports);
        setReports(reports);
      });
    }
  };

  useEffect(() => {
    reloadReports();

    setApiKey(APIService.getApiKey());
  }, [APIService.getApiKey()]);

  const hoursError = useMemo(() => {
    if (hours === "") return false;
    const hoursNumber = Number(hours);
    if (isNaN(hoursNumber)) return true;
    if (hoursNumber == 24) {
      return minutes != "" && Number(minutes) > 0;
    }
    return hoursNumber < 0 || hoursNumber > 24;
  }, [hours, minutes]);
  const minutesError = useMemo(() => {
    if (minutes === "") return false;
    const minutesNumber = Number(minutes);
    if (isNaN(minutesNumber)) return true;
    return minutesNumber < 0 || minutesNumber > 59;
  }, [minutes]);
  const totalTime = useMemo(() => {
    const hoursValue = hours == "" ? 0 : parseInt(hours);
    const minutesValue = minutes == "" ? 0 : parseInt(minutes);
    return (
      (isNaN(hoursValue) ? 0 : hoursValue) * 60 +
      (isNaN(minutesValue) ? 0 : minutesValue)
    );
  }, [hours, minutes]);

  const submit = () => {
    console.log("submitting");
    const newReport = {
      date: selectedDate.format("YYYY-MM-DD"),
      minutes: totalTime,
    };
    API.post("UserBackend", "/selfReporting", {
      body: newReport,
      queryStringParameters: {
        apiKey: apiKey,
      },
    }).then((reports) => {
      console.log("got reports", reports);
      setReports(reports);
    });
  };
  const handleSubmit = () => {
    Alert.alert(
      "Confirm Submission",
      `Do you want to submit you wore them for ${
        hours.length == 0 ? 0 : hours
      } hours and ${
        minutes.length == 0 ? 0 : minutes
      } minutes. This cannot be changed.`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: () => submit(),
        },
      ]
    );
  };
  const existingReport = useMemo(() => {
    return (
      reports.find((r) => r.date === selectedDate.format("YYYY-MM-DD")) ?? null
    );
  }, [selectedDate, reports]);

  useEffect(() => {
    if (existingReport) {
      setHours(String(Math.floor(existingReport.minutesWorn / 60)));
      setMinutes(String(existingReport.minutesWorn % 60));
    } else {
      setHours("");
      setMinutes("");
    }
  }, [existingReport]);
  return (
    <ScrollView style={{ paddingTop: 20 }}>
      <Text style={{ textAlign: "center", fontSize: 30 }}>
        {selectedDate.format("MMMM Do YYYY")}
      </Text>
      {apiKey ? (
        <>
          {!existingReport ? (
            <View>
              <Text style={{ textAlign: "center", fontSize: 20 }}>
                How long did you wear the socks?
              </Text>
              <View
                style={{ display: "flex", flexDirection: "row", padding: 15 }}
              >
                <View style={{ width: 110 }}>
                  <Text
                    style={{
                      paddingLeft: 15,
                      fontSize: 16,
                      color: hoursError ? "red" : "black",
                    }}
                  >
                    Hours
                  </Text>
                  <CustomTextInput
                    error={hoursError}
                    placeholder="0"
                    value={hours}
                    onChangeText={(text) => setHours(text.slice(0, 2))}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
                <View style={{ width: 110 }}>
                  <Text
                    style={{
                      paddingLeft: 15,
                      fontSize: 16,
                      color: minutesError ? "red" : "black",
                    }}
                  >
                    Minutes
                  </Text>
                  <CustomTextInput
                    error={minutesError}
                    style={{ borderColor: "red" }}
                    placeholder="0"
                    value={minutes}
                    onChangeText={(text) => setMinutes(text.slice(0, 2))}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>
              <CustomButton
                title="Submit"
                onPress={handleSubmit}
                disabled={minutesError || hoursError || !apiKey}
              />
            </View>
          ) : (
            <View>
              <Text style={{ textAlign: "center", fontSize: 20, padding: 25 }}>
                You wore them for {hours} hours and {minutes} minutes
              </Text>
            </View>
          )}
        </>
      ) : (
        <CustomButton
          title="Please select a device"
          onPress={props.goToDeviceSelect}
        />
      )}
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        reports={reports}
      />
    </ScrollView>
  );
};

export default SelfReportPage;

const styles = StyleSheet.create({});
