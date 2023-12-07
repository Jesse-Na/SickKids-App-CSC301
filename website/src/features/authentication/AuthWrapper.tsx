import { useEffect, useState } from "react";
import { Auth, Hub } from "aws-amplify";
import AuthNavigator from "./AuthNavigator";

type Props = {
  children: JSX.Element;
};

export default function AuthWrapper(props: Props): JSX.Element {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("AUTH WRAPPER");
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log("AUTHENTICATED USER", user);
        setAuthenticated(true);
        setLoading(false);
      })
      .catch((err) => {
        setAuthenticated(false);
        setLoading(false);
        console.log("NOT AUTHENTICATED", err);
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
          console.log("DEFAULT", data);
          break;
      }
    });
  }, []);

  if (loading) return <div />;
  
  if (!authenticated) return <AuthNavigator />;

  return props.children;
}
