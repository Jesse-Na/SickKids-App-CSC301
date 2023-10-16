import { Auth, API } from "aws-amplify";
import base64 from "react-native-base64";
import { DeviceId } from "react-native-ble-plx";
import { DBService } from "./DBService";

const adminUrl =
    "https://4aerjx42n3.execute-api.ca-central-1.amazonaws.com/dev/admin";
const userUrl =
    "https://4aerjx42n3.execute-api.ca-central-1.amazonaws.com/dev/users";

// const adminUrl = "http://172.26.204.194:4100/admin";
// const userUrl = "http://172.26.204.194:4000/users";

const AmplifyConfig = {
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


class APIServiceInstance {
    apiKey: string | null = null;

    constructor() {
        this.apiKey = "sdaffasfadsf";
        API.configure(AmplifyConfig);
    }

    getApiKey() {
        return this.apiKey;
    }

    getReadingInterval() {
        // API.get("UserBackend", "/interval", {
        //     queryStringParameters: {
        //       apiKey: this.apiKey,
        //     },
        //   })
        //     .then((interval) => {
        //       console.log("updating interval", interval);
        //       //TODO send to device
        //     })
        //     .catch()
        const interval = fetch('https://localhost:3000/users/interval', {
            method: 'GET',
        })
            .then(response => response.json())
            .then(json => {
                return json.interval;
            })
            .catch(error => {
                console.error(error);
            });

        return interval;
    }

    syncToCloudForDevice = async (deviceId: string) => {
        console.log("syncing to cloud", deviceId);
        const cloudSyncInfo = await DBService.getCloudSyncInfoForDevice(deviceId);
        const readings = await DBService.getReadings(deviceId, cloudSyncInfo.lastSyncedId);
        const messages = readings.map((reading) => reading.message);

        // API.post("UserBackend", "/readings", {
        //     body: readings.map((r) => ({
        //         synced: r.synced,
        //         message: r.message,
        //     })),
        //     queryStringParameters: {
        //         apiKey: this.apiKey,
        //     },
        // })
        //     .then(({ interval }) => {
        //     })
        //     .catch((e) => {
        //         console.log("failed to sync", e);
        //     });
        const response = fetch('https://localhost:3000/users/readings', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': cloudSyncInfo.apiKey,
            },
            body: JSON.stringify({
                deviceId: deviceId,
                messages: messages
            }),
        }).then(response => response.json())
            .then(json => {
                console.log(json);
                DBService.updateCloudSyncInfoForDevice(deviceId, readings[readings.length - 1].id, cloudSyncInfo.apiKey);
                return json;
            })
            .catch(error => {
                console.error(error);
            });
        console.log("synced to cloud", response);
    }

    registerDevice = async (
        deviceId: DeviceId,
    ) => {
        const raw = base64.decode(deviceId);
        let hexId = "";
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16).toUpperCase();
            hexId += hex.length === 2 ? hex : "0" + hex;
        }
        console.log("id", hexId);

        // try {
        //     const response = await API.post("AdminBackend", "/register-device", {
        //         body: { deviceId: hexId },
        //     });
        //     console.log("Response", response);
        //     apiKey = response;
        // } catch (e) {
        //     console.log("sending failed", { deviceId: hexId }, e);
        //     throw new Error("Failed to register with backend");
        // }
        const apiKey = fetch('https://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId: hexId
            }),
        })
            .then(response => response.json())
            .then(json => {
                DBService.insertCloudSyncInfoForDevice(hexId, 0, json.apiKey);
                return json.apiKey;
            })
            .catch(error => {
                console.error(error);
            });

        return apiKey;
    };
}

export const APIService = new APIServiceInstance();