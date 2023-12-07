import React, { useEffect } from "react";
import AuthPage from "./AuthPage";
import { Button, TextField } from "@mui/material";
import { AuthContext } from "./AuthNavigator";
import { Auth } from "aws-amplify";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";

type Props = {};

export default function ResetPassword({}: Props) {

  const navigate = useNavigate();
  const { email, setEmail } = React.useContext(AuthContext);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    setEmail("");
  }, []);

  const handleSubmit = async () => {
    Auth.forgotPassword(email)
      .then(() => {
        navigate("/new-password");
      })
      .catch((e) => {
        switch (e.code) {
          case "UserNotFoundException":
            setError("User does not exist");
            break;
          default:
            console.log("Unknown error", e.code);
        }
      });
  };

  return (
    <AuthPage title="Reset Password">

      <TextField
        label="Email"
        fullWidth
        variant="standard"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={email.length == 0}
      >
        Reset Password
      </Button>

      <ErrorMessage message={error} />

      <div style={{ display: "grid", placeItems: "center" }}>
        <Link to="/">Back to Login</Link>
      </div>
      
    </AuthPage>
  );
}
