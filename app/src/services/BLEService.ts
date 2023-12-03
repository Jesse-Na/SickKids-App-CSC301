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
import { API_KEY_CHARACTERISTIC_UUID, CONFIGURATION_SERVICE_UUID, CURRENT_TIME_CHARACTERISTIC_UUID, DEFAULT_MTU_SIZE, DEFAULT_READ_INTERVAL, TRANSFER_SERVICE_UUID, UNIQUE_DEVICE_ID_CHARACTERISTIC_UUID } from '../utils/constants'
import { DBService } from './DBService'
import base64 from 'react-native-base64'
import { convertHexToBase64, convertNumberToHex } from '@src/utils/utils'

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
                            const currentTime = new Date().getTime() // UNIX timestamp in milliseconds
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