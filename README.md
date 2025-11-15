
# UnderWraps

In April of 2025, I began to take interest in the concept of Internet of Devices, the ability to create a web or network of devices which collect data and interact with eachother via internet, as I stumbled through a MicroCenter I discovered a device named the ESP32 which is embedded with WiFi connectivity and I also recieved a vibration sensor and created a circuit that looks like this:

<img width="537" height="275" alt="lockmein" src="https://github.com/user-attachments/assets/0634526d-3dc6-46df-9b40-664fcc47b7cc" />

I programmed this circuit to send me a text utilizing IFTT (If this then that) every time a vibration was detected but I realized that the vibration sensor was very limited as it wasn't able to pick up on movement and I also had to shake the breadboard violently to elicit a triggering event. As a result, I made a transition from the vibration sensor to an MPU6050 which enabled me to track percice 3-axis movement resulting in a circuit which looks like this

<img width="315" height="406" alt="circuit" src="https://github.com/user-attachments/assets/2b088dde-9334-4988-89f8-ee768a030933" />

However, utilizing IFTT wasn't sustainable as I couldn't easily access the state the device was in wether if it was moving or not, a history of the times the device was shifted, the time it was shifted, or more importantly do user authentication so I could distribute the device to my friends. As a result, I began searching for Arduino SDK's which enable me to connect to cloud infrastrucute to post data in real time to fuffill my expansive demands. Through plenty of iteration, Firebase was the easiest service to choose from and all of the hardware-based code is detailed in the UnderWrapsOfficialTriggerProtocol.ino program where you can see the ESP and Firebase connect through here:


```cpp
// Register Device MAC in Firebase ---
  String mac = WiFi.macAddress();
  Serial.println("Device MAC: " + mac);
  if (Firebase.ready() && signupOK) {
    String path = "/Devices/" + mac;
    Firebase.RTDB.setString(&fbdo, path, "registered");
  }
  Serial.println("Setup complete.");
```
Here the device anonomoysly signs into firebase and posts it's mac adress onto the database and looks like this 
<img width="456" height="242" alt="then" src="https://github.com/user-attachments/assets/af0513b9-12e7-42d4-a721-c11d6c5207e6" />

Each user's device has a MAC adress which they are responsible for inputting in the app so their device be assigned to them and the device can send messages to them. Texts are sent using gmail STMP protocol which can also be viewed in the UnderWrapsOfficialTriggerProtocol.ino but the user authentication process is showcased in RealUnderWraps/blob/main/app/(tabs)/index.tsx where I put the users phone number through an API which then returns their carrier which is used to send texts.

Futhermore, sending texts normally costs money due to SIM but through STMP, you can email a user with their carrier information and their carrier converts the email to a text messages but you do have to format it, here is the code I used to do it. 

```cpp
// Register Device MAC in Firebase ---
 String userSmsDomain;
  for (JsonPair kv : users) {
    JsonObject profile = kv.value()["profile"];
    if (profile["macAddress"] && profile["macAddress"] == mac) {
      matchedUID = kv.key().c_str();
      userSmsDomain = profile["smsDomain"].as<String>();
      break;
    }
  }
  if (matchedUID.isEmpty()) {
    Serial.println("No user found for MAC");
    return;
  }

  // Get both numbers directly (DB already has no +1)
  String userPhone = users[matchedUID]["profile"]["phoneNumber"].as<String>();
  String contactPhone;
  JsonObject contacts = users[matchedUID]["contacts"];
  for (JsonPair ckv : contacts) {
    contactPhone = ckv.value()["phone"].as<String>();
    break; // Only take first contact
  }
  if (userPhone.isEmpty() || contactPhone.isEmpty()) {
    Serial.println("Missing phone number(s)");
    return;
  }

  // Use the user's SMS domain for both numbers
  String emails[2] = { userPhone + "@" + userSmsDomain, contactPhone + "@" + userSmsDomain };
  for (String addr : emails) {
    EMailSender::EMailMessage msg;
    msg.subject = "Movement Detected!";
    msg.message = "Alert: SOMEBODY IS MESSING WITH UR STUFF BRO";
    EMailSender::Response resp = emailSend.send(addr, msg);
    Serial.println("Sent to " + addr + ": " + resp.status + " " + resp.desc);
  }
}

```

This part of the firmware is responsible for figuring out which user a device belongs to and sending that user (and one other contact) an SMS alert whenever movement is detected. First, the ESP32 loops through every user in the Firebase database and looks for the one whose stored macAddress matches the MAC of the device that just triggered an event. Once it finds the correct user, it pulls that user’s SMS domain (for example, vtext.com or tmomail.net) so it knows how to format email-to-SMS messages. If no matching user is found, the function stops. After identifying the owner, the code grabs two phone numbers from Firebase: the user’s own number and the first emergency contact listed under their account. If either number is missing, the alert can’t be sent and the function exits. Otherwise, the ESP32 converts both phone numbers into SMS email addresses by appending the SMS domain (e.g., 1234567890@vtext.com). It then builds a simple alert message and sends it to both numbers using the onboard email sender. When finished, it prints the result for each message so debugging is easy. This creates a lightweight notification system where each device can instantly alert its owner and their contact whenever the system detects movement.

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
