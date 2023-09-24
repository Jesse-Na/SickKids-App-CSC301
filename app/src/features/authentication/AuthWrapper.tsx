import { View, Text } from "react-native";
import { Hub, Auth } from "aws-amplify";
import React, { createContext, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type AuthContext = {
  isAuthenticated: boolean;
};

const defualtContext: AuthContext = {
  isAuthenticated: false,
};

export const AuthState = createContext<AuthContext>(defualtContext);

const AuthWrapper = (props: Props) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    console.log("AUTH WRAPPER");
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log("AUTHENTICATED USER", user);
        setAuthenticated(true);
      })
      .catch((err) => {
        setAuthenticated(false);
      });
    Hub.listen("auth", (data) => {
      console.log("AUTH HUB", data);
      switch (data.payload.event) {
        case "signIn":
          setAuthenticated(true);
          break;
        case "signOut":
          setAuthenticated(false);
          break;
        default:
          break;
      }
    });
  }, []);

  return (
    <AuthState.Provider value={{ isAuthenticated: authenticated }}>
      {props.children}
    </AuthState.Provider>
  );
};

export default AuthWrapper;
