import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../firebaseConfig';
import Header from '../components/Header';

const AddPhoneScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState(null);
  const [phonelist, setPhonelist] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = auth.currentUser;
      setUserId(user.uid);
    };
    fetchUserId();
  }, []);

  // Lắng nghe thay đổi từ Firestore khi dữ liệu thay đổi
  useEffect(() => {
    if (userId) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(userId)
        .onSnapshot((documentSnapshot) => {
          const userData = documentSnapshot.data();
          if (userData && userData.phonelist) {
            setPhonelist(userData.phonelist);
          }
        });

      return () => unsubscribe();
    }
  }, [userId]);

  const handleAddPhone = async () => {
    // Kiểm tra xem số điện thoại có 10 chữ số không
    const phoneRegex = /^[0-9]{10}$/;  // Biểu thức chính quy để kiểm tra 10 chữ số
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid phone number', 'Please enter a valid 10-digit phone number');
      return;
    }
  
    if (phoneNumber === '') {
      Alert.alert('Please enter a phone number');
      return;
    }
  
    try {
      const userDocRef = firestore().collection('users').doc(userId);
      const userDoc = await userDocRef.get();
  
      if (!userDoc.exists) {
        await userDocRef.set({
          phonelist: [phoneNumber],
        });
      } else {
        await userDocRef.update({
          phonelist: firestore.FieldValue.arrayUnion(phoneNumber),
        });
      }
  
      Alert.alert('Phone number added successfully');
      setPhoneNumber(''); // Reset trường nhập sau khi thêm số điện thoại
      navigation.navigate('ChoosePhone', { refresh: true, hideApplyButton: true, hideRadioButton: true });
    } catch (error) {
      console.error('Error adding phone number:', error);
      Alert.alert('Failed to add phone number');
    }
  };      

  return (
    <View style={styles.container}>
      <Header title="Add Phone" onBackPress={() => navigation.goBack()} />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddPhone}>
          <Text style={styles.buttonText}>Add Phone</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.phoneListContainer}>
        <Text style={styles.phoneListTitle}>Phone List:</Text>
        {phonelist.length > 0 ? (
          phonelist.map((phone, index) => (
            <Text key={index} style={styles.phoneItem}>
              {phone}
            </Text>
          ))
        ) : (
          <Text style={styles.noPhoneText}>No phone numbers added yet.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneListContainer: {
    marginTop: 20,
  },
  phoneListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phoneItem: {
    fontSize: 16,
    marginVertical: 4,
  },
  noPhoneText: {
    fontSize: 14,
    color: '#888',
  },
});

export default AddPhoneScreen;
