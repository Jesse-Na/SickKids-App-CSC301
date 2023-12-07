import React, { useEffect } from "react";
import AuthPage from "./AuthPage";
import { TextField, Button } from "@mui/material";
import { Auth } from "aws-amplify";
import { AuthContext } from "./AuthNavigator";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";

type Props = {};

export default function CompleteNewPassword({}: Props) {
  const navigate = useNavigate();
  const { user, email } = React.useContext(AuthContext);
  const [newPassword, setNewPassword] = React.useState("");
  const handleSubmit = async () => {
    Auth.completeNewPassword(user, newPassword, {})
      .then((user) => {
        console.log(user);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    if (!email) navigate("/");
  }, [email]);
  return (
    <AuthPage title="Set New Password">
      <div>{email}</div>
      <PasswordInput
        label="New Password"
        value={newPassword}
        setValue={setNewPassword}
        showRequirements
      />
      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Set New Password
      </Button>
      <div style={{ display: "grid", placeItems: "center" }}>
        <Link to="/">Back to Login</Link>
      </div>
    </AuthPage>
  );
}
