import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { fontSize, spacing } from '../constants/dimensions';

const FooterCart = ({ totalPrice, onAddToCart }) => {
  return (
    <View style={styles.footer}>
      <Text style={styles.totalPriceText}>Total: ${totalPrice}</Text>
      <TouchableOpacity style={styles.addToCartButton} onPress={onAddToCart}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: Colors.White,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderTopWidth: 1,
    borderColor: Colors.Gray,
    elevation: 5, // Shadow cho Android
    shadowColor: '#000', // Shadow cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  totalPriceText: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: Colors.Black,
  },
  addToCartButton: {
    backgroundColor: Colors.Primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    borderRadius: 5,
  },
  addToCartText: {
    color: Colors.White,
    fontSize: fontSize.medium,
    fontWeight: '600',
  },
});

export default FooterCart;
