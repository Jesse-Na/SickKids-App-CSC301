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
import { API_KEY_CHARACTERISTIC, DEFAULT_READ_INTERVAL, DEVICE_UNIQUE_ID_CHARACTERISTIC, SECURITY_SERVICE } from '@BLE/constants'
import { DBService } from './DBService'

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
        this.manager.startDeviceScan(null, null, (error, device) => {
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

    connectToDevice = (deviceId: string) =>
        new Promise<Device>((resolve, reject) => {
            this.stopDeviceScan()
            this.manager
                .connectToDevice(deviceId)
                .then(device => {
                    device.discoverAllServicesAndCharacteristics()
                        .then(() => {
                            this.connectedDevice = device

                            // Read the device's unique ID and save it to the DB cache if needed
                            this.readCharacteristicForDevice(SECURITY_SERVICE, DEVICE_UNIQUE_ID_CHARACTERISTIC)
                                .then(characteristic => {
                                    const uniqueId = characteristic.value
                                    if (uniqueId) {
                                        // Check if the device ID is already cached
                                        DBService.getCloudSyncInfoForDeviceId(uniqueId)
                                            .then(cloudSyncInfo => {
                                                if (!cloudSyncInfo) {
                                                    // Device ID is not cached, so cache it
                                                    cloudSyncInfo = {
                                                        ble_interface_id: device.id,
                                                        device_id: uniqueId,
                                                        last_synced_id: 0,
                                                        api_key: null,
                                                        reading_interval: DEFAULT_READ_INTERVAL
                                                    }

                                                    DBService.insertCloudSyncInfo(cloudSyncInfo)

                                                    // Read the device's API key if there is any
                                                    this.readCharacteristicForDevice(SECURITY_SERVICE, API_KEY_CHARACTERISTIC)
                                                        .then(characteristic => {
                                                            const apiKey = characteristic.value
                                                            if (apiKey) {
                                                                // Update the API Key in cache
                                                                DBService.updateCloudSyncInfoForDeviceId({
                                                                    ...cloudSyncInfo,
                                                                    api_key: apiKey
                                                                })
                                                            }
                                                        }).catch(error => {
                                                            console.error("Failed to read device API key", error)
                                                        });
                                                } else {
                                                    // Update the BLE Interface ID in cache
                                                    DBService.updateCloudSyncInfoForDeviceId({
                                                        ...cloudSyncInfo,
                                                        ble_interface_id: device.id
                                                    })
                                                }
                                            }).catch(error => {
                                                console.error("Failed to get cloud sync info for device", error)
                                            });
                                    } else {
                                        throw new Error("Device unique ID is null")
                                    }
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

    finishMonitor = () => {
        this.isCharacteristicMonitorDisconnectExpected = true
        this.characteristicMonitor?.remove()
    }

    isDeviceConnected = () => {
        return this.connectedDevice?.isConnected() || false
    }

    onDeviceDisconnected = (listener: (error: BleError | null, device: Device | null) => void) => {
        if (!this.connectedDevice) {
            console.error(deviceNotConnectedErrorText)
            throw new Error(deviceNotConnectedErrorText)
        }
        return this.manager.onDeviceDisconnected(this.connectedDevice.id, listener)
    }

    cancelTransaction = (transactionId: string) => this.manager.cancelTransaction(transactionId)

    enable = () =>
        this.manager.enable().catch(error => {
            this.onError(error)
        })

    disable = () =>
        this.manager.disable().catch(error => {
            this.onError(error)
        })

    getState = () =>
        this.manager.state().catch(error => {
            this.onError(error)
        })

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