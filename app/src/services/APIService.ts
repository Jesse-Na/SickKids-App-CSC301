import { Auth, API } from "aws-amplify";
import base64 from "react-native-base64";
import { DeviceId } from "react-native-ble-plx";
import { DBService } from "./DBService";

const localhost = "192.168.88.156"

class APIServiceInstance {
    apiKey: string | null = null;

    constructor() {
    }

    getApiKey() {
        return this.apiKey;
    }

    getReadingInterval() {
        const interval = fetch('http://' + localhost + ':3000/users/interval', {
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
        try {
            const cloudSyncInfo = await DBService.getCloudSyncInfoForDevice(deviceId);
            const readings = await DBService.getReadings(deviceId, cloudSyncInfo.last_synced_id);

            const response = fetch('http://' + localhost + ':3000/users/readings', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': cloudSyncInfo.api_key,
                },
                body: JSON.stringify({
                    deviceId: deviceId,
                    messages: readings
                }),
            }).then(response => {
                    return response;
                })
                .catch(error => {
                    console.error(error);
                });

            await DBService.updateCloudSyncInfoForDevice(deviceId, readings[readings.length - 1].id, cloudSyncInfo.api_key);
            console.log("synced to cloud", response);
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