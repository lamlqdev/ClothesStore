import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const SelectSize = () => {
  const [selectedSize, setSelectedSize] = useState(null);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleSelectSize = (size) => {
    setSelectedSize(size);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Size</Text>
      <View style={styles.sizeContainer}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              selectedSize === size && styles.selectedButton,
            ]}
            onPress={() => handleSelectSize(size)}
          >
            <Text
              style={[
                styles.sizeText,
                selectedSize === size && styles.selectedText,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginStart: 15,
    marginEnd: 15,
  },
  title: {
    fontFamily: Fonts.interBold,
    fontSize: fontSize.md,
    color: Colors.Black,
    marginBottom: 5,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: Colors.Brown,
    borderColor: Colors.LightGray,
  },
  sizeText: {
    fontSize: 16,
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
});

export default SelectSize;
