import { StyleSheet, Text, View } from "react-native";
import React, { Fragment } from "react";

type Props = {
  error: string | null;
};

const ErrorMessage = (props: Props) => {
  if (!props.error) return <Fragment />;
  return (
    <View>
      <Text style={styles.message}>{props.error}</Text>
    </View>
  );
};

export default ErrorMessage;

const styles = StyleSheet.create({
  message: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
