## Versions

- Gradle: 7.0.2
- Java: 11.0.18

## Requirements

- [Node.js](https://nodejs.org)

## Steps to create app

- If you are just running this, skip to step 8

1. Create the project `expo init -t expo-template-blank-typescript app`
2. Add react-native-ble-plx with `yarn add react-native-ble-plx`
   1. I had to go in the node_modules/react-native-ble-plx/android/build.gradle and change the minSdkVersion to 21 from 18 to prevent build issues but there's probably a better way
3. Edit app.json to add permissions `BLUETOOTH_ADMIN, BLUETOOTH_SCAN, BLUETOOTH_CONNECT`
4. This is where I also then added most of the code all in src
5. Make sure all packages are installed with npm or yarn
6. Create android project `npx expo prebuild --platform android`. This will create the android folder
7. Go to `android/app/src/main/AndroidManifest.xml`and add the lines under the `<manifest>` tag. The bluetooth scan should already exist but you need to add the permission flag

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