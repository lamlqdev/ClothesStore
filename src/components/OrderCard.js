import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

const OrderCard = ({ productImage, productName, size, quantity, price, onClickButton, buttonText }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: productImage }}
        style={styles.image}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{productName}</Text>
        <Text style={styles.productDetails}>Size: {size} | Qty: {quantity}pcs</Text>
        <Text style={styles.price}>${price}</Text>
      </View>

      {buttonText !== "" ? <TouchableOpacity style={styles.button} onPress={onClickButton}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity> : null}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    padding: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontFamily: Fonts.interBold,
    color: Colors.Black,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    fontFamily: Fonts.interRegular,
    color: '#555',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontFamily: Fonts.interBold,
    fontWeight: 'bold',
    color: Colors.Black,        
  },
  button: {
    backgroundColor: '#6A4B3D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default OrderCard;
