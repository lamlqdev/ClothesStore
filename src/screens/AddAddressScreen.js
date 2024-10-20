import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Picker } from '@react-native-picker/picker';

const provinces = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
const cities = {
  'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa'],
  'Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3'],
  'Đà Nẵng': ['Hải Châu', 'Cẩm Lệ', 'Sơn Trà']
};

const AddAddressScreen = ({ navigation }) => {
  const [street, setStreet] = useState('');  
  const [selectedProvince, setSelectedProvince] = useState(provinces[0]);  
  const [selectedCity, setSelectedCity] = useState(cities[provinces[0]][0]);  
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    setSelectedCity(cities[selectedProvince][0]);
  }, [selectedProvince]);

  const handleAddAddress = async () => {
    if (street === '') {
      Alert.alert('Please enter street');
      return;
    }

    const newAddress = {
      street: street,
      city: selectedCity,
      province: selectedProvince
    };

    try {
      const userDocRef = firestore().collection('users').doc(userId);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        await userDocRef.set({
          addresslist: [newAddress]
        });
      } else {
        await userDocRef.update({
          addresslist: firestore.FieldValue.arrayUnion(newAddress)
        });
      }

      Alert.alert('Address added successfully');
      setStreet('');  
      navigation.navigate('ShippingAddress');
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Failed to add address');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Add Address" onBackPress={() => navigation.goBack()} />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Street:</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
          placeholder="Enter house number and street name"
        />
        <Text style={styles.label}>Province:</Text>
        <Picker
          selectedValue={selectedProvince}
          onValueChange={(itemValue) => setSelectedProvince(itemValue)}
          style={styles.picker}
        >
          {provinces.map((province, index) => (
            <Picker.Item key={index} label={province} value={province} />
          ))}
        </Picker>

        <Text style={styles.label}>City/District:</Text>
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => setSelectedCity(itemValue)}
          style={styles.picker}
        >
          {cities[selectedProvince].map((city, index) => (
            <Picker.Item key={index} label={city} value={city} />
          ))}
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleAddAddress}>
          <Text style={styles.buttonText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 16,
  },
  label: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddAddressScreen;
