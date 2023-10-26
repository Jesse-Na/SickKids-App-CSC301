import { API, Amplify } from 'aws-amplify';
import base64 from "react-native-base64";
import { DeviceId } from "react-native-ble-plx";
import { DBService } from "./DBService";

const adminUrl = process.env.REACT_APP_ADMIN_BACKEND;
const userUrl = process.env.REACT_APP_USER_BACKEND;

export const AmplifyConfig = {
    Auth: {
        region: process.env.REACT_APP_REGION,
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID,
    },
    API: {
        endpoints: [
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
        deviceId: DeviceId,
    ) => {
        const raw = base64.decode(deviceId);
        let hexId = "";
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16).toUpperCase();
            hexId += hex.length === 2 ? hex : "0" + hex;
        }
        console.log("id", hexId);

        const response = await API.post("UserBackend", "/register-device", {
                body: { deviceId: hexId },
            }).then(async (response) => {
                console.log("Response", response);
                await DBService.insertCloudSyncInfoForDevice(hexId, 0, response)
                return response;
            }).catch((e) => {
                console.error("device registration failed", { deviceId: hexId }, e);
            });
    };
}

export const APIService = new APIServiceInstance();