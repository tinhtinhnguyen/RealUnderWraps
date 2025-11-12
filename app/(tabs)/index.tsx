import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, get } from 'firebase/database';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBdofvoV8aNpj5qHGs9V7DXUqLs_etfC2I",
  authDomain: "esp32rtb-84244.firebaseapp.com",
  databaseURL: "https://esp32rtb-84244-default-rtdb.firebaseio.com",
  projectId: "esp32rtb-84244",
  storageBucket: "esp32rtb-84244.appspot.com",
  messagingSenderId: "588280098588",
  appId: "1:588280098588:web:d1dcbaa9915f598acad4d9",
};

// Initialize Firebase with persistence
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const database = getDatabase(app);

// Carrier list with SMS domains
const carriers = [{
  "name": "alaska",
  "carrier": "Alaska",
  "sms": "sms.alaska-wireless.com",
  "mms": "msg.acsalaska.net"
}, {
  "name": "alltel",
  "carrier": "Alltel Wireless",
  "sms": "message.alltel.com",
  "mms": "mms.alltelwireless.com"
}, {
  "name": "att",
  "carrier": "AT&T Mobility",
  "sms": "txt.att.net",
  "mms": "mms.att.net"
}, {
  "name": "boost",
  "carrier": "Boost Mobile",
  "sms": "myboostmobile.com",
  "mms": "myboostmobile.com"
}, {
  "name": "cinglular",
  "carrier": "Cingular",
  "sms": "txt.att.net",
  "mms": "mms.att.net"
}, {
  "name": "cleartalk",
  "carrier": "Cleartalk",
  "sms": "sms.cleartalk.us"
}, {
  "name": "cricket",
  "carrier": "Cricket Wireless",
  "sms": "sms.cricketwireless.net",
  "mms": "mms.cricketwireless.net"
}, {
  "name": "cspire",
  "carrier": "C Spire Wireless",
  "sms": "cspire1.com"
}, {
  "name": "metropcs",
  "carrier": "T-Mobile_MetroPCS",
  "sms": "tmomail.net",
  "mms": "tmomail.net"
}, {
  "name": "nextel",
  "carrier": "Sprint Nextel",
  "sms": "messaging.nextel.com"
}, {
  "name": "pageplus",
  "carrier": "Page Plus",
  "sms": "vtext.com",
  "mms": "vzwpix.com"
}, {
  "name": "projectfi",
  "carrier": "Google Project Fi",
  "sms": "msg.fi.google.com"
}, {
  "name": "republic",
  "carrier": "Republic Wireless",
  "sms": "text.republicwireless.com"
}, {
  "name": "sprint",
  "carrier": "Sprint",
  "sms": "messaging.sprintpcs.com",
  "mms": "pm.sprint.com"
}, {
  "name": "straighttalk",
  "carrier": "Straight Talk",
  "sms": "txt.att.net",
  "mms": "mms.att.net"
}, {
  "name": "ting",
  "carrier": "Ting",
  "sms": "message.ting.com"
}, {
  "name": "tmobile",
  "carrier": "T-Mobile",
  "sms": "tmomail.net",
  "mms": "tmomail.net"
}, {
  "name": "tracfone",
  "carrier": "Tracfone",
  "sms": "mmst5.tracfone.com",
  "mms": "mmst5.tracfone.com"
}, {
  "name": "uscellular",
  "carrier": "US Cellular",
  "sms": "email.uscc.net",
  "mms": "mms.uscc.net"
}, {
  "name": "verizon",
  "carrier": "Verizon Wireless",
  "sms": "vtext.com",
  "mms": "vzwpix.com"
}, {
  "name": "viaero",
  "carrier": "Viaero Wireless",
  "sms": "viaerosms.com",
  "mms": "mmsviaero.com"
}, {
  "name": "virgin",
  "carrier": "Virgin Mobile",
  "sms": "vmobl.com",
  "mms": "vmpix.com"
}];

/**
 * Find the SMS domain for a given carrier string (from API).
 * Matches on name, carrier, or substring (fuzzy).
 */
