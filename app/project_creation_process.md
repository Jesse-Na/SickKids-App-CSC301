1. Create the project `npx expo init -t expo-template-blank-typescript app`
   1. Alternatively use `npx create-expo-app -t expo-template-blank-typescript app`
3. Add react-native-ble-plx with `yarn add react-native-ble-plx`
   1. I had to go in the node_modules/react-native-ble-plx/android/build.gradle and change the minSdkVersion to 23 to prevent build issues but there's probably a better way (NOT NEEDED)
4. Edit app.json to add permissions `BLUETOOTH_ADMIN, BLUETOOTH_SCAN, BLUETOOTH_CONNECT` (NOT NEEDED)
5. This is where I also then added most of the code all in src
6. Make sure all packages are installed with npm or yarn
7. Create android project `npx expo prebuild --platform android`. This will create the android folder

   1. Go to android/build.gradle and change the minSdkVersion to 23 like so: ```minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '23')```
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