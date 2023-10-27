import { API, Amplify, Auth } from 'aws-amplify';
import base64 from "react-native-base64";
import { DeviceId } from "react-native-ble-plx";
import { DBService } from "./DBService";

const localhost = "192.168.88.156"
const adminUrl = "https://plypo4itv8.execute-api.ca-central-1.amazonaws.com/dev/admin";
const userUrl = "https://plypo4itv8.execute-api.ca-central-1.amazonaws.com/dev/users";

export const AmplifyConfig = {
    Auth: {
        region: "ca-central-1",
        userPoolId: "ca-central-1_NZlWWBBKg",
        userPoolWebClientId: "27acm70ngeh0p5kkf5qruvbtbo",
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
        Amplify.configure(AmplifyConfig)
    }

    getApiKey() {
        return this.apiKey;
    }

    getReadingInterval() {
        const interval = API.get("UserBackend", "/interval", {
            queryStringParameters: {
                apiKey: this.apiKey,
            },
        })
            .then((interval) => {
                return interval;
            })
            .catch((e) => console.log("failed to get interval", e))

        return interval;
    }

    syncToCloudForDevice = async (deviceId: string) => {
        console.log("syncing to cloud", deviceId);
        try {
            const cloudSyncInfo = await DBService.getCloudSyncInfoForDevice(deviceId);
            const readings = await DBService.getReadings(deviceId, cloudSyncInfo.last_synced_id);

            const readingInterval = API.post("UserBackend", "/readings", {
                body: readings.map((r) => ({
                    synced: r.synced,
                    message: r.message,
                })),
                queryStringParameters: {
                    apiKey: this.apiKey,
                },
            })
                .then(async ({ interval }) => {
                    await DBService.updateCloudSyncInfoForDevice(deviceId, readings[readings.length - 1].id, cloudSyncInfo.api_key);
                    return interval;
                })
                .catch((e) => {
                    console.error("failed to sync", e);
                });

        } catch (e) {
            console.log("failed to sync", e);
            return;
        }
    }

    registerDevice = async (
        deviceId: DeviceId | null,
    ) => {
        if (!deviceId) {
            throw new Error("Device ID is null");
        }

        const raw = base64.decode(deviceId);
        let hexId = "";
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16).toUpperCase();
            hexId += hex.length === 2 ? hex : "0" + hex;
        }
        console.log("id", hexId);

        // const response = await API.post("AdminBackend", "/register-device", {
        //         body: { deviceId: hexId },
        //     }).then(async (response) => {
        //         console.log("Response", response);
        //         await DBService.insertCloudSyncInfoForDevice(hexId, 0, response)
        //         return response;
        //     }).catch((e) => {
        //         console.error("device registration failed", { deviceId: hexId }, e);
        //     });

        const apiKey = fetch('http://' + localhost + ':3000/users/register', {
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
                this.apiKey = json.apiKey;
                return json.apiKey;
            })
            .catch(error => {
                console.error(error);
            });
        return apiKey;
    };
}

export const APIService = new APIServiceInstance();