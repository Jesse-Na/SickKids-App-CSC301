import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import CompleteNewPassword from "./CompleteNewPassword";
import ResetPasswordCode from "./ResetPasswordCode";
//create a context

export const AuthContext = React.createContext({
  user: null,
  setUser: (user: any) => {},
  email: "",
  setEmail: (email: any) => {},
});

export default function AuthNavigator() {
  const [user, setUser] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const value = { user, setUser, email, setEmail };

  return (
    <AuthContext.Provider value={value}>
      <Routes>
        <Route path="/" Component={Login} />
        <Route path="/reset-password" Component={ResetPassword} />
        <Route path="/complete-new-password" Component={CompleteNewPassword} />
        <Route path="/new-password" Component={ResetPasswordCode} />
        <Route path="*" Component={Login} />
      </Routes>
    </AuthContext.Provider>
  );
}
