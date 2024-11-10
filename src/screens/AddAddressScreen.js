import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import Header from '../components/Header';
import Config from 'react-native-config';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const AddAddressScreen = ({ navigation }) => {
  const [street, setStreet] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedProvinceData, setSelectedProvinceData] = useState(null);
  const [selectedCityData, setSelectedCityData] = useState(null);
  const [selectedWardData, setSelectedWardData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [region, setRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);

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
          if (response.data.data.length > 0) {
            setSelectedProvince(response.data.data[0].id);
            setSelectedProvinceData(response.data.data[0]);
          }
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
            if (response.data.data.length > 0) {
              setSelectedCity(response.data.data[0].id);
              setSelectedCityData(response.data.data[0]);
            }
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
            if (response.data.data.length > 0) {
              setSelectedWard(response.data.data[0].id);
              setSelectedWardData(response.data.data[0]);
            }
          }
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [selectedCity]);

  const getCoordinates = async (address) => {
    if (!address) return;
    setIsLoading(true);

    try {
      // Thêm "Việt Nam" vào cuối địa chỉ để tăng độ chính xác
      const fullAddress = `${address}, Việt Nam`;
      console.log('Full Address:', fullAddress);
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: fullAddress,
          key: Config.GOOGLE_API_KEY,
          language: 'vi', // Thêm parameter ngôn ngữ tiếng Việt
          region: 'vn', // Thêm parameter region để ưu tiên kết quả ở Việt Nam
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01, // zoom gần hơn
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert('No location found for this address');
        console.log('Google Maps API response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      Alert.alert('An error occurred while searching for location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchLocation = () => {
    if (!street || !selectedProvinceData || !selectedCityData || !selectedWardData) {
      Alert.alert('Please enter full address information');
      return;
    }

    const fullAddress = `${street}, ${selectedWardData.full_name}, ${selectedCityData.full_name}, ${selectedProvinceData.full_name}`;
    console.log('Searching for address:', fullAddress); 
    getCoordinates(fullAddress);
  };

  const handleAddAddress = async () => {
    if (!street) {
      Alert.alert('Please enter street');
      return;
    }

    const newAddress = {
      street,
      ward: selectedWardData?.full_name,
      city: selectedCityData?.full_name,
      province: selectedProvinceData?.full_name,
      latitude: region.latitude,
      longitude: region.longitude,
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

      <ScrollView style={styles.inputContainer}>
        <Text style={styles.label}>Street:</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
          placeholder="Enter house number and street name"
        />
        
        <Text style={styles.label}>Province:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedProvince}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedProvince(itemValue);
              setSelectedProvinceData(provinces[itemIndex]);
            }}
            style={styles.picker}
          >
            {provinces.map((province) => (
              <Picker.Item key={province.id} label={province.full_name} value={province.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>City:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedCity(itemValue);
              setSelectedCityData(cities[itemIndex]);
            }}
            style={styles.picker}
          >
            {cities.map((city) => (
              <Picker.Item key={city.id} label={city.full_name} value={city.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Ward:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedWard}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedWard(itemValue);
              setSelectedWardData(wards[itemIndex]);
            }}
            style={styles.picker}
          >
            {wards.map((ward) => (
              <Picker.Item key={ward.id} label={ward.full_name} value={ward.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity 
          style={[styles.searchButton, isLoading && styles.disabledButton]}
          onPress={handleSearchLocation}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Searching...' : 'Search location on map'}
          </Text>
        </TouchableOpacity>

        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
        </MapView>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleAddAddress}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Add Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: 'brown',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default AddAddressScreen;