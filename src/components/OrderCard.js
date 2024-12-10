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
        <Text style={styles.productDetails}>Size: {size} | Qty: {quantity}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
      {buttonText && (
        <TouchableOpacity style={styles.button} onPress={onClickButton}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.LightGray,
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
    color: Colors.Black,
  },
  button: {
    backgroundColor: Colors.Brown,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OrderCard;
