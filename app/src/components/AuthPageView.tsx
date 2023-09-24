import { StyleSheet, Text, View } from "react-native";
import React from "react";
import PageView from "./PageView";
import Card from "./Card";

type Props = {
  children: React.ReactNode;
  title: string;
};

const AuthPageView = (props: Props) => {
  return (
    <PageView>
      <View
        style={{
          height: "100%",
          paddingTop: "20%",
        }}
      >
        <Text style={styles.title}>{props.title}</Text>
        {props.children}
      </View>
    </PageView>
  );
};

export default AuthPageView;

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
