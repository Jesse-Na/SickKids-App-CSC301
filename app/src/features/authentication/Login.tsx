import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect } from "react";
import CustomTextInput from "../../components/CustomTextInput";
import CustomButton from "../../components/CustomButton";
import { NavigationHelpers } from "@react-navigation/native";
import { Auth } from "aws-amplify";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AuthPageView from "../../components/AuthPageView";
import ErrorMessage from "../../components/ErrorMessage";
import { AuthState } from "../../context/AuthContextProvider";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const { isAuthenticated } = useContext(AuthState);
  useEffect(() => {
    setError(null);
  }, [email, password]);

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleLogout = () => {
    resetFields();
    return Auth.signOut();
  };

  const handleLogin = async () => {
    console.log("handleLogin");

    try {
      await Auth.signIn(email, password);
      resetFields();
    } catch (error: any) {
      console.log(
        "error signing in",
        error,
        Object.keys(error),
        error.name,
        error.code
      );

      switch (error.name) {
        case "UserNotFoundException":
          console.log("User does not exist");
          setEmail("User does not exist");
          break;
        case "NotAuthorizedException":
          setError("Incorrect username or password");
          console.log("Incorrect username or password");
          break;
        case "UserNotConfirmedException":
          setError("Account not confirmed");
          break;
        case "AuthError":
          setError(error.log);
          break;

        default:
          console.log("Unknown error");
      }
    }
  };
  return (
    <AuthPageView title="Admin Sign In">
      {isAuthenticated ? (
        <>
          <Text style={{ textAlign: "center" }}>You are signed in</Text>
          <CustomButton title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <CustomTextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email"
            placeholderTextColor={"#666"}
          />
          <CustomTextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor={"#666"}
          />
          <ErrorMessage error={error} />
          <CustomButton title="Login" onPress={handleLogin} />
        </>
      )}
    </AuthPageView>
  );
};

export default Login;
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    width: "80%",
    backgroundColor: "#fff",
    marginHorizontal: "10%",
    marginTop: "auto",
    marginBottom: "auto",
    borderRadius: 30,
    padding: 20,
  },
});
