import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  initializeAuth,
  onAuthStateChanged
} from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBdofvoV8aNpj5qHGs9V7DXUqLs_etfC2I",
  authDomain: "esp32rtb-84244.firebaseapp.com",
  databaseURL: "https://esp32rtb-84244-default-rtdb.firebaseio.com",
  projectId: "esp32rtb-84244",
  storageBucket: "esp32rtb-84244.appspot.com",
  messagingSenderId: "588280098588",
  appId: "1:588280098588:web:d1dcbaa9915f598acad4d9",
};

// Initialize Firebase
let auth;
if (getApps().length === 0) {
  const app = initializeApp(firebaseConfig);
  // Use type assertion to access getReactNativePersistence (Firebase v10+ compatibility)
  const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
  // Initialize Auth with React Native persistence
  auth = initializeAuth(app, {
    persistence: reactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  auth = getAuth();
}

export default function HomeScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mac, setMac] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [showWifiPopup, setShowWifiPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        router.replace('/explore');
      }
    });
    return unsubscribe;
  }, []);

  const isValid = () =>
    /\S+@\S+\.\S+/.test(email) && mac.length >= 8 && password.length >= 6;

  const handleNext = async () => {
    if (!isValid()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Don't navigate here - let the auth state listener handle it
      setShowWifiPopup(true);
    } catch (error) {
      console.log("Signup Error:", error.message);
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    await set(ref(db, `users/${user.uid}/device`), {
      mac,
      ssid,
      wifiPassword,
    });

    setShowWifiPopup(false);
    // Navigation will be handled by the auth state listener
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#EAF7FA', dark: '#1a1a1a' }}
          headerImage={<Image source={require('@/assets/images/underwraps-logo.png')} style={styles.logo} />}
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
            <ThemedText>
              When your device was delivered a MAC Address was written in your package.
            </ThemedText>
            <TextInput
              style={styles.inputBox}
              placeholder="Ex: A8:A7:67"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              value={mac}
              onChangeText={setMac}
            />
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity style={styles.signUpButton} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </ThemedView>
        </ParallaxScrollView>

        <Modal transparent visible={showWifiPopup} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.popupCard}>
              <TouchableOpacity onPress={() => setShowWifiPopup(false)} style={styles.closeButton}>
                <Text style={{ fontSize: 18, color: '#999' }}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.popupTitle}>Enter Wi-Fi Details</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="Wi-Fi SSID"
                placeholderTextColor="#aaa"
                value={ssid}
                onChangeText={setSsid}
              />
              <TextInput
                style={styles.inputBox}
                placeholder="Wi-Fi Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={wifiPassword}
                onChangeText={setWifiPassword}
              />
              <TouchableOpacity style={styles.signUpButton} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 160,
    width: 280,
    resizeMode: 'contain',
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    width: '85%',
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    alignSelf: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
});