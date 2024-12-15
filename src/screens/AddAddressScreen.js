import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import Header from '../components/Header';
import Mapbox from '@rnmapbox/maps';
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
    zoomLevel: 12,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeMapbox = async () => {
      try {
        await Mapbox.setAccessToken('pk.eyJ1IjoidGFubHVvbmciLCJhIjoiY20zZW9nZXZoMGdiYTJscHpjNTkyMjFobyJ9.he1vRAvudneBgmpI8JtG6Q');
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    };

    initializeMapbox();
  }, []);

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
      // Thêm "Vietnam" vào địa chỉ để cải thiện độ chính xác
      const fullAddress = `${address}, Việt Nam`;
      console.log('Full Address:', fullAddress);

      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json`, {
        params: {
          access_token: 'pk.eyJ1IjoidGFubHVvbmciLCJhIjoiY20zZW9nZXZoMGdiYTJscHpjNTkyMjFobyJ9.he1vRAvudneBgmpI8JtG6Q',
          language: 'vi',
        },
      });

      console.log(response.data);
      if (response.data.features && response.data.features.length > 0) {
        const location = response.data.features[0].geometry.coordinates;
        setRegion({
          latitude: location[1],  // Mapbox trả về [longitude, latitude], cần đảo ngược
          longitude: location[0],
          zoomLevel: 14, // Zoom vào một chút
        });
      } else {
        Alert.alert('Không tìm thấy vị trí cho địa chỉ này');
        console.log('Mapbox response:', response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy tọa độ:', error);
      Alert.alert('Đã xảy ra lỗi trong quá trình tìm kiếm vị trí.');
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

        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          zoomLevel={region.zoomLevel}
          centerCoordinate={[region.longitude, region.latitude]}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          attributionEnabled={true}
          logoEnabled={true}
        >
          <Mapbox.Camera
            zoomLevel={region.zoomLevel}
            centerCoordinate={[region.longitude, region.latitude]}
            animationDuration={0}
          />
          <Mapbox.PointAnnotation
            id="marker"
            coordinate={[region.longitude, region.latitude]}
            title="Selected Location"
          />
        </Mapbox.MapView>

        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Text style={styles.buttonText}>Add Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  searchButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  map: {
    flex: 1,
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'brown',
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default AddAddressScreen;