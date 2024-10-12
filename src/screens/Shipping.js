import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';

const AddressItem = ({ type, address, isSelected, onSelect }) => (
  <TouchableOpacity style={styles.addressItem} onPress={onSelect}>
    <View style={styles.addressInfo}>
      <Icon name="location-on" size={24} color="brown" />
      <View>
        <Text style={styles.addressType}>{type}</Text>
        <Text style={styles.addressText}>{address}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onSelect}>
      <Icon2
        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
        size={24}
        color={isSelected ? '#8B4513' : '#ccc'}
      />
    </TouchableOpacity>
  </TouchableOpacity>
);

const Button = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const ShippingAddressScreen = ({ navigation }) => {
  const addresses = [
    { type: 'Home', address: '1901 Thornridge Cir. Shiloh, Hawaii 81063' },
    { type: 'Office', address: '4517 Washington Ave. Manchester 39495' },
    { type: "Parent's House", address: '8502 Preston Rd. Inglewood, Maine 98380' },
    { type: "Friend's House", address: '2464 Royal Ln. Mesa, New Jersey 45463' },
  ];

  const [selectedAddress, setSelectedAddress] = useState(0);

  const handleAddressSelect = (index) => {
    setSelectedAddress(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Shipping Address" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={addresses}
        renderItem={({ item, index }) => (
          <AddressItem
            type={item.type}
            address={item.address}
            isSelected={index === selectedAddress}
            onSelect={() => handleAddressSelect(index)}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.addAddress}>
        <Icon name="add" size={24} color="#000" />
        <Text style={styles.addAddressText}>Add New Shipping Address</Text>
      </TouchableOpacity>
      <Button title="Apply" onPress={() => {}} />
    </SafeAreaView>
  );
};

const ChooseShippingScreen = ({ navigation }) => {
  const shippingOptions = [
    { type: 'Economy', date: '25 September 2024', icon: <Icon name="shopping-bag" size={24} color="brown" /> },
    { type: 'Regular', date: '24 September 2024', icon: <Icon name="shopping-bag" size={24} color="brown" /> },
    { type: 'Cargo', date: '22 September 2024', icon: <Icon3 name="truck" size={24} color="brown" /> },
    { type: "Friend's House", address: '2464 Royal Ln. Mesa, New Jersey 45463', icon: <Icon3 name="truck" size={24} color="brown" /> },
  ];

  const [selectedOption, setSelectedOption] = useState(0);

  const handleOptionPress = (index) => {
    setSelectedOption(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Choose Shipping" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={shippingOptions}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.addressItem}
            onPress={() => handleOptionPress(index)}
          >
            <View style={styles.addressInfo}>
              {item.icon}
              <View>
                <Text style={styles.addressType}>{item.type}</Text>
                <Text style={styles.addressText}>{item.date ? `Estimated Arrival ${item.date}` : item.address}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleOptionPress(index)}>
              <Icon2
                name={selectedOption === index ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selectedOption === index ? '#8B4513' : '#ccc'}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button title="Apply" onPress={() => {}} />
    </SafeAreaView>
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
});

export { ShippingAddressScreen, ChooseShippingScreen };
