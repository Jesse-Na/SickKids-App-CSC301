import {
  View,
  StyleSheet,
  TextInput,
  TextInputProps,
  Text,
} from "react-native";
import React from "react";

interface Props extends TextInputProps {
  error?: boolean;
}

const CustomTextInput = ({ error, ...props }: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        {...props}
        style={{
          ...styles.input,
          ...(error ? { borderColor: "red" } : { borderColor: "#ccc" }),
        }}
        placeholderTextColor={"#666"}
      />
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    height: 50,
    padding: 8,
    margin: 2,
    backgroundColor: "#f3f3f3",
    borderWidth: 1,

    marginHorizontal: 10,
    flexGrow: 1,
    fontSize: 18,
    color: "black",
  },
  container: {
    flexDirection: "row",
  },
});
