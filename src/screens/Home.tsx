import React from 'react';
import { View, Text, TextInput, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const categories = [
  { id: 1, name: 'T-Shirt', icon: 'tshirt' },
  { id: 2, name: 'Pant', icon: 'user-tie' },
  { id: 3, name: 'Dress', icon: 'female' },
  { id: 4, name: 'Jacket', icon: 'tshirt' }
];

const products = [
  { id: 1, name: 'Brown Jacket', price: '$83.97', rating: 4.9, image: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
  { id: 2, name: 'Brown Suite', price: '$120.00', rating: 5.0, image: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884' },
  { id: 3, name: 'Yellow Shirt', price: '$120.00', rating: 5.0, image: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' }
];

function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.locationContainer}>
          <Icon name="map-marker" size={20} color="red" />
          <Text style={styles.locationText}>New York, USA</Text>
        </View>
        <View style={styles.headerIcons}>
          <Icon name="bell" size={24} color="black" />
          <Icon name="sliders" size={24} color="brown" />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search" />
      </View>

      <View style={styles.bannerContainer}>
        <Image source={{ uri: 'https://file.hstatic.net/200000503583/article/high-fashion-la-gi-21_15eb1f9733ae4344977098b5bdcaf03f_2048x2048.jpg' }} style={styles.bannerImage} />
        <Text style={styles.bannerTitle}>New Collection</Text>
        <Text style={styles.bannerSubtitle}>Discount 50% for the first transaction</Text>
        <TouchableOpacity style={styles.shopNowButton}>
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categories}>
          {categories.map(category => (
            <View key={category.id} style={styles.category}>
              <FontAwesome5 name={category.icon} size={24} color="brown" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.flashSaleContainer}>
        <Text style={styles.sectionTitle}>Flash Sale</Text>
        <Text style={styles.closingInText}>Closing in: 02:12:56</Text>
        <View style={styles.products}>
          {products.map(product => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
              <View style={styles.productRating}>
                <Icon name="star" size={16} color="orange" />
                <Text style={styles.productRatingText}>{product.rating}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchContainer: {
    margin: 16
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    paddingLeft: 16,
    elevation: 2
  },
  bannerContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 16
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#888'
  },
  shopNowButton: {
    backgroundColor: 'brown',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16
  },
  categoryContainer: {
    margin: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8
  },
  category: {
    alignItems: 'center'
  },
  categoryText: {
    marginTop: 4,
    fontSize: 14,
    color: '#555'
  },
  flashSaleContainer: {
    margin: 16
  },
  closingInText: {
    fontSize: 14,
    color: '#888'
  },
  products: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8
  },
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    alignItems: 'center'
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8
  },
  productPrice: {
    fontSize: 14,
    color: '#888'
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  productRatingText: {
    marginLeft: 4,
    fontSize: 14
  }
});

export default HomeScreen;