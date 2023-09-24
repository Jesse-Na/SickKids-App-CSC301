import { Auth } from "aws-amplify";

export const AmplifyConfig = {
  Auth: {
    region: process.env.REACT_APP_REGION,
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: "AWSBackend",
        endpoint: process.env.REACT_APP_ADMIN_BACKEND,
        custom_header: async () => {
          const token = (await Auth.currentSession())
            .getIdToken()
            .getJwtToken();
          console.log(token, process.env.REACT_APP_ADMIN_BACKEND);
          return { Authorization: `Bearer ${token}` };
        },
      },
      {
        name: "AWSCognitoBackend",
        endpoint: process.env.REACT_APP_ADMIN_COGNITO_BACKEND,
        custom_header: async () => {
          const token = (await Auth.currentSession())
            .getIdToken()
            .getJwtToken();
          console.log(token, process.env.REACT_APP_ADMIN_BACKEND);
          return { Authorization: `Bearer ${token}` };
        },
      },
    ],
  },
};
