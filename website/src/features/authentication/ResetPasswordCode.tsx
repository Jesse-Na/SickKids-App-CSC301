import { Auth } from "aws-amplify";
import React, { useEffect } from "react";
import AuthPage from "./AuthPage";
import { Button, TextField } from "@mui/material";
import { AuthContext } from "./AuthNavigator";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import PasswordInput from "../../components/PasswordInput";

export default function ResetPasswordCode() {

  const navigate = useNavigate();
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const { email } = React.useContext(AuthContext);

  useEffect(() => {
    if (!email) navigate("/reset-password");
  }, [email]);

  const handleSubmit = () => {
    Auth.forgotPasswordSubmit(email, code, newPassword)
      .then(() => {
        navigate("/");
      })
      .catch((e) => {
        console.log(e);
        switch (e.name) {
          case "CodeMismatchException":
            console.log("Invalid code");
            setError("Invalid code");
            break;
          case "AuthError":
            console.log("Invalid code");
            setError(e.log);
            break;
          case "InvalidParameterException":
            setError("Invalid Password");
            break;
          case "InvalidPasswordException":
            setError("Invalid Password");
            break;
          case "LimitExceededException":
            setError("Too many attempts, please try again later");
            break;
          default:
            console.log("Unknown error", JSON.stringify(e));
            break;
        }
      });
  };

  return (
    <AuthPage title="Enter Confirmation Code">

      <div>Enter the confirmation code sent to the email address {email}</div>

      <TextField
        label="Confirmation Code"
        fullWidth
        variant="standard"
        margin="normal"
        value={code}
        onChange={(e) => setCode(e.target.value.substring(0, 6))}
      />
      <PasswordInput
        label="New Password"
        value={newPassword}
        setValue={setNewPassword}
        showRequirements
      />

      <Button
        variant="contained"
        fullWidth
        disabled={code.length != 6}
        onClick={handleSubmit}
      >
        Confirm
      </Button>

      <ErrorMessage message={error} />

      <div style={{ display: "grid", placeItems: "center" }}>
        <Link to="/">Back to Login</Link>
      </div>
      
    </AuthPage>
  );
}
