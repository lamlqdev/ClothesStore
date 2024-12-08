import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

const OrderCard = ({ productImage, productName, size, quantity, price, onClickButton, buttonText }) => {
  return (
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: productImage }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{productName}</Text>
        <Text style={styles.productDetails}>Size: {size} | Qty: {quantity}pcs</Text>
        <Text style={styles.price}>${price}</Text>
      </View>

      {buttonText !== "" ? (
        <TouchableOpacity style={styles.button} onPress={onClickButton}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.LightGray,
    justifyContent: 'space-between',
    minHeight: 70,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
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
    paddingHorizontal: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 30,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OrderCard;