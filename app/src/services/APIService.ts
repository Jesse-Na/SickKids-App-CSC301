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

    getReadingInterval = async (bleInterfaceId: string) => {
        const cloudSyncInfo = await DBService.getCloudSyncInfoForBleInterfaceId(bleInterfaceId);

        const raw = base64.decode(cloudSyncInfo.device_id);
        let hexId = "";
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16).toUpperCase();
            hexId += hex.length === 2 ? hex : "0" + hex;
        }
        console.log("id", hexId);

        const interval = API.get("UserBackend", "/interval", {
            queryStringParameters: {
                apiKey: this.apiKey,
            },
            body: JSON.stringify({
                deviceId: hexId
            }),
        })
            .then((interval) => {
                return interval;
            })
            .catch((e) => console.log("failed to get interval", e))

        return interval;
    }

    syncToCloudForDevice = async (bleInterfaceId: string) => {
        console.log("syncing to cloud", bleInterfaceId);

        const cloudSyncInfo = await DBService.getCloudSyncInfoForBleInterfaceId(bleInterfaceId);
        const readings = await DBService.getReadings(cloudSyncInfo.device_id, cloudSyncInfo.last_synced_id);

        const raw = base64.decode(cloudSyncInfo.device_id);
        let hexId = "";
        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16).toUpperCase();
            hexId += hex.length === 2 ? hex : "0" + hex;
        }
        console.log("id", hexId);

        API.post("UserBackend", "/readings", {
            body: readings.map((r) => ({
                synced: r.synced,
                message: r.message,
            }), JSON.stringify({
                deviceId: hexId
            })),
            queryStringParameters: {
                apiKey: this.apiKey,
            },
        })
            .then(async ({ interval }) => {
                await DBService.updateCloudSyncInfoForDeviceId({
                    ...cloudSyncInfo,
                    last_synced_id: readings[readings.length - 1].id,
                    reading_interval: interval
                });
                return interval;
            })
            .catch((e) => {
                console.error("failed to sync", e);
            });
    }

    registerDevice = async (
        bleInterfaceId: DeviceId | null,
    ) => {
        if (!bleInterfaceId) {
            throw new Error("Device ID is null");
        }

        const cloudSyncInfo = await DBService.getCloudSyncInfoForBleInterfaceId(bleInterfaceId);

        const raw = base64.decode(cloudSyncInfo.device_id);
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
                DBService.updateCloudSyncInfoForDeviceId({
                    ...cloudSyncInfo,
                    api_key: json.apiKey
                });
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