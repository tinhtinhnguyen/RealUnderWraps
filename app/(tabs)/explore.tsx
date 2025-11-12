// ExploreScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase modular imports (v9)
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, push, remove, onValue } from 'firebase/database';

// Keep your custom components (unchanged)
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

// Function to get phone data from API
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

export default function ExploreScreen() {
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Try to get Firebase instances. If not configured, we'll fall back to local storage.
  let auth = null;
  let database = null;
  try {
    auth = getAuth();
    database = getDatabase();
  } catch (err) {
    console.warn('Firebase not configured or initialization error:', err);
    // will flip to local storage below
  }

  useEffect(() => {
    initializeData();
    // cleanup handled by returned unsubscribe inside initializeData when using firebase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = async () => {
    try {
      if (auth && !useLocalStorage) {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            // subscribe to database values
            const contactsRef = ref(database, `users/${currentUser.uid}/contacts`);
            const unsubscribeDb = onValue(
              contactsRef,
              (snapshot) => {
                const data = snapshot.val();
                if (data) {
                  const contactsArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                  }));
                  // keep newest first like before
                  setContacts(contactsArray.reverse());
                } else {
                  setContacts([]);
                }
                setLoading(false);
              },
              (err) => {
                console.error('Realtime DB read error, falling back to local:', err);
                setUseLocalStorage(true);
                loadContactsFromLocal();
                setLoading(false);
              }
            );

            // ensure we unsubscribe DB listener when user logs out/cleanup
            // store unsubscribeDb inside unsubscribeAuth (we can't return both easily here),
            // so we'll rely on the lifecycle of the auth listener; it's fine in this pattern.
          } else {
            // not signed in -> fallback to local storage
            setUser(null);
            setUseLocalStorage(true);
            loadContactsFromLocal();
          }
        });

        // Return cleanup for auth unsubscribe when component unmounts
        return () => unsubscribeAuth();
      } else {
        // Firebase not available -> use local
        setUseLocalStorage(true);
        await loadContactsFromLocal();
      }
    } catch (error) {
      console.error('initializeData error:', error);
      setUseLocalStorage(true);
      await loadContactsFromLocal();
    }
  };

  const loadContactsFromLocal = async () => {
    try {
      const stored = await AsyncStorage.getItem('food_thief_contacts');
      if (stored) {
        const arr = JSON.parse(stored);
        setContacts(arr);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('loadContactsFromLocal error:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveContactsToLocal = async (contactsArray) => {
    try {
      await AsyncStorage.setItem('food_thief_contacts', JSON.stringify(contactsArray));
    } catch (err) {
      console.error('saveContactsToLocal error:', err);
    }
  };

  const addContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    setUploading(true);

    // generate ID now so local fallback can reuse same ID variable
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Clean phone number (remove all non-digits)
      const cleanNumber = newContact.phone.trim().replace(/\D/g, '');
      console.log("Clean number:", cleanNumber);
      
      // Get SMS domain
      const smsDomain = await getPhoneData(cleanNumber);

      // If firebase is available and user is signed in, try to store in firebase
      if (!useLocalStorage && user && database) {
        const contactObj = {
          id: contactId,
          name: newContact.name.trim(),
          phone: cleanNumber, // Store clean number without prefix
          smsDomain: smsDomain || "unknown",
          addedAt: new Date().toISOString(),
          addedAtFormatted: new Date().toLocaleDateString(),
        };

        // store under users/{uid}/contacts/{contactId}
        await set(ref(database, `users/${user.uid}/contacts/${contactId}`), contactObj);

        // local UI update: put newest first
        setContacts((prev) => [contactObj, ...prev]);
        setNewContact({ name: '', phone: '' });
        setShowAddModal(false);
        Alert.alert('Success', 'Contact added successfully');
        return;
      }

      // If here -> either using localStorage or Firebase failed
      throw new Error('Using local storage fallback');
    } catch (err) {
      console.warn('Primary save failed or using local storage: ', err);

      // Save locally
      try {
        const cleanNumber = newContact.phone.trim().replace(/\D/g, '');
        const smsDomain = await getPhoneData(cleanNumber);

        const localContact = {
          id: contactId,
          name: newContact.name.trim(),
          phone: cleanNumber,
          smsDomain: smsDomain || "unknown",
          addedAt: new Date().toISOString(),
          addedAtFormatted: new Date().toLocaleDateString(),
        };

        const updated = [localContact, ...contacts];
        setContacts(updated);
        await saveContactsToLocal(updated);

        setNewContact({ name: '', phone: '' });
        setShowAddModal(false);
        setUseLocalStorage(true);
        Alert.alert('Success', 'Contact added successfully (saved locally)');
      } catch (localErr) {
        console.error('Saving to local storage failed:', localErr);
        Alert.alert('Error', 'Failed to add contact');
      }
    } finally {
      setUploading(false);
    }
  };

  const removeContact = (contactId, contactName) => {
    Alert.alert(
      'Remove Contact',
      `Delete ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Try Firebase delete first
              if (!useLocalStorage && user && database) {
                try {
                  await remove(ref(database, `users/${user.uid}/contacts/${contactId}`));
                  Alert.alert('Deleted', 'Contact removed from Firebase');
                  // local UI update will be handled by realtime DB listener (onValue). But update state defensively:
                  setContacts((prev) => prev.filter((c) => c.id !== contactId));
                  return;
                } catch (fbDelErr) {
                  console.error('Firebase delete failed, falling back to local:', fbDelErr);
                }
              }

              // Fallback local deletion
              const updated = contacts.filter((c) => c.id !== contactId);
              setContacts(updated);
              await saveContactsToLocal(updated);
              Alert.alert('Deleted', 'Contact removed');
            } catch (err) {
              console.error('Error removing contact:', err);
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactImagePlaceholder}>
        <IconSymbol name="person.crop.circle.fill" size={40} color="#FF385C" />
      </View>

      <View style={styles.contactInfo}>
        <ThemedText type="defaultSemiBold" style={styles.contactName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.contactPhone}>{item.phone}</ThemedText>
        <ThemedText style={styles.contactEmail}>SMS: {item.smsDomain}</ThemedText>
        <ThemedText style={styles.contactDate}>Added: {item.addedAtFormatted}</ThemedText>
        {useLocalStorage && <ThemedText style={styles.localStorageIndicator}>📱 Stored locally</ThemedText>}
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={() => removeContact(item.id, item.name)}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Loading contacts...</ThemedText>
      </View>
    );
  }

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#EAF7FA', dark: '#1a1a1a' }}
        headerImage={
          <View style={styles.headerContent}>
            <IconSymbol size={60} color="#FF385C" name="person.2.fill" style={styles.headerIcon} />
          </View>
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">THEIF LIST </ThemedText>
          <ThemedText style={styles.subtitle}>Add contacts to know who's taking your eats!</ThemedText>
          {useLocalStorage && <ThemedText style={styles.storageIndicator}>📱 Using local storage {user ? '(Firebase fallback)' : '(No authentication)'}</ThemedText>}
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {contacts.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Contacts</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add New Contact</Text>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.listContainer}>
          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol size={80} color="rgba(255, 255, 255, 0.3)" name="person.badge.plus" style={styles.emptyIcon} />
              <ThemedText style={styles.emptyText}>No contacts yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Add contacts to receive SMS alerts</ThemedText>
            </View>
          ) : (
            <FlatList
              data={contacts}
              renderItem={renderContact}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ThemedView>
      </ParallaxScrollView>

      <Modal transparent visible={showAddModal} animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              value={newContact.name}
              onChangeText={(text) => setNewContact((prev) => ({ ...prev, name: text }))}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              placeholderTextColor="#aaa"
              value={newContact.phone}
              onChangeText={(text) => setNewContact((prev) => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveButton} onPress={addContact} disabled={uploading}>
              <Text style={styles.saveButtonText}>{uploading ? 'Adding Contact...' : 'Add Contact'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    marginTop: 40,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    fontSize: 16,
  },
  storageIndicator: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
    fontSize: 12,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 28,
    color: '#FF385C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 56, 92, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    marginBottom: 4,
    color: '#fff',
  },
  contactPhone: {
    fontSize: 16,
    color: '#FF385C',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  contactDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  localStorageIndicator: {
    fontSize: 10,
    opacity: 0.4,
    fontStyle: 'italic',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 56, 92, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeButtonText: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#222',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  modalInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    fontSize: 18,
    opacity: 0.7,
  },
});