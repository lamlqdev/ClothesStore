import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../firebaseConfig'; 
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { useFocusEffect } from '@react-navigation/native'; // Dùng useFocusEffect để reload lại dữ liệu khi quay lại màn hình

const MyProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultPhone, setDefaultPhone] = useState('');
  const [membershipLevel, setMembershipLevel] = useState('');
  const [membershipName, setMembershipName] = useState('');


  useFocusEffect(
    React.useCallback(() => {
      const getUserData = async () => {
        const user = auth.currentUser; // Lấy user hiện tại từ Firebase Authentication
        if (user) {
          const userId = user.uid; // Lấy userId từ Firebase Authentication

          const userDoc = await firestore().collection('users').doc(userId).get();
          if (userDoc.exists) {
            setName(userDoc.data().name || '');
            setDefaultAddress(userDoc.data().defaultAddress || '');
            setDefaultPhone(userDoc.data().defaultPhone || '');
            const userMembershipLevel = userDoc.data().membershipLevel || 'Standard';
            setMembershipLevel(userMembershipLevel);

            if (userMembershipLevel) {
              const membershipDoc = await firestore()
                .collection('Membership')
                .doc(userMembershipLevel)
                .get();

              if (membershipDoc.exists) {
                setMembershipName(membershipDoc.data().membershipName || 'Standard');
              } else {
                console.error('Membership not found for ID:', userMembershipLevel);
                setMembershipName('Standard');
              }
            }
          }
        }
      };

      getUserData();
    }, [])
  );

  const handleSaveChanges = async () => {
    const user = auth.currentUser; // Lấy user hiện tại từ Firebase Authentication
    if (!user) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    const userId = user.uid; // Lấy userId từ Firebase Authentication
    try {
      await firestore().collection('users').doc(userId).update({
        name,
      });
      Alert.alert('Success', 'Name updated successfully.');
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error', 'Failed to update name.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="My Profile" onBackPress={() => navigation.goBack()} />

      <View style={styles.profileHeader}>
        <Text style={styles.membershipLevel}>
          Membership Level: <Text style={styles.membershipText}>{membershipName}</Text>
        </Text>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.shippingSection}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressDetails}>
            <Icon name="map-marker" size={24} color="brown" />
            <View style={styles.addressText}>
              <Text style={styles.addressName}>Location</Text>
              <Text style={styles.addressLocation}>
                {typeof defaultAddress === 'object' && defaultAddress !== null
                  ? `${defaultAddress.street}, ${defaultAddress.ward}, ${defaultAddress.city}, ${defaultAddress.province}`
                  : defaultAddress || 'No address found. Please add a shipping address.'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress', {
              hideApplyButton: true,  // Ẩn nút Apply
              hideRadioButton: true,  // Ẩn radio button
            })}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.shippingSection}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <View style={styles.addressDetails}>
            <Icon name="phone" size={24} color="brown" />
            <View style={styles.addressText}>
              <Text style={styles.addressName}>Phone</Text>
              <Text style={styles.addressLocation}>
                {defaultPhone || 'No phone number found. Please add a phone number.'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ChoosePhone', {
              hideApplyButton: true,  // Ẩn nút Apply
              hideRadioButton: true,  // Ẩn radio button
            })}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  membershipLevel: {
    fontSize: 16,
    marginTop: 8,
    color: '#555',
  },
  membershipText: {
    fontWeight: 'bold',
    color: 'red',
  },
  profileInfo: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  shippingSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  addressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  addressText: {
    flex: 1,
    marginLeft: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressLocation: {
    fontSize: 14,
    color: '#666',
  },
  changeText: {
    color: '#0000FF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.Brown,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MyProfileScreen;