function getSmsDomainByCarrier(input) {
  if (!input) return null;
  const normalized = input.toLowerCase();

  // Exact match on name or carrier
  let carrier = carriers.find(c =>
    c.name.toLowerCase() === normalized ||
    (c.carrier && c.carrier.toLowerCase() === normalized)
  );
  if (carrier) return carrier.sms;

  // Fuzzy match (substring search)
  carrier = carriers.find(c =>
    (c.name && normalized.includes(c.name.toLowerCase())) ||
    (c.carrier && normalized.includes(c.carrier.toLowerCase().split(" ")[0])) // match first word
  );
  return carrier ? carrier.sms : null;
}

async function getPhoneData(phoneNumber) {
  try {
    // Add "1" before the number (not +1)
    const numberWith1 = `1${phoneNumber}`;
    const url = `https://phonevalidation.abstractapi.com/v1/?api_key=fcea56060843447f9c6b501329f82179&phone=${numberWith1}`;
    
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);
    console.log("Carrier:", data.carrier);
    console.log("Line type:", data.type);

    // Get SMS domain using smart lookup
    const smsDomain = getSmsDomainByCarrier(data.carrier);
    console.log("SMS domain:", smsDomain);

    return smsDomain;
  } catch (err) {
    console.error("Error fetching phone data:", err);
    return null;
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mac, setMac] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signingUp, setSigningUp] = useState(false);

  // Check auth state with persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileRef = ref(database, `users/${user.uid}/profile`);
          const snapshot = await get(profileRef);
          if (snapshot.exists()) {
            router.replace('/explore');
            return;
          }
        } catch (error) {
          console.error('Profile check error:', error);
        }
      }
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  // Validation functions
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;
  const isValidMac = (mac) => /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac.trim());
  const isValidPhoneNumber = (phone) => phone.replace(/\D/g, '').length >= 10;

  const handleSignUp = async () => {
    if (!isValidEmail(email) || !isValidPassword(password) || !isValidMac(mac) || !isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Input', 'Please check all fields');
      return;
    }

    setSigningUp(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Normalize number
      const rawNumber = phoneNumber.trim().replace(/\D/g, '');

      // Get SMS domain
      const smsDomain = await getPhoneData(rawNumber);

      await set(ref(database, `users/${user.uid}/profile`), {
        accountCreated: new Date().toISOString(),
        deviceConfigured: false,
        email: email.trim(),
        macAddress: mac.trim(),
        phoneNumber: rawNumber, // saved WITHOUT +1 or 1
        smsDomain: smsDomain || "unknown",
        userId: user.uid,
      });

      router.replace('/explore');
    } catch (error) {
      let message = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
      Alert.alert('Error', message);
      setSigningUp(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={require('@/assets/images/underwraps-logo.png')}
          style={styles.loadingLogo}
          contentFit="contain"
        />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#EAF7FA', dark: '#1a1a1a' }}
          headerImage={
            <Image 
              source={require('@/assets/images/underwraps-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          }
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title">Welcome to UnderWraps</ThemedText>
            <HelloWave />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Step 1: Enter Your Email</ThemedText>
            <TextInput
              style={styles.inputBox}
              placeholder="you@email.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Step 2: Enter Your Password</ThemedText>
            <TextInput
              style={styles.inputBox}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Step 3: Enter MAC Address</ThemedText>
            <ThemedText style={styles.helperText}>
              When your device was delivered a MAC Address was written in your package.
            </ThemedText>
            <TextInput
              style={styles.inputBox}
              placeholder="Ex: A8:A7:67:FF:EE:DD"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              value={mac}
              onChangeText={setMac}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Step 4: Enter Your Phone Number</ThemedText>
            <TextInput
              style={styles.inputBox}
              placeholder="Ex: 1234567890"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.signUpButton, signingUp && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={signingUp}
            >
              <Text style={styles.buttonText}>
                {signingUp ? 'Creating Account...' : 'Next'}
              </Text>
            </TouchableOpacity>
          </ThemedView>
        </ParallaxScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 40,
  },
  loadingLogo: {
    height: 120,
    width: 200,
    marginBottom: 30,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  logo: {
    height: 160,
    width: 280,
    alignSelf: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  helperText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  inputBox: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signUpButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 14,
    paddingHorizontal: 75,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  signUpButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});