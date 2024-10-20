import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const ShippingAddressScreen = ({ navigation, route }) => {
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userId, setUserId] = useState(null);

  // Lấy selectedProducts từ route nếu có
  const { selectedProducts = [], selectedPhone } = route.params || {};

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchAddresses = async () => {
      if (userId) {
        try {
          const userDoc = await firestore().collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setAddressList(userData.addresslist || []);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        }
      }
    };

    fetchUserId();
    if (userId) {
      fetchAddresses();
    }
  }, [userId]); 

  const handleAddressSelect = (index) => {
    setSelectedAddress(index);  // Lưu chỉ số của địa chỉ đã chọn
  };

  const handleApply = () => {
    if (selectedAddress !== null) {
      const selectedAddressObject = addressList[selectedAddress];
      // Pass the address and selected products to the Checkout screen
      navigation.navigate('Checkout', {
        selectedProducts,
        selectedAddress: selectedAddressObject, // Đảm bảo tên trường đúng
        selectedPhone // Giữ số điện thoại hiện tại
      });
    } else {
      alert('Please select an address');
    }
  };  

  const renderAddressItem = ({ item, index }) => (
    <TouchableOpacity style={styles.addressItem} onPress={() => handleAddressSelect(index)}>
      <View style={styles.addressInfo}>
        <Icon name="location-on" size={24} color="brown" />
        <View>
          <Text style={styles.addressType}>{item.type || 'Address'}</Text>
          <Text style={styles.addressText}>{item.street}, {item.city}, {item.province}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleAddressSelect(index)}>
        <Icon2
          name={selectedAddress === index ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={selectedAddress === index ? '#8B4513' : '#ccc'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Shipping Address" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={addressList}
        renderItem={renderAddressItem}
        keyExtractor={(item, index) => `address-${index}`}
        ListEmptyComponent={<Text style={styles.emptyText}>No addresses available.</Text>}
      />
      <TouchableOpacity
        style={styles.addAddress}
        onPress={() => navigation.navigate('AddAddress')}
      >
        <Icon name="add" size={24} color="#000" />
        <Text style={styles.addAddressText}>Add New Shipping Address</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleApply}>
        <Text style={styles.buttonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
};

const ChoosePhoneScreen = ({ navigation, route }) => {
  const [phoneList, setPhoneList] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [userId, setUserId] = useState(null);

  // Kiểm tra nếu selectedProducts tồn tại trong route.params
  const { selectedProducts = [], selectedAddress } = route.params || {};

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchPhones = async () => {
      if (userId) {
        try {
          const userDoc = await firestore().collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setPhoneList(userData.phonelist || []);
          }
        } catch (error) {
          console.error('Error fetching phones:', error);
        }
      }
    };

    fetchUserId();
    if (userId) {
      fetchPhones();
    }
  }, [userId]);

  const handlePhoneSelect = (index) => {
    setSelectedPhone(phoneList[index]);
  };

  const renderPhoneItem = ({ item, index }) => (
    <TouchableOpacity style={styles.addressItem} onPress={() => handlePhoneSelect(index)}>
      <View style={styles.addressInfo}>
        <Icon name="phone" size={24} color="brown" />
        <View>
          <Text style={styles.addressType}>Phone</Text>
          <Text style={styles.addressText}>{item}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handlePhoneSelect(index)}>
        <Icon2
          name={selectedPhone === phoneList[index] ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={selectedPhone === phoneList[index] ? '#8B4513' : '#ccc'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleApply = () => {
    if (selectedPhone) {
      navigation.navigate('Checkout', {
        selectedProducts,
        selectedAddress, // Giữ địa chỉ hiện tại
        selectedPhone // Truyền số điện thoại đã chọn
      });
    } else {
      alert('Please select a phone number');
    }
  };  

  return (
    <View style={styles.container}>
      <Header title="Choose Phone" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={phoneList}
        renderItem={renderPhoneItem}
        keyExtractor={(item, index) => `phone-${index}`}
        ListEmptyComponent={<Text style={styles.emptyText}>No phone numbers available.</Text>}
      />
      <TouchableOpacity
        style={styles.addAddress}
        onPress={() => navigation.navigate('AddPhone')}
      >
        <Icon name="add" size={24} color="#000" />
        <Text style={styles.addAddressText}>Add New Phone Number</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleApply}>
        <Text style={styles.buttonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
  },
  addAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addAddressText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#8B4513',
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#666',
  },
});

export { ShippingAddressScreen, ChoosePhoneScreen };
