import React, { useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { Auth } from "aws-amplify";
import AuthPage from "./AuthPage";
import { AuthContext } from "./AuthNavigator";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
type Props = {};

const Login = (props: Props) => {
  const navigate = useNavigate();
  const { email, setEmail, setUser } = React.useContext(AuthContext);

  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  const handleLogin = async () => {
    console.log("handleLogin");
    console.log(process.env.REACT_APP_COGNITO_USER_POOL_ID);
    try {
      const resp = await Auth.signIn(email, password);
      if (resp.challengeName === "NEW_PASSWORD_REQUIRED") {
        console.log("NEW_PASSWORD_REQUIRED");
        setUser(resp);
        navigate(`/complete-new-password`);
      }
      console.log("resp", resp);
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
          setError("User is not confirmed");
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
    <AuthPage title="Login">
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="none"
        variant="standard"
        fullWidth
      />
      <PasswordInput value={password} setValue={setPassword} />
      {error && (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      )}
      <Button onClick={handleLogin} fullWidth variant="contained">
        Continue
      </Button>
      <div style={{ display: "grid", placeItems: "center" }}>
        <Link to="/reset-password">Forgot your password?</Link>
      </div>
    </AuthPage>
  );
};

export default Login;
