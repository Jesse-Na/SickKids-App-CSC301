import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children: React.ReactNode | React.ReactNode[];
  refresh?: () => Promise<void>;
};

const PageView = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    if (!props.refresh) return;
    setRefreshing(true);
    props.refresh().then(() => setRefreshing(false));
  };
  return (
    <View style={styles.backgroundContainer}>
      <LinearGradient
        colors={["#c6dbf0", "#AbCaE0"]}
        start={{ x: 0.1, y: 0.1 }}
        style={styles.background}
      />
      <ScrollView
        style={styles.view}
        refreshControl={
          props.refresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View style={styles.container}>{props.children}</View>
      </ScrollView>
    </View>
  );
};

export default PageView;

const styles = StyleSheet.create({
  view: {
    height: "100%",
  },
  background: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  container: {
    padding: 10,
  },
  backgroundContainer: {
    height: "100%",
  },
});
