import { Auth } from "aws-amplify";

const adminUrl =
  "https://4aerjx42n3.execute-api.ca-central-1.amazonaws.com/dev/admin";
const userUrl =
  "https://4aerjx42n3.execute-api.ca-central-1.amazonaws.com/dev/users";

// const adminUrl = "http://172.26.204.194:4100/admin";
// const userUrl = "http://172.26.204.194:4000/users";

export const AmplifyConfig = {
  Auth: {
    region: "ca-central-1",
    userPoolId: "ca-central-1_WoRPGIWId",
    userPoolWebClientId: "26jitbu3pli31avgpomggu7gvt",
  },
  API: {
    endpoints: [
      {
        name: "AdminBackend",
        endpoint: adminUrl,
        custom_header: async () => {
          const token = (await Auth.currentSession())
            .getIdToken()
            .getJwtToken();
          return { Authorization: `Bearer ${token}` };
        },
      },
      {
        name: "UserBackend",
        endpoint: userUrl,
      },
    ],
  },
};
