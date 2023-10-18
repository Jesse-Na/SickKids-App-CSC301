import React, { FC, createContext, useEffect, useState, useContext } from 'react'
import { BLEService } from '@src/services/BLEService'
import { Device } from 'react-native-ble-plx';


type BLEContextType = {
    device: Device | null;
    setDevice: React.Dispatch<React.SetStateAction<Device | null>>,
    deviceProperties: DevicePropertiesProps | null;
    setDeviceProperties: <K extends keyof DevicePropertiesProps>(property: K, newValue: DevicePropertiesProps[K]) => void; // Updated type
}

type BLEContextProviderProps = {
    children: React.ReactNode | React.ReactNode[];
}

type DevicePropertiesProps = {
    batteryLevel: number;
    isCharging: boolean;
    heartRate: number;
    timeStamp: number,
    touchSensor1: number,
    touchSensor2: number
}

const defaultContext: BLEContextType = {
    device: null,
    setDevice: () => { },
    deviceProperties: null,
    setDeviceProperties: () => { }, // corrected here
}

export const defaultDeviceProperties: DevicePropertiesProps = {
    batteryLevel: 0,
    isCharging: false,
    heartRate: 0,
    timeStamp: (new Date()).getTime(),
    touchSensor1: 0,
    touchSensor2: 0
}


const BLEContext = createContext<BLEContextType>(defaultContext);

export const useBLEContext = () => useContext(BLEContext);

// context for grabbing BLE service related data
const BLEContextProvider: FC<BLEContextProviderProps> = ({ children }) => {
    const bleService = BLEService;
    const [device, setDevice] = useState<Device | null>(bleService.getConnectedDevice());
    const [deviceProperties, setDeviceProperties] = useState<DevicePropertiesProps>(defaultDeviceProperties);

    const handleDevicePropertiesChange = <K extends keyof DevicePropertiesProps>(property: K, newValue: DevicePropertiesProps[K]) => {
        setDeviceProperties(prevState => ({
            ...prevState,
            [property]: newValue, // dynamically set the property name
        }));
    };
    
    return (
        <BLEContext.Provider value={{
            device,
            setDevice,
            deviceProperties,
            setDeviceProperties: handleDevicePropertiesChange
        }}>
            {children}
        </BLEContext.Provider>
    )
}

export default BLEContextProvider
