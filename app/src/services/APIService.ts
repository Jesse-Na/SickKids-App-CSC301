import { API, Amplify, Auth } from 'aws-amplify';
import { DeviceId } from "react-native-ble-plx";
import { DBService } from "./DBService";
import { DEFAULT_READ_INTERVAL } from '../utils/constants';
import { convertBase64ToHex } from '@src/utils/utils';

const adminUrl = "https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/admin";
const userUrl = "https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/users";

export const AmplifyConfig = {
    Auth: {
        region: "ca-central-1",
        userPoolId: "ca-central-1_heZehJBfQ",
        userPoolWebClientId: "37ok0fbe88evr31re50r6m0rpg",
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
    constructor() {
        Amplify.configure(AmplifyConfig)
    }

    // Get reading interval from backend and update cloudSyncInfo table with new interval
    getReadingInterval = async (bleInterfaceId: string) => {
        const cloudSyncInfo = await DBService.getCloudSyncInfoForBleInterfaceId(bleInterfaceId);
        const hexId = convertBase64ToHex(cloudSyncInfo.device_id);

        const interval = API.get("UserBackend", "/interval", {
            queryStringParameters: {
                apiKey: cloudSyncInfo.api_key,
            },
            body: {
                deviceId: hexId
            },
        })
            .then((interval) => {
                // Update reading interval in cloudSyncInfo table
                DBService.updateCloudSyncInfoForDeviceId({
                    ...cloudSyncInfo,
                    reading_interval: parseInt(interval)
                }).then(() => console.log("updated reading interval in cloudSyncInfo table"))
                    .catch((e) => console.log("failed to update reading interval in cloudSyncInfo table", e))

                return interval;
            })
            .catch((e) => console.log("failed to get interval", e))

        return interval;
    }

    // Upload readings to backend and update cloudSyncInfo table with last synced id
    syncToCloudForDevice = async (bleInterfaceId: string) => {
        const cloudSyncInfo = await DBService.getCloudSyncInfoForBleInterfaceId(bleInterfaceId);
        const readings = await DBService.getReadings(cloudSyncInfo.device_id, cloudSyncInfo.last_synced_id);
        const hexId = convertBase64ToHex(cloudSyncInfo.device_id);

        API.post("UserBackend", "/readings", {
            body: {
                readings: readings.map((r) => ({
                    synced: r.synced,
                    message: r.message,
                })),
                deviceId: hexId,
            },
            queryStringParameters: {
                apiKey: cloudSyncInfo.api_key,
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

    // Register device with backend and update cloudSyncInfo table with api key
    // NOTE: The api key should be written to the device using BLEService after this function is called
    registerDevice = async (
        bleInterfaceId: DeviceId | null,
        userId: string
    ) => {
        if (!bleInterfaceId) {
            throw new Error("Device ID is null");
        }

        const cloudSyncInfo = await DBService.getCloudSyncInfoForBleInterfaceId(bleInterfaceId);
        const hexId = convertBase64ToHex(cloudSyncInfo.device_id);
        console.log("id", hexId);

        const apiKey = await API.post("AdminBackend", "/register-device", {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: {
                deviceId: hexId,
                interval: DEFAULT_READ_INTERVAL,
                userId: userId
            },
        })
            .then(response => {
                console.log("Device registration response: ", response)

                DBService.updateCloudSyncInfoForDeviceId({
                    ...cloudSyncInfo,
                    api_key: response
                });
                return response;
            })
            .catch((error) => {
                console.error("device registration failed", hexId, error);
            });
        return apiKey;
    };

}

export const APIService = new APIServiceInstance();