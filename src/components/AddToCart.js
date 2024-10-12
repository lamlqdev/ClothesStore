import React from 'react';
import { Alert, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AddToCartButton = ({ productId, selectedSize }) => {
  const navigation = useNavigation();

  const addToCart = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log("Selected Size: ", selectedSize); // Kiểm tra giá trị của selectedSize
      if (!userId || !selectedSize) {
        Alert.alert('Please select product size');
        return;
      }

      // Kiểm tra tồn kho
      const productTypeSnapshot = await firestore()
        .collection('ProductType')
        .where('productId', '==', productId)
        .where('size', 'array-contains', selectedSize)
        .limit(1)
        .get();

      // Nếu không tìm thấy
      if (productTypeSnapshot.empty) {
        Alert.alert('No products found in the selected size');
        return;
      }

      // Lấy thông tin sản phẩm
      const productTypeData = productTypeSnapshot.docs[0].data();
      const stock = productTypeData.quantity;

      // Kiểm tra tồn kho
      if (stock <= 0) {
        Alert.alert('This product is out of stock.');
        return;
      }

      // Thêm sản phẩm vào giỏ hàng
      const cartRef = firestore().collection('Cart');
      const cartItem = {
        userId: userId,
        productId: productId,
        size: selectedSize,
        quantity: 1,
      };

      const existingCartItemSnapshot = await cartRef
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .where('size', '==', selectedSize)
        .limit(1)
        .get();

      let cartId;
      if (!existingCartItemSnapshot.empty) {
        const existingCartItem = existingCartItemSnapshot.docs[0];
        cartId = existingCartItem.id;
        const newQuantity = existingCartItem.data().quantity + 1;

        if (newQuantity > stock) {
          Alert.alert('The number of products in the cart exceeds the inventory quantity.');
          return;
        }

        await cartRef.doc(cartId).update({ quantity: newQuantity });
      } else {
        const newCartDoc = await cartRef.add(cartItem);
        cartId = newCartDoc.id;
      }

      await firestore().collection('users').doc(userId).update({
        cartlist: firestore.FieldValue.arrayUnion(cartId),
      });

      Alert.alert('Product has been added to cart');
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Error adding to cart: ', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={addToCart}>
      <View style={styles.content}>
        <Icon name="shopping-cart" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Add to Cart</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddToCartButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.Brown,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 15,
    marginStart: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: Colors.White,
    fontSize: 16,
    fontFamily: Fonts.interBold,
  },
});
