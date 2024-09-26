import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import Category from '../components/Category';
import ProductCard from '../components/ProductCard';

const categories = ['All', 'Jacket', 'Shirt', 'Pant', 'T-Shirt', 'Dress']

const products = [
  { id: 1, name: 'Brown Jacket', price: '$83.97', rating: 4.9, image: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
  { id: 2, name: 'Brown Suite', price: '$120.00', rating: 5.0, image: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884' },
  { id: 3, name: 'Yellow Shirt', price: '$60.00', rating: 4.8, image: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' },
  { id: 4, name: 'Red Dress', price: '$500.00', rating: 4.9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf05jWbUmZSFcnHa2oJVV39tUvN-iJMpfyZw&s' },
  { id: 5, name: 'Yellow Shirt', price: '$60.00', rating: 4.8, image: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' },
  { id: 6, name: 'Red Dress', price: '$500.00', rating: 4.9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf05jWbUmZSFcnHa2oJVV39tUvN-iJMpfyZw&s' }
];

const WishScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.White}
      />
      <Header title={"My wishlist"}/>
      <FlatList
        data={categories}
        renderItem={({item}) => (
          <Category 
            item={item}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        keyExtractor={(item) => item}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      />

      <FlatList
        data={products}
        renderItem={({item}) => (
          <ProductCard 
            item={item}
          />
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        style={styles.productContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    backgroundColor: Colors.White
  },
  categoryContainer: {
    marginTop: 15,
  },
  productContainer: {
    marginTop: 15,
    marginBottom: 140,
  }
})

export default WishScreen;
