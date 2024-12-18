import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../firebaseConfig';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [address, setAddress] = useState(null);
  const [phone, setPhone] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = auth.currentUser;
      setUserId(user.uid);
    };

    fetchUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchDefaultInfo = async () => {
        if (userId && !route.params?.selectedAddress && !route.params?.selectedPhone) {
          const userDoc = await firestore().collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setAddress(userData.defaultAddress || null);
            setPhone(userData.defaultPhone || null);
          }
        }
      };

      if (route.params?.selectedAddress) {
        setAddress(route.params.selectedAddress);
      }
      if (route.params?.selectedPhone) {
        setPhone(route.params.selectedPhone);
      }

      fetchDefaultInfo();

      const products = route.params?.selectedProducts || [];
      if (products.length > 0) {
        setSelectedProducts(products);
      }
    }, [userId, route.params])
  );

  useEffect(() => {
    const fetchDiscountAndCalculateTotal = async () => {
      if (userId && selectedProducts.length > 0) {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();

        let discountValue = 0;

        if (userData.membershipLevel) {
          const membershipDoc = await firestore()
            .collection('Membership')
            .doc(userData.membershipLevel)
            .get();

          if (membershipDoc.exists) {
            const membershipData = membershipDoc.data();

            discountValue = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0) * (membershipData.discountRate / 100);
          } else {
            console.error("No Membership document found for ID:", userData.membershipLevel);
          }
        }

        // Tính tổng giá trị sản phẩm
        const subtotal = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

        // Tính tổng sau khi giảm giá
        const totalWithDiscount = subtotal - discountValue;

        const shippingFee = 1.00;
        const finalAmount = totalWithDiscount + shippingFee;

        // Cập nhật giá trị giảm giá và tổng số tiền
        setDiscount(discountValue);
        setTotalAmount(finalAmount.toFixed(2));
      }
    };

    fetchDiscountAndCalculateTotal();
  }, [userId, selectedProducts]);

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      Alert.alert('Missing Information', 'Please make sure to select both an address and phone number.');
      return;
    }

    console.log('Navigating to Payment screen with:');
    console.log('Selected Products:', selectedProducts);

    navigation.navigate('Payment', {
      selectedProducts,
      selectedAddress: address,
      selectedPhone: phone,
      totalAmount: totalAmount,
      discountValue: discount,
    });
  };


  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemSize}>Size: {item.size}</Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemPrice}>${(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.itemPrice}>Total: ${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Checkout" onBackPress={() => navigation.goBack()} />

      <View style={styles.shippingSection}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.addressDetails}>
          <Icon name="map-marker" size={24} color="brown" />
          <View style={styles.addressText}>
            <Text style={styles.addressName}>Home</Text>
            <Text style={styles.addressLocation}>
              {address ? `${address.street}, ${address.city}, ${address.province}` : 'No address found. Please add a shipping address.'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
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
              {phone || 'No phone number found. Please add a phone number.'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ChoosePhone')}>
            <Text style={styles.changeText}>CHANGE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.orderListTitle}>Order List</Text>
      <FlatList
        data={selectedProducts}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.cartId}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.totalCol}>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Membership discount:</Text>
          <Text style={[styles.totalText, styles.totalTextRight]}>-${discount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Ship nationwide:</Text>
          <Text style={[styles.totalText, styles.totalTextRight]}>+$1.00</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total of all:</Text>
          <Text style={[styles.totalText, styles.totalTextRight]}>${totalAmount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.paymentButton} onPress={handlePlaceOrder}>
        <Text style={styles.paymentText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shippingSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
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
  orderListTitle: {
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 80,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSize: {
    fontSize: 15,
    color: '#888',
  },
  itemQuantity: {
    fontSize: 15,
    color: '#888',
  },
  itemPrice: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: 'bold',
  },
  totalContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  totalCol: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalTextRight: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  paymentButton: {
    margin: 16,
    padding: 16,
    backgroundColor: 'brown',
    borderRadius: 15,
    alignItems: 'center',
  },
  paymentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
