import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import Header from '../components/Header';

const ShippingAddressScreen = ({ navigation, route }) => {
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null); // Địa chỉ hiện tại cho lần thanh toán
  const [defaultAddressIndex, setDefaultAddressIndex] = useState(null); // Chỉ số của địa chỉ mặc định
  const [userId, setUserId] = useState(null);

  const { selectedProducts = [], selectedPhone } = route.params || {};

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchAddresses = () => {
      if (userId) {
        const unsubscribe = firestore()
          .collection('users')
          .doc(userId)
          .onSnapshot((doc) => {
            if (doc.exists) {
              const userData = doc.data();
              setAddressList(userData.addresslist || []);
              const defaultAddr = userData.defaultAddress;
              if (defaultAddr) {
                const defaultIndex = userData.addresslist.findIndex(
                  (addr) => addr.street === defaultAddr.street && addr.city === defaultAddr.city
                );
                setDefaultAddressIndex(defaultIndex);
                setSelectedAddress(defaultIndex);
              }
            }
          });

        return () => unsubscribe();
      }
    };

    fetchUserId();
    fetchAddresses();
  }, [userId]);

  const handleAddressSelect = (index) => {
    setSelectedAddress(index); // Chọn cho lần thanh toán hiện tại
  };

  const handleDefaultChange = async (index) => {
    if (defaultAddressIndex === index) {
      // Bỏ chọn mặc định
      setDefaultAddressIndex(null);
      await firestore().collection('users').doc(userId).update({
        defaultAddress: firestore.FieldValue.delete(),
      });
    } else {
      // Đặt làm mặc định
      setDefaultAddressIndex(index);
      const selectedAddr = addressList[index];
      await firestore().collection('users').doc(userId).update({
        defaultAddress: selectedAddr,
      });
    }
  };  

  const renderAddressItem = ({ item, index }) => (
    <View style={styles.addressItem}>
      <TouchableOpacity onPress={() => handleAddressSelect(index)}>
        <View style={styles.addressInfo}>
          <Icon name="location-on" size={24} color="brown" />
          <View style={styles.addressDetails}>
            <Text style={styles.addressType}>{item.type || 'Address'}</Text>
            <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
              {item.street}, {item.city}, {item.province}
            </Text>
          </View>
          <Icon2
            name={selectedAddress === index ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedAddress === index ? '#8B4513' : '#ccc'}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={defaultAddressIndex === index} // Kiểm tra trạng thái checkbox độc lập
          onValueChange={() => handleDefaultChange(index)} // Chỉ thay đổi khi bấm checkbox
          tintColors={{ true: '#8B4513', false: '#ccc' }}
        />
        <Text style={styles.setDefaultText}>Set as default</Text>
      </View>
    </View>
  );

  const handleApply = () => {
    if (selectedAddress !== null) {
      const selectedAddr = addressList[selectedAddress];
      navigation.navigate('Checkout', {
        selectedProducts,
        selectedAddress: selectedAddr, // Truyền địa chỉ đã chọn
      });
    } else {
      alert('Please select an address.');
    }
  };  

  return (
    <View style={styles.container}>
      <Header title="Shipping Address" onBackPress={() => navigation.goBack()} />
      {addressList.length === 0 ? (
        <Text style={styles.emptyText}>No addresses available. Please add a shipping address.</Text>
      ) : (
        <FlatList
          data={addressList}
          renderItem={renderAddressItem}
          keyExtractor={(item, index) => `address-${index}`}
        />
      )}
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
  const [defaultPhoneIndex, setDefaultPhoneIndex] = useState(null);
  const [userId, setUserId] = useState(null);

  const { selectedProducts = [], selectedAddress } = route.params || {};

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchPhones = () => {
      if (userId) {
        const unsubscribe = firestore()
          .collection('users')
          .doc(userId)
          .onSnapshot((doc) => {
            if (doc.exists) {
              const userData = doc.data();
              setPhoneList(userData.phonelist || []);
              const defaultPhone = userData.defaultPhone;
              if (defaultPhone) {
                const defaultIndex = userData.phonelist.indexOf(defaultPhone);
                setDefaultPhoneIndex(defaultIndex);
                setSelectedPhone(defaultIndex);
              }
            }
          });

        return () => unsubscribe();
      }
    };

    fetchUserId();
    fetchPhones();
  }, [userId]);

  const handlePhoneSelect = (index) => {
    setSelectedPhone(index); // Chọn cho lần thanh toán hiện tại
  };

  const handleDefaultChange = async (index) => {
    if (defaultPhoneIndex === index) {
      // Bỏ chọn mặc định
      setDefaultPhoneIndex(null);
      await firestore().collection('users').doc(userId).update({
        defaultPhone: firestore.FieldValue.delete(),
      });
    } else {
      // Đặt làm mặc định
      setDefaultPhoneIndex(index);
      const selectedPhoneNum = phoneList[index];
      await firestore().collection('users').doc(userId).update({
        defaultPhone: selectedPhoneNum,
      });
    }
  };  

  const renderPhoneItem = ({ item, index }) => (
    <View style={styles.addressItem}>
      <TouchableOpacity onPress={() => handlePhoneSelect(index)}>
        <View style={styles.addressInfo}>
          <Icon name="phone" size={24} color="brown" />
          <View style={styles.addressDetails}>
            <Text style={styles.addressType}>Phone</Text>
            <Text style={styles.addressText}>{String(item)}</Text>
          </View>
          <Icon2
            name={selectedPhone === index ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedPhone === index ? '#8B4513' : '#ccc'}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={defaultPhoneIndex === index} // Kiểm tra trạng thái checkbox độc lập
          onValueChange={() => handleDefaultChange(index)} // Chỉ thay đổi khi bấm checkbox
          tintColors={{ true: '#8B4513', false: '#ccc' }}
        />
        <Text style={styles.setDefaultText}>Set as default</Text>
      </View>
    </View>
  );

  const handleApply = () => {
    if (selectedPhone !== null) {
      navigation.navigate('Checkout', {
        selectedProducts,
        selectedAddress,
        selectedPhone: phoneList[selectedPhone], // Truyền số điện thoại đã chọn
      });
    } else {
      alert('Please select a phone number.');
    }
  };  

  return (
    <View style={styles.container}>
      <Header title="Choose Phone" onBackPress={() => navigation.goBack()} />
      {phoneList.length === 0 ? (
        <Text style={styles.emptyText}>No phone numbers available. Please add a phone number.</Text>
      ) : (
        <FlatList
          data={phoneList}
          renderItem={renderPhoneItem}
          keyExtractor={(item, index) => `phone-${index}`}
        />
      )}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  setDefaultText: {
    marginLeft: 8,
    fontSize: 14,
  },
  addressItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressDetails: {
    flex: 1,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flexWrap: 'wrap',
    maxWidth: '92%',
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: '#888',
  },
  addAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'red'
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
  },
});

export { ShippingAddressScreen, ChoosePhoneScreen };
