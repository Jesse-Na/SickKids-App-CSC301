import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { BLEDevice, BLEState } from "@BLE/ble.types";
import { CARD_BACKGROUND_COLOR } from "../../utils/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { Device } from "react-native-ble-plx";

type Props = {
  device: Device;
  isLoading?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  showState?: boolean;
  showChevron?: boolean;
};

const DevicePreview = (props: Props) => {
  return (
    <TouchableOpacity
      disabled={!props.onPress}
      onPress={props.onPress}
      onLongPress={props.onLongPress ? props.onLongPress : () => {}}
      style={styles.card}
    >
      <View style={styles.container}>
        <View>
          <Text style={styles.name}>
            {props.device.name ?? "Unknown"}
          </Text>
          <Text style={styles.id}>{props.device.id}</Text>
        </View>

        <View style={styles.moreInfoContainer}>
          {props.showState && (
            <View
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
            >
              {/* <Text>{deviceState}</Text> */}
              {props.isLoading && <ActivityIndicator size="small" />}
            </View>
          )}
        </View>
        {!props.isLoading && (
          <View
            style={{
              marginVertical: "auto",
              marginTop: 3,
              height: 30,
            }}
          >
            {props.showChevron && (
              <View style={{ paddingLeft: 2 }}>
                <MaterialIcons name="chevron-right" size={30} />
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default DevicePreview;

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 10,
    width: 350,
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 10,
    elevation: 3,
    display: "flex",
    flexDirection: "row",
  },
  moreInfoContainer: {
    flexGrow: 1,
    alignItems: "flex-end",
    marginTop: "auto",
    marginBottom: "auto",
  },
  container: {
    flexDirection: "row",
    flexGrow: 1,
  },
  name: {
    fontSize: 20,
  },
  id: {
    opacity: 0.5,
    fontSize: 10,
  },
});
