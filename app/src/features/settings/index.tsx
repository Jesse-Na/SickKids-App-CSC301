import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import CustomButton from "../../components/CustomButton";
import PageView from "../../components/PageView";
import { Auth } from "aws-amplify";
import { scheduleNotifications } from "../../utils/notifications";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../tabs/SettingsTab";
import { AuthState } from "../authentication/AuthWrapper";
type Props = NativeStackScreenProps<SettingsStackParamList, "Settings">;

const Settings = (props: Props) => {
  const { isAuthenticated } = useContext(AuthState);
  return (
    <PageView>
      <View style={{ gap: 10 }}>
        <CustomButton
          title="Schedule Notifications"
          onPress={scheduleNotifications}
        />

        {isAuthenticated ? (
          <CustomButton title="Sign out" onPress={() => Auth.signOut()} />
        ) : (
          <CustomButton
            title="Sign in as admin"
            onPress={() => props.navigation.navigate("AdminLogin")}
          />
        )}
      </View>
    </PageView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
