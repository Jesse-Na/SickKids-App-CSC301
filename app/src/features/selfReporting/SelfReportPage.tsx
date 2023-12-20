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
import { UsageReport } from "./selfReporting.utils";
import { APIService } from "@src/services/APIService";
import { DBService } from "@src/services/DBService";
import { useBLEContext } from "@src/context/BLEContextProvider";

type Props = {
  goToDeviceSelect: () => void;
};

const SelfReportPage = (props: Props) => {
  // hook to retrieve compression garment context information
  const { device } = useBLEContext();

  // state to manage report information on wear usage
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const [reports, setReports] = useState<UsageReport[]>([]);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  // reload usage reports from the server
  const reloadReports = () => {
    if (device) {
      APIService.getSelfReports(device.id).then((reports) => {
        setReports(reports);
      }).catch((e) => {
        console.error(e);
      });
    }
  };

  // useEffect to load API key and reports when the device changes
  useEffect(() => {
    if (!device) {
      return;
    }

    // Get the API Key for the device
    DBService.getCloudSyncInfoForBleInterfaceId(device.id)
      .then((info) => {
        if (info.api_key && info.device_id) {
          setApiKey(info.api_key);
        } else {
          console.log("not registered");
        }
      })
      .catch((e) => {
        console.error(e);
      });

    reloadReports();
  }, [device]);

  // useMemo to validate input from users on wear time, make sure it is a valid report
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

  // submits the self-report
  const submit = () => {
    if (device) {
      console.log("submitting self report");
      APIService.addSelfReport(device.id, selectedDate, totalTime).then((selfReports) => {
        setReports(selfReports);
      }).catch((e) => {
        console.error(e);
      });
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      "Confirm Submission",
      `Do you want to submit you wore them for ${hours.length == 0 ? 0 : hours
      } hours and ${minutes.length == 0 ? 0 : minutes
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

  // retrieve an existing report for the selected date
  const existingReport = useMemo(() => {
    return (
      reports.find((r) => r.date === selectedDate.format("YYYY-MM-DD")) ?? null
    );
  }, [selectedDate, reports]);

  // update input values based on an existing report
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
