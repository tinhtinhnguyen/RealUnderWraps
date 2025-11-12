#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include <WiFi.h>
#include <WiFiManager.h>
#include <EMailSender.h>
#include <ArduinoJson.h>

// --- WiFi ---
#define WIFI_SSID "REDACTED"
#define WIFI_PASSWORD "REDACTED"

// --- Pins ---
const int buzzerPin = 27;
const int ledPin = 14;

// --- Firebase ---
#define API_KEY "AIzaSyBdofvoV8aNpj5qHGs9V7DXUqLs_etfC2I"
#define DATABASE_URL "https://esp32rtb-84244-default-rtdb.firebaseio.com/"

// --- Email (Gmail App Password) ---
EMailSender emailSend("ryanpr224@gmail.com", "REDACTED");

// --- MPU6050 ---
Adafruit_MPU6050 mpu;

// --- Firebase Client ---
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- Movement Variables ---
const float movementThreshold = 1.0;
bool wasMoving = false;
bool signupOK = false;

// --- Buzzer Variables ---
unsigned long buzzerStartTime = 0;
bool buzzerActive = false;
const unsigned long buzzerDuration = 200;

void setup()
{
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  // --- WiFi Connection ---
  WiFiManager wm;
  // wm.resetSettings();
  if (!wm.autoConnect("AAAAnUnderWrapsDevice", "password"))
  {
    Serial.println("FAILED TO CONNECT");
  }
  Serial.print("Connected: ");
  Serial.println(WiFi.localIP());

  // --- Firebase Setup ---
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  if (Firebase.signUp(&config, &auth, "", ""))
  {
    Serial.println("Firebase anonymous signup OK");
    signupOK = true;
  }
  else
  {
    Serial.println("Firebase signup FAILED: " + fbdo.errorReason());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // --- MPU6050 Setup ---
  if (!mpu.begin())
  {
    Serial.println("MPU6050 not found");
    while (1)
      delay(10);
  }
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);
  delay(100);

  // --- Register Device MAC in Firebase ---
  String mac = WiFi.macAddress();
  Serial.println("Device MAC: " + mac);
  if (Firebase.ready() && signupOK)
  {
    String path = "/Devices/" + mac;
    Firebase.RTDB.setString(&fbdo, path, "registered");
  }
  Serial.println("Setup complete.");
}

void sendMovementAlert()
{
  Serial.println("-> sendMovementAlert()");
  String mac = WiFi.macAddress();

  // Get /users from Firebase
  if (!Firebase.RTDB.getString(&fbdo, "/users"))
  {
    Serial.println("Error getting /users: " + fbdo.errorReason());
    return;
  }

  DynamicJsonDocument doc(16384);
  if (deserializeJson(doc, fbdo.to<String>()))
  {
    Serial.println("JSON parse failed");
    return;
  }
  JsonObject users = doc.as<JsonObject>();

  // Find matching user by MAC
  String matchedUID;
  String userSmsDomain;
  for (JsonPair kv : users)
  {
    JsonObject profile = kv.value()["profile"];
    if (profile["macAddress"] && profile["macAddress"] == mac)
    {
      matchedUID = kv.key().c_str();
      userSmsDomain = profile["smsDomain"].as<String>();
      break;
    }
  }
  if (matchedUID.isEmpty())
  {
    Serial.println("No user found for MAC");
    return;
  }

  // Get both numbers directly (DB already has no +1)
  String userPhone = users[matchedUID]["profile"]["phoneNumber"].as<String>();
  String contactPhone;
  JsonObject contacts = users[matchedUID]["contacts"];
  for (JsonPair ckv : contacts)
  {
    contactPhone = ckv.value()["phone"].as<String>();
    break; // Only take first contact
  }
  if (userPhone.isEmpty() || contactPhone.isEmpty())
  {
    Serial.println("Missing phone number(s)");
    return;
  }

  // Use the user's SMS domain for both numbers
  String emails[2] = {userPhone + "@" + userSmsDomain, contactPhone + "@" + userSmsDomain};
  for (String addr : emails)
  {
    EMailSender::EMailMessage msg;
    msg.subject = "Movement Detected!";
    msg.message = "Alert: SOMEBODY IS MESSING WITH UR STUFF BRO";
    EMailSender::Response resp = emailSend.send(addr, msg);
    Serial.println("Sent to " + addr + ": " + resp.status + " " + resp.desc);
  }
}

void loop()
{
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  bool isMoving = (abs(g.gyro.x) > movementThreshold ||
                   abs(g.gyro.y) > movementThreshold ||
                   abs(g.gyro.z) > movementThreshold);

  // Handle buzzer off timing
  if (buzzerActive && (millis() - buzzerStartTime >= buzzerDuration))
  {
    digitalWrite(buzzerPin, LOW);
    buzzerActive = false;
  }

  if (isMoving && !wasMoving)
  {
    digitalWrite(ledPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    buzzerStartTime = millis();
    buzzerActive = true;

    sendMovementAlert();
    if (Firebase.ready() && signupOK)
    {
      Firebase.RTDB.setInt(&fbdo, "/Sensor/movement_data", 1);
    }
    wasMoving = true;
  }
  else if (!isMoving && wasMoving)
  {
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);
    buzzerActive = false;

    if (Firebase.ready() && signupOK)
    {
      Firebase.RTDB.setInt(&fbdo, "/Sensor/movement_data", 0);
    }
    wasMoving = false;
  }
  delay(200);
}