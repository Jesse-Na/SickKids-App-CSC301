/*
    * Copyright 2016 Polidea
    * Copyright 2021 intent sp. z o.o.
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    *
    * A Bluetooth Low Energy (BLE) service class that allows React components to communicate with BLE peripherals.
    * Class is adapted from the BLE service class in an example app from the React Native BLE PLX library on 2023-10-09.
    * https://github.com/dotintent/react-native-ble-plx/blob/master/example/src/services/BLEService/BLEService.ts
*/

import {
    BleError,
    BleErrorCode,
    BleManager,
    Device,
    State as BluetoothState,
    LogLevel,
    type TransactionId,
    type UUID,
    type Characteristic,
    type Base64,
    type Subscription
} from 'react-native-ble-plx'
import { PermissionsAndroid, Platform } from 'react-native'
import { API_KEY_CHARACTERISTIC_UUID, CONFIGURATION_SERVICE_UUID, CURRENT_TIME_CHARACTERISTIC_UUID, DATA_COMMUNICATION_CHARACTERISTIC_UUID, DATA_TRANSFER_ACK_INTERVAL, DATA_TRANSFER_FIN_CODE, DATA_TRANSFER_OK_CODE, DATA_TRANSFER_OUT_OF_ORDER_CODE, DATA_TRANSFER_START_CODE, DATA_TRANSFER_TIMEOUT, DEFAULT_MTU_SIZE, DEFAULT_READ_INTERVAL, DEVICE_TO_SERVER_BATCH_SIZE, FRAGMENT_INDEX_SIZE, RAW_DATA_CHARACTERISTIC_UUID, READING_INTERVAL_CHARACTERISTIC_UUID, READING_SAMPLE_LENGTH, TRANSFER_SERVICE_UUID, UNIQUE_DEVICE_ID_CHARACTERISTIC_UUID } from '../utils/constants'
import { DBService } from './DBService'
import base64 from 'react-native-base64'
import { combineBytes, convertHexToBase64, convertNumberToHex } from '@src/utils/utils'
import { APIService } from './APIService'

const deviceNotConnectedErrorText = 'Device is not connected'

class BLEServiceInstance {
    manager: BleManager

    connectedDevice: Device | null = null

    characteristicMonitor: Subscription | null = null

    isCharacteristicMonitorDisconnectExpected = false

    constructor() {
        this.manager = new BleManager()
        this.manager.setLogLevel(LogLevel.Verbose)
        this.initializeBLE()
    }

    getConnectedDevice = () => this.connectedDevice

    // Initialize the BLE manager by enabling BLE and requesting permissions
    initializeBLE = () =>
        new Promise<void>(resolve => {
            const subscription = this.manager.onStateChange(state => {
                switch (state) {
                    case BluetoothState.PoweredOff:
                        console.error('Bluetooth is turned off')
                        this.manager.enable().catch((error: BleError) => {
                            if (error.errorCode === BleErrorCode.BluetoothUnauthorized) {
                                this.requestBluetoothPermission()
                            }
                        })
                        break
                    case BluetoothState.Unauthorized:
                        this.requestBluetoothPermission()
                        break
                    case BluetoothState.PoweredOn:
                        console.log("Bluetooth is on")
                        resolve()
                        subscription.remove()
                        break
                    default:
                        console.error('Unsupported state: ', state)
                }
            }, true)
        })

    disconnectDevice = () => {
        if (!this.connectedDevice) {
            console.error(deviceNotConnectedErrorText)
            throw new Error(deviceNotConnectedErrorText)
        }
        return this.manager.cancelDeviceConnection(this.connectedDevice?.id)
            .then(() => {
                console.log('Device disconnected')
                this.connectedDevice = null
            })
            .catch(error => {
                if (error?.code !== BleErrorCode.DeviceDisconnected) {
                    this.onError(error)
                }
            })
    }

    scanAllDevices = async (onDeviceFound: (device: Device) => void) => {
        console.log("Scan started")
        this.manager.startDeviceScan([TRANSFER_SERVICE_UUID], null, (error, device) => {
            if (error) {
                this.onError(error)
                console.error(error.message)
                this.stopDeviceScan()
                return
            }

            if (device) {
                onDeviceFound(device)
            }
        })
    }

