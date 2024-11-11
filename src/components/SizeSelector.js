import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fontSize } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const SelectSize = ({ sizelist, onSelectSize }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    onSelectSize(size);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Select Size</Text>
        {selectedSize && (
          <Text style={styles.selectedSizeText}>
            Selected: {selectedSize}
          </Text>
        )}
      </View>
      
      <View style={styles.sizeContainer}>
        {sizelist.map((sizeObj) => (
          <TouchableOpacity
            key={sizeObj.size}
            style={[
              styles.sizeButton,
              selectedSize === sizeObj.size && styles.selectedButton,
              sizeObj.quantity === 0 && styles.disabledButton,
            ]}
            onPress={() => handleSelectSize(sizeObj.size)}
            disabled={sizeObj.quantity === 0}
            activeOpacity={0.7}
          >
            <View style={styles.sizeContent}>
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === sizeObj.size && styles.selectedText,
                  sizeObj.quantity === 0 && styles.disabledText,
                ]}
              >
                {sizeObj.size}
              </Text>
              <Text
                style={[
                  styles.quantityText,
                  selectedSize === sizeObj.size && styles.selectedQuantityText,
                  sizeObj.quantity === 0 && styles.disabledText,
                ]}
              >
                {sizeObj.quantity > 0 ? `In stock: ${sizeObj.quantity}` : 'Out of stock'}
              </Text>
            </View>
            {selectedSize === sizeObj.size && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.interBold,
    fontSize: fontSize.md,
    color: Colors.Black,
  },
  selectedSizeText: {
    fontFamily: Fonts.interMedium,
    fontSize: 18,
    color: Colors.Brown,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeContent: {
    flex: 1,
  },
  selectedButton: {
    borderColor: Colors.Brown,
    backgroundColor: '#FFF8F3',
    shadowColor: Colors.Brown,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  sizeText: {
    fontSize: 20,
    fontFamily: Fonts.interBold,
    color: Colors.Black,
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 15,
    fontFamily: Fonts.interRegular,
    color: Colors.Gray,
  },
  selectedText: {
    color: Colors.Brown,
  },
  selectedQuantityText: {
    color: Colors.Brown,
  },
  disabledText: {
    color: '#BDBDBD',
  },
  checkmark: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.Brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SelectSize;