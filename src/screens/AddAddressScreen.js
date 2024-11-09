import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Picker } from '@react-native-picker/picker';

const AddAddressScreen = ({ navigation }) => {
  const [street, setStreet] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
        if (response.data.error === 0) {
          setProvinces(response.data.data);
          setSelectedProvince(response.data.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchUserId();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`);
          if (response.data.error === 0) {
            setCities(response.data.data);
            setSelectedCity(response.data.data[0]?.id);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      };
      fetchCities();
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${selectedCity}.htm`);
          if (response.data.error === 0) {
            setWards(response.data.data);
            setSelectedWard(response.data.data[0]?.id);
          }
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [selectedCity]);

  const handleAddAddress = async () => {
    if (street === '') {
      Alert.alert('Please enter street');
      return;
    }

    const selectedProvinceName = provinces.find(p => p.id === selectedProvince)?.full_name || '';
    const selectedCityName = cities.find(c => c.id === selectedCity)?.full_name || '';
    const selectedWardName = wards.find(w => w.id === selectedWard)?.full_name || '';

    const newAddress = {
      street: street,
      ward: selectedWardName,
      city: selectedCityName,
      province: selectedProvinceName
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
      navigation.navigate('ShippingAddress', { refresh: true });
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
          {provinces.map((province) => (
            <Picker.Item key={province.id} label={province.full_name} value={province.id} />
          ))}
        </Picker>

        <Text style={styles.label}>City/District:</Text>
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => setSelectedCity(itemValue)}
          style={styles.picker}
        >
          {cities.map((city) => (
            <Picker.Item key={city.id} label={city.full_name} value={city.id} />
          ))}
        </Picker>

        <Text style={styles.label}>Ward:</Text>
        <Picker
          selectedValue={selectedWard}
          onValueChange={(itemValue) => setSelectedWard(itemValue)}
          style={styles.picker}
        >
          {wards.map((ward) => (
            <Picker.Item key={ward.id} label={ward.full_name} value={ward.id} />
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
    padding: 20,
    backgroundColor: 'white'
  },
  inputContainer: {
    marginVertical: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#007BFF',
    backgroundColor: 'gray',
    borderRadius: 65,
    color: 'white'
  },
  button: {
    backgroundColor: 'brown',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddAddressScreen;