    stopDeviceScan = () => {
        console.log("Scan stopped")
        this.manager.stopDeviceScan()
    }

    // Connect to a device with the given BLE interface ID so that we can read and write to its characteristics
    // Also, cache the cloud sync info for the device if it is not already cached or update it if it is
    connectToDevice = (bleInterfaceId: string) =>
        new Promise<Device>((resolve, reject) => {
            this.manager
                .connectToDevice(bleInterfaceId)
                .then(device => {
                    const bleInterfaceId = device.id
                    device.discoverAllServicesAndCharacteristics()
                        .then(() => {
                            this.connectedDevice = device
                        }).then(async () => {
                            // Negotiate MTU size
                            await this.manager.requestMTUForDevice(bleInterfaceId, DEFAULT_MTU_SIZE)
                                .then(device => {
                                    console.log("MTU negotiated: ", device.mtu)
                                }).catch(error => {
                                    console.error("Failed to negotiate MTU", error)
                                })
                        }).then(async () => {
                            // Write timestamp to device
                            const currentTime = Math.floor(new Date().getTime() / 1000) // UNIX timestamp in seconds
                            console.log("Current time", currentTime)
                            console.log(convertNumberToHex(currentTime, 8))
                            await this.writeCharacteristicWithoutResponseForDevice(CONFIGURATION_SERVICE_UUID, CURRENT_TIME_CHARACTERISTIC_UUID, convertHexToBase64(convertNumberToHex(currentTime, 8)))
                                .then(() => {
                                    console.log("Current time written to device")
                                }).catch(error => {
                                    console.error("Failed to write current time to device", error)
                                })
                        }).then(async () => {
                            // Read the device's unique ID
                            await this.readCharacteristicForDevice(CONFIGURATION_SERVICE_UUID, UNIQUE_DEVICE_ID_CHARACTERISTIC_UUID)
                                .then(characteristic => {
                                    const deviceId = characteristic.value
                                    if (deviceId) {
                                        return deviceId
                                    }

                                    throw new Error("Device unique ID is null")
                                }).then((deviceId) => {
                                    // Check if the information the device needs to sync to the cloud is already cached
                                    DBService.getCloudSyncInfoForDeviceId(deviceId)
                                        .then(cloudSyncInfo => {
                                            const isCached = cloudSyncInfo ? true : false
                                            cloudSyncInfo = cloudSyncInfo ? cloudSyncInfo : {
                                                ble_interface_id: bleInterfaceId,
                                                device_id: deviceId,
                                                last_synced_id: 0,
                                                api_key: null,
                                                reading_interval: DEFAULT_READ_INTERVAL
                                            }

                                            return { cloudSyncInfo, isCached }
                                        }).then(async ({ cloudSyncInfo, isCached }) => {
                                            // Write the device's reading interval to the device
                                            await this.writeCharacteristicWithoutResponseForDevice(CONFIGURATION_SERVICE_UUID, READING_INTERVAL_CHARACTERISTIC_UUID, convertHexToBase64(convertNumberToHex(cloudSyncInfo.reading_interval)))
                                                .then(() => {
                                                    console.log("Reading interval written to device")
                                                }).catch(error => {
                                                    console.error("Failed to write reading interval to device", error)
                                                })

                                            return { cloudSyncInfo, isCached }
                                        }).then(async ({ cloudSyncInfo, isCached }) => {
                                            // Read the device's API key if there is any and update cloudSyncInfo
                                            await this.readCharacteristicForDevice(CONFIGURATION_SERVICE_UUID, API_KEY_CHARACTERISTIC_UUID)
                                                .then(characteristic => {
                                                    const apiKey = characteristic.value
                                                    if (apiKey) {
                                                        cloudSyncInfo.api_key = apiKey
                                                    }
                                                }).catch(error => {
                                                    console.error("Failed to read device API key", error)
                                                });

                                            return { cloudSyncInfo, isCached }
                                        }).then(({ cloudSyncInfo, isCached }) => {
                                            if (!isCached) {
                                                DBService.insertCloudSyncInfo(cloudSyncInfo).catch(error => {
                                                    console.error("Failed to cache cloud sync info for device", error)
                                                });
                                            } else {
                                                DBService.updateCloudSyncInfoForDeviceId(cloudSyncInfo).catch(error => {
                                                    console.error("Failed to update cached cloud sync info for device", error)
                                                });
                                            }
                                        }).catch(error => {
                                            console.error("Failed to get cloud sync info for device", error)
                                        });
                                }).catch(error => {
                                    console.error("Failed to read device unique ID", error)
                                });

                            resolve(device)
                        })
                        .catch(error => {
                            this.onError(error)
                            reject(error)
                        })
                })
                .catch(error => {
                    if (error.errorCode === BleErrorCode.DeviceAlreadyConnected && this.connectedDevice) {
                        resolve(this.connectedDevice)
                    } else {
                        this.onError(error)
                        reject(error)
                    }
                })
        })

