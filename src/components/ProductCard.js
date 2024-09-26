import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProductCard = ({ item }) => {
  const [isWished, setIsWished] = useState(false); // State để theo dõi trạng thái wishlist

  const handleWishlistToggle = () => {
    setIsWished(!isWished); // Đảo ngược trạng thái khi nhấn
  };

  return (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productRating}>
          <Icon name="star" size={16} color="orange" />
          <Text style={styles.productRatingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.productPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.wishlistIcon} onPress={handleWishlistToggle}>
        <View style={[styles.wishlistCircle, isWished && styles.wishedCircle]}>
          <Icon
            name="heart"
            size={18}
            color={isWished ? '#fff' : 'gray'}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    marginRight: '2%',
    elevation: 2,
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    marginVertical: 8,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#555',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  wishlistIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  wishlistCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishedCircle: {
    backgroundColor: '#8B4513', 
  },
});
