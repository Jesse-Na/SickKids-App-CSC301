import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { CARD_BACKGROUND_COLOR } from "../utils/styles";

type Props = {
  children: React.ReactNode | React.ReactNode[];
  height?: number;
  width?: number;
  grow?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

const Card = (props: Props) => {
  return (
    <TouchableOpacity
      disabled={!props.onPress}
      onPress={props.onPress}
      onLongPress={props.onLongPress ? props.onLongPress : () => {}}
      style={{
        ...styles.card,
        ...(props.height ? { height: props.height } : {}),
        ...(props.width ? { width: props.width } : {}),
        ...(props.grow ? { flexGrow: 1 } : {}),
      }}
    >
      {props.children}
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 10,
    margin: 5,
    padding: 8,
    elevation: 3,
    alignItems: "center",
  },
});