    readCharacteristicForDevice = async (serviceUUID: UUID, characteristicUUID: UUID) =>
        new Promise<Characteristic>((resolve, reject) => {
            if (!this.connectedDevice) {
                console.error(deviceNotConnectedErrorText)
                reject(new Error(deviceNotConnectedErrorText))
                return
            }
            this.manager
                .readCharacteristicForDevice(this.connectedDevice.id, serviceUUID, characteristicUUID)
                .then(characteristic => {
                    resolve(characteristic)
                })
                .catch(error => {
                    this.onError(error)
                })
        })

    writeCharacteristicWithResponseForDevice = async (serviceUUID: UUID, characteristicUUID: UUID, value: Base64) => {
        if (!this.connectedDevice) {
            console.error(deviceNotConnectedErrorText)
            throw new Error(deviceNotConnectedErrorText)
        }
        return this.manager
            .writeCharacteristicWithResponseForDevice(this.connectedDevice.id, serviceUUID, characteristicUUID, value)
            .catch(error => {
                this.onError(error)
            })
    }

    writeCharacteristicWithoutResponseForDevice = async (serviceUUID: UUID, characteristicUUID: UUID, value: Base64) => {
        if (!this.connectedDevice) {
            console.error(deviceNotConnectedErrorText)
            throw new Error(deviceNotConnectedErrorText)
        }
        return this.manager
            .writeCharacteristicWithoutResponseForDevice(this.connectedDevice.id, serviceUUID, characteristicUUID, value)
            .catch(error => {
                this.onError(error)
            })
    }

    // Set up a monitor with connectedDevice for a characteristic so that we can receive notifications from the device
    // And call onCharacteristicReceived when we receive a notification
    setupMonitor = (
        serviceUUID: UUID,
        characteristicUUID: UUID,
        onCharacteristicReceived: (characteristic: Characteristic) => void,
        onError: (error: Error) => void,
        transactionId?: TransactionId,
        hideErrorDisplay?: boolean
    ) => {
        if (!this.connectedDevice) {
            console.error(deviceNotConnectedErrorText)
            throw new Error(deviceNotConnectedErrorText)
        }
        this.characteristicMonitor = this.manager.monitorCharacteristicForDevice(
            this.connectedDevice?.id,
            serviceUUID,
            characteristicUUID,
            (error, characteristic) => {
                if (error) {
                    if (error.errorCode === 2 && this.isCharacteristicMonitorDisconnectExpected) {
                        this.isCharacteristicMonitorDisconnectExpected = false
                        return
                    }
                    onError(error)
                    if (!hideErrorDisplay) {
                        this.onError(error)
                        this.characteristicMonitor?.remove()
                    }
                    return
                }
                if (characteristic) {
                    onCharacteristicReceived(characteristic)
                }
            },
            transactionId
        )
    }

    // Stop the current characteristic monitor
    finishMonitor = () => {
        this.isCharacteristicMonitorDisconnectExpected = true
        this.characteristicMonitor?.remove()
    }

