import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const CELL_COUNT = 6;
type Props = {
  value: string;
  setValue: (value: string) => void;
};

const CodeInput = (props: Props) => {
  const ref = useBlurOnFulfill({ value: props.value, cellCount: CELL_COUNT });
  const inputRef = React.useRef<any>(null);
  const [fieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value: props.value,
    setValue: props.setValue,
  });
  return (
    <View>
      <Text style={styles.title}>Enter the code</Text>
      <CodeField
        ref={ref}
        {...fieldProps}
        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
        value={props.value}
        onChangeText={props.setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Text
            key={index}
            ref={inputRef}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
    </View>
  );
};

export default CodeInput;

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  title: { fontSize: 20, textAlign: "center" },
  codeFieldRoot: {
    width: 300,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 20,
  },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: "#00000030",
    backgroundColor: "#f3f3f3",

    textAlign: "center",
  },
  focusCell: {
    borderColor: "#000",
  },
});
