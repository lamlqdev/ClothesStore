import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { fontSize } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const SelectSize = ({ productId, onSelectSize }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizeSnapshot = await firestore()
          .collection('ProductType')
          .where('productId', '==', productId)
          .get();
    
        if (!sizeSnapshot.empty) {
          const sizesData = sizeSnapshot.docs.flatMap(doc => {
            const sizeArray = doc.data().size;
            return sizeArray.map(size => ({
              size: size,
              quantity: doc.data().quantity,
            }));
          });
          setSizes(sizesData);
        } else {
          console.error('No sizes found for this product.');
        }
      } catch (error) {
        console.error('Error fetching sizes:', error);
      }
    };    

    fetchSizes();
  }, [productId]);

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    onSelectSize(size); // Gọi hàm onSelectSize để thông báo size đã chọn
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Size</Text>
      <View style={styles.sizeContainer}>
        {sizes.map((sizeObj) => (
          <TouchableOpacity
            key={sizeObj.size}
            style={[
              styles.sizeButton,
              selectedSize === sizeObj.size && styles.selectedButton,
            ]}
            onPress={() => handleSelectSize(sizeObj.size)}
          >
            <Text
              style={[
                styles.sizeText,
                selectedSize === sizeObj.size && styles.selectedText,
              ]}
            >
              {sizeObj.size}
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
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
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