    // Start a data transfer with the connected device and return true if there is more data to transfer
    startDataTransfer = (deviceUniqueId: string) => {
        if (!this.connectedDevice) {
            console.error(deviceNotConnectedErrorText)
            throw new Error(deviceNotConnectedErrorText)
        }
        if (!this.connectedDevice.id) {
            console.error("Device ID is null")
            throw new Error("Device ID is null")
        }

        const bleInterfaceId = this.connectedDevice?.id;

        let sendTransferAckInterval: string | number | NodeJS.Timer | undefined;
        let transferTimeoutInterval: string | number | NodeJS.Timer | undefined;
        let rawDataMonitor: Subscription | null = null;
        let isRawDataMonitorDisconnectExpected = false;
        let isMoreDataToTransfer = false;

        // Call to finish the current data transfer
        const finishDataTransfer = () => {
            console.log("finishing data transfer, cleaning up")
            APIService.syncToCloudForDevice(bleInterfaceId)
                .then(() => {
                    console.log("readings synced to cloud");
                }).catch((e) => {
                    console.error(e);
                });
            clearInterval(sendTransferAckInterval);
            clearInterval(transferTimeoutInterval);
            isRawDataMonitorDisconnectExpected = true;
            rawDataMonitor?.remove();
        }

        // Call to finish and start a new data transfer
        const resetDataTransfer = () => {
            finishDataTransfer();
            console.log("note there is more data to transfer");
            isMoreDataToTransfer = true;
        }

        let prevExpectedFragmentIndex = 0;
        let lastReceivedFragmentIndex = DATA_TRANSFER_FIN_CODE;
        let nextExpectedFragmentIndex = 0;
        let totalFragmentsReceived = 0;
        let fragmentArray: string[] = []; // Array of fragments/chunks that will be combined into a sample
        let bytesRemainingToCompleteSample = READING_SAMPLE_LENGTH;

        // Start a timer to check if we have received any fragments in the last DATA_TRANSFER_TIMEOUT seconds
        transferTimeoutInterval = setInterval(() => {
            if (prevExpectedFragmentIndex === lastReceivedFragmentIndex) {
                console.log("no fragments received in the last ", DATA_TRANSFER_TIMEOUT, " seconds, stopping monitor");
                finishDataTransfer();
            } else {
                prevExpectedFragmentIndex = lastReceivedFragmentIndex;
            }
        }, DATA_TRANSFER_TIMEOUT);

        // Handle when we receive a fragment from the device
        const onFragmentReceived = (base64EncodedFragmentString: string) => {
            const bufferForCharacteristic = Buffer.from(base64EncodedFragmentString, "base64");
            console.log("received fragment: ", bufferForCharacteristic);
            const fragmentIndex = combineBytes(bufferForCharacteristic, 0, FRAGMENT_INDEX_SIZE);

            // Check if the fragment is a termination fragment
            if (fragmentIndex === DATA_TRANSFER_FIN_CODE) {
                // Check if we have received all the fragments
                const numFragmentsSentFromDevice = combineBytes(bufferForCharacteristic, FRAGMENT_INDEX_SIZE, FRAGMENT_INDEX_SIZE + 2);
                if (totalFragmentsReceived === numFragmentsSentFromDevice) {
                    // Acknowledge the termination fragment
                    this.writeCharacteristicWithoutResponseForDevice(
                        TRANSFER_SERVICE_UUID,
                        DATA_COMMUNICATION_CHARACTERISTIC_UUID,
                        convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OK_CODE) + convertNumberToHex(DATA_TRANSFER_FIN_CODE, 4))
                    ).then(() => {
                        console.log("acknowledged termination fragment");
                    })

                    if (totalFragmentsReceived === 0) {
                        finishDataTransfer();
                    } else {
                        resetDataTransfer();
                    }

                    return;
                }
            }

