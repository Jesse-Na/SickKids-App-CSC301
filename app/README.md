## Versions

- Gradle: 7.0.2
- Java: 11.0.18

## Requirements

- [Node.js](https://nodejs.org)

## Steps to create app

- If you are just running this, skip to step 8

0. Install dependencies with npm or yarn
1. Create the project `npx expo init -t expo-template-blank-typescript app`
   2. Alternatively use `npx create-expo-app -t expo-template-blank-typescript app`
3. Add react-native-ble-plx with `yarn add react-native-ble-plx`
   1. I had to go in the node_modules/react-native-ble-plx/android/build.gradle and change the minSdkVersion to 23 to prevent build issues but there's probably a better way (NOT NEEDED)
4. Edit app.json to add permissions `BLUETOOTH_ADMIN, BLUETOOTH_SCAN, BLUETOOTH_CONNECT` (NOT NEEDED)
5. This is where I also then added most of the code all in src
6. Make sure all packages are installed with npm or yarn
7. Create android project `npx expo prebuild --platform android`. This will create the android folder
   
   7. Go to android/build.gradle and change the minSdkVersion to 23 like so: ```minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '23')```
8. Go to `android/app/src/main/AndroidManifest.xml`and add the lines under the `<manifest>` tag. The bluetooth scan should already exist but you need to add the permission flag

```
   <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation"/>
   <uses-feature android:name="android.hardware.bluetooth_le" android:required="true"/>
```

6. Create ios project `npx expo prebuild --platform ios`. This will create the ios folder
7. Open the project in XCode and go to `Signing and Capabilities > Signing > Team` and select an apple account (I'm currently using my personal one)
8. Select your device and press play on XCode to install it onto your phone, then start the server

1. Go to android studio and open the android folder. Build and run the project on the selected device
1. Run the dev server `npm run start`
1. After any changes you can run `npm run android` to rebuild if needed


## Notifications - to be implemented
* Background ios or foreground android: if disconnected once every 2 hours to get in range, cancelled on connect or if app is terminated
* Terminated: background task --> if device hasn't connected in over 3 hours, remind every 30 min to reopen app
* User gets logged out and there's data to sync
* Low battery

## Steps to get started

1. Install all modules listed as dependencies in `package.json` to local `node_modules` directory by running `npm install`
1. Run local development client by running ~~`npm run start`~~ `npx expo run:android`

## Additional steps to create a preview build (installing apps without submitting to the app stores)

1. Create and login into an Expo account (see: https://docs.expo.dev/build/setup/)
1. For Android, run `eas build --profile preview --platform android`
1. For iOS, run
    1. `npx expo install yarn --npm`
    1. `eas device:create` to add a device for ad hoc provisioning
    1. `eas build --profile preview --platform ios`

# Bluetooth Low Energy (BLE)
This section details the BLE configuration of the STM32 (microcontroller) within the STM32CubeIDE IOC file.
Open the IOC file
Go to Middleware and Software Packs -> STM32_WPAN

Under the BLE GATT tab:
Services (4):

Long Name: USAGE_DATA_SERVICE
Short Name: UDS

Long Name: DEVICE_CONFIGURATION_SERVICE
Short Name: DCS

Long Name: CURRENT_TIME_SERVICE
Short Name: CTS

Long Name: SECURITY_SERVICE
Short Name: SS

New tabs will then appear, configure them as follows:
USAGE_DATA_SERVICE:

UUID type: 16 bits
UUID: EF41

Characteristic Long Name: DATA_CHARACTERISTIC
Characteristic Short Name: DC
Value Length: 247
CHAR_PROP_NOTIFY: Yes

DEVICE_CONFIGURATION_SERVICE:

UUID type: 128 bits
UUID 128 input type: full
UUID: DA 34 00 00 00 00 00 00 00 00 00 00 00 00 00 00

Characteristic Long Name: READING_INTERVAL_CHARACTERISTIC
Characteristic Short Name: RIC
UUID type: 16 bits
UUID: C071
Value Length: 10
CHAR_PROP_READ: Yes
CHAR_PROP_WRITE_WITHOUT_RESP: Yes
GATT_NOTIFY_WRITE_REQ_AND_WAIT_FOR_APPL_RESP: No
GATT_NOTIFY_READ_REQ_AND_WAIT_FOR_APPL_RESP: No

CURRENT_TIME_SERVICE:

UUID type: 128 bits
UUID 128 input type: full
UUID: 18 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00

Characteristic Long Name: CURRENT_TIME_CHARACTERISTIC
Characteristic Short Name: CTC
UUID type: 16 bits
UUID: 2A2B
Value Length: 10
CHAR_PROP_READ: Yes
CHAR_PROP_WRITE_WITHOUT_RESP: Yes
GATT_NOTIFY_WRITE_REQ_AND_WAIT_FOR_APPL_RESP: No
GATT_NOTIFY_READ_REQ_AND_WAIT_FOR_APPL_RESP: No

SECURITY_SERVICE:

Number of Characteristics: 2
UUID type: 128 bits
UUID 128 input type: full
UUID: EF 34 00 00 00 00 00 00 00 00 00 00 00 00 00 00

Characteristic Long Name: DEVICE_ID
Characteristic Short Name: DEV_ID
UUID type: 128 bits
UUID 128 input type: reduced
UUID: 5BDF
Value Length: 4
CHAR_PROP_READ: Yes
CHAR_PROP_WRITE_WITHOUT_RESP: Yes
GATT_NOTIFY_WRITE_REQ_AND_WAIT_FOR_APPL_RESP: No
GATT_NOTIFY_READ_REQ_AND_WAIT_FOR_APPL_RESP: No

Characteristic Long Name: API_KEY
Characteristic Short Name: API_KEY
UUID type: 128 bits
UUID 128 input type: reduced
UUID: CCAD
Value Length: 44
CHAR_PROP_READ: Yes
CHAR_PROP_WRITE_WITHOUT_RESP: Yes
GATT_NOTIFY_WRITE_REQ_AND_WAIT_FOR_APPL_RESP: No
GATT_NOTIFY_READ_REQ_AND_WAIT_FOR_APPL_RESP: No
