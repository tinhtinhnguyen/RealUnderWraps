
# UnderWraps

In April of 2025, I began to take interest in the concept of Internet of Devices, the ability to create a web or network of devices which collect data and interact with eachother via internet, as I stumbled through a MicroCenter I discovered a device named the ESP32 which is embedded with WiFi connectivity and I also recieved a vibration sensor and created a circuit that looks like this:

<img width="537" height="275" alt="lockmein" src="https://github.com/user-attachments/assets/0634526d-3dc6-46df-9b40-664fcc47b7cc" />

I programmed this circuit to send me a text utilizing IFTT (If this then that) every time a vibration was detected but I realized that the vibration sensor was very limited as it wasn't able to pick up on movement and I also had to shake the breadboard violently to elicit a triggering event. As a result, I made a transition from the vibration sensor to an MPU6050 which enabled me to track percice 3-axis movement resulting in a circuit which looks like this

<img width="315" height="406" alt="circuit" src="https://github.com/user-attachments/assets/2b088dde-9334-4988-89f8-ee768a030933" />

However, utilizing IFTT wasn't sustainable as I couldn't easily access the state the device was in wether if it was moving or not, a history of the times the device was shifted, the time it was shifted, or more importantly do user authentication so I could distribute the device to my friends. As a result, I began searching for Arduino SDK's which enable me to connect to cloud infrastrucute to post data in real time to fuffill my expansive demands. Through plenty of iteration, Firebase was the easiest service to choose from and all of the hardware-based code is detailed in the UnderWrapsOfficialTriggerProtocol.ino program where you can see the ESP and Firebase connect through here:


```if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase anonymous signup OK");
    signupOK = true;
}
```

=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