            // Drop out of order fragments
            if (fragmentIndex !== nextExpectedFragmentIndex) {
                // Only send out of order error if the fragment we received is larger than the last one we received
                if (fragmentIndex > nextExpectedFragmentIndex) {
                    this.writeCharacteristicWithoutResponseForDevice(
                        TRANSFER_SERVICE_UUID,
                        DATA_COMMUNICATION_CHARACTERISTIC_UUID,
                        convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OUT_OF_ORDER_CODE) + convertNumberToHex(lastReceivedFragmentIndex, 4))
                    ).then(() => {
                        console.log("chunk out of sequence error thrown");
                    });
                }

                return;
            }

            if (sendTransferAckInterval === undefined) {
                // Periodically send an acknowledgement to the device that we successfully received the message
                sendTransferAckInterval = setInterval(() => {
                    this.writeCharacteristicWithoutResponseForDevice(
                        TRANSFER_SERVICE_UUID,
                        DATA_COMMUNICATION_CHARACTERISTIC_UUID,
                        convertHexToBase64(convertNumberToHex(DATA_TRANSFER_OK_CODE) + convertNumberToHex(lastReceivedFragmentIndex, 4))
                    ).then(() => {
                        console.log("acknowledged fragments up to and including: ", lastReceivedFragmentIndex);
                    }).catch((e) => {
                        console.error(e);
                        finishDataTransfer();
                    });
                }, DATA_TRANSFER_ACK_INTERVAL);
            }

            const fragmentData = bufferForCharacteristic.subarray(FRAGMENT_INDEX_SIZE, FRAGMENT_INDEX_SIZE + READING_SAMPLE_LENGTH);
            fragmentArray.push(fragmentData.join(""));
            bytesRemainingToCompleteSample -= fragmentData.length;
            totalFragmentsReceived++;
            nextExpectedFragmentIndex++;
            lastReceivedFragmentIndex = fragmentIndex;

            if (nextExpectedFragmentIndex >= DATA_TRANSFER_FIN_CODE) {
                nextExpectedFragmentIndex = 0;
            }

            if (bytesRemainingToCompleteSample <= 0) {
                // Compile fragments into sample and save to DB
                const sample = fragmentArray.join("").substring(0, READING_SAMPLE_LENGTH);
                DBService.saveReading(sample, deviceUniqueId);

                // Sync readings to cloud every DEVICE_TO_SERVER_BATCH_SIZE readings
                if (totalFragmentsReceived % DEVICE_TO_SERVER_BATCH_SIZE === 0) {
                    // APIService.syncToCloudForDevice(device.id);
                }

                // Reset state
                fragmentArray = [];
                bytesRemainingToCompleteSample = READING_SAMPLE_LENGTH;
            }
        }

        const setupRawDataMonitor = () => {
            rawDataMonitor = this.manager.monitorCharacteristicForDevice(
                bleInterfaceId,
                TRANSFER_SERVICE_UUID,
                RAW_DATA_CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (error) {
                        if (error.errorCode === 2 && isRawDataMonitorDisconnectExpected) {
                            isRawDataMonitorDisconnectExpected = false
                            return
                        }
                        this.onError(error)
                        rawDataMonitor?.remove()
                        return
                    }

                    if (characteristic && characteristic.value) {
                        onFragmentReceived(characteristic.value)
                    }
                }
            );
        }

        // Start the data transfer by writing to the Data Communication characteristic
        this.writeCharacteristicWithoutResponseForDevice(
            TRANSFER_SERVICE_UUID,
            DATA_COMMUNICATION_CHARACTERISTIC_UUID,
            convertHexToBase64(convertNumberToHex(DATA_TRANSFER_START_CODE))
        ).then(() => {
            console.log("making reservation with peripheral, wrote to data communication characteristic");
            setupRawDataMonitor();
        }).catch((e) => {
            console.error(e);
            finishDataTransfer();
        });

        return isMoreDataToTransfer;
    }

    onError = (error: BleError) => {
        switch (error.errorCode) {
            case BleErrorCode.BluetoothUnauthorized:
                this.requestBluetoothPermission()
                break
            case BleErrorCode.LocationServicesDisabled:
                console.error('Location services are disabled')
                break
            default:
                console.error(JSON.stringify(error, null, 4))
        }
    }

    requestBluetoothPermission = async () => {
        if (Platform.OS === 'ios') {
            return true
        }
        if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
            const apiLevel = parseInt(Platform.Version.toString(), 10)

            if (apiLevel < 31) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                return granted === PermissionsAndroid.RESULTS.GRANTED
            }
            if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                ])

                return (
                    result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                )
            }
        }

        console.error('Permission have not been granted')

        return false
    }
}

export const BLEService = new BLEServiceInstance()