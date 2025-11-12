 HEAD
# UnderWrapsMasterFolder
Underwraps

Introduction:
Centuries ago, human civilization hunted to forage and store food, through a sequence of technological revolutions food is no longer what we fight to protect. Today, we guard our possessions with passwords, safe’s, and fancy doorbells. Ironically, 50% of university students report stolen food, 1 in 4 American employees do the same from shared fridges. UnderWraps is a product, you can attach onto any belonging and tupperware and the moment it moves an ear-piercing sound will deter your suspected thief and you will be notified via text.  We transform food protection, a necessity, and give students peace of mind while saving them money. 
While tinkering with an ESP8266 and IFTTT (A triggering application that listens to when an event occurs) alerts, I discovered this simple vibration sensor could solve a big problem. I realized that this rudimentary circuit, with a little bit of editing could be scaled to fulfill a need thousands of people now have. This need? It's a betrayal we've all faced, which is when your roommate, sibling, partner, or coworker sneaks into the fridge and eats the food you were salivating to eat the next day whether it was your apple pie, slice of pizza, chicken, or seventeen dollar subway sandwich (inflation is getting freaky!), it’s gone before you get the chance to step into your house. Underwraps was born to put an end to such a heinous and criminal act. Moreover, this ESP32 (an internet powered microcontroller) coupled with a mpu6050, a cheap 3-axis gyroscope that can track position shifts, a buzzer,, and a 3D printed enclosure can all be used to serve justice and create a system where the victim would be notified of the theft occurring in their fridge and the potential thief and the thief would be scolded by the use using the speaker. 

How it would work
This device which is battery powered and protected by a 3D printed enclosure would be attached onto the users tupperware or cardboard box or whatever the users food is protected by and the user would turn the device on. While the device is on the gyroscope would detect shifts in its own position, once a major shift takes place which indicates that somebody is stealing the food the ESP immediately sends a message to the cloud while alsl using STMP to send a text message to your phone .Underwraps leverages Firebase its backend to store device data and trigger real-time alerts across all connected user devices. The device listens for a change in the database and pushes a text message to the user’s device and who they think is stealing their device. While also asking the user if they would like to contact their potential suspects via call. Simultaneously, a speaker would start blasting a 2040 hz piezo buzzer to disrupt the victim

Target market/ Audience
The primary target demographic Underwraps aims to serve are individuals who reside in shared homes and employees who store food in office kitchens. Further, current technology available on the market which are similar to our technology consist of Air Tags and Tile trackers which help locate lost items but are unable to recognize subtle or precise movements and notify the user accordingly. In addition, they come with high cost and charging requirements. Underwraps opens an entirely new market for tamper-detection devices for personal items. Which can also serve individuals with Obsessive Compulsive Disorder who experience immense stress when the 
Current developments and iterations



Recently, I migrated from an ESP8266 to an ESP32 because it is able to interact with the cloud far easier due to its easy ability to upload code and interact with external libraries and this figure above is a gyroscope attached to the ESP32 and an LED. Once the ESP 32 or the Gyroscope moves the ESP sends a message to our firebase database and updates the status of the device accordingly and the LED also lights up. 

The next steps are creating an app that is able to successfully pair with the device and notify the user whenever the device is moving. And also is able to call the suspect of the crime while beeping a buzzer as well. 

What the database would look like if the sensor is NOT moving:


What the database would look like if the sensor IS moving:

Issues

College dorms are a goldmine for Underwraps—students lose food to roommates daily. But most campuses use WPA2-Enterprise Wi-Fi (with logins, certificates, or MAC filtering), making it nearly impossible for IoT devices like the ESP8266 to connect automatically. And workarounds like cellular tech have additional and monthly costs as well. Hotspot would also be a problem because of limited range, so we would have to establish some partnerships with universities. 


Current Advances:

Configured WiFi on the device so that you can connect from anywhere any place
User authentication via an app developed using a Javascript framework called react-native
Finished all software meaning text messages can be sent to both people victim and suspect once device moves
Buzzer implemented once the device moves a loud noise is exhibited 




Progression:
Underwraps Product Progress Update
Prototype Advancement


Migrated from breadboard prototype to a soldered circuit board → improved reliability, durability, and closer to production readiness.


The only step left before launch is finalizing a 3D-printed enclosure to house and protect the hardware.


Near-Launch Status


Electronics + software fully functional: gyroscope detection, SMS alerts,  buzzer deterrent.


Market Validation


Engaged with Foundation Kitchen (Boston), a shared commercial kitchen, to demo the device in a high-risk, real-world environment.


Shared kitchens and coworking food spaces represent an early adopter audience where food tampering and theft are daily frustrations.


Problem Fit


Food theft + tampering is a recognized food safety risk, not just an inconvenience.


As industry experts emphasize: “One of the greatest risks to food is tampering, accidental or deliberate contamination.”


Underwraps directly fills this unmet demand with a low-cost, portable, and easy-to-use tamper-detection device.


Strategic Edge


Moves beyond trackers like AirTag/Tile → creates a new product category: tamper detection for personal food and belongings.


Affordable hardware (ESP32 + MPU6050 + buzzer) allows scaling to students, offices, and shared kitchens worldwide.


New And Improved Prototype:



About the size of your thumb and can fit onto most tupperware 
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
