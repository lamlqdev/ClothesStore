import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header'; // Import Header
import { useRoute } from '@react-navigation/native'; 

const jacketProducts = [
  { id: 1, name: 'Brown Jacket', price: '$83.97', rating: 4.9, image: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
  { id: 2, name: 'Brown Suite', price: '$120.00', rating: 5.0, image: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884' },
  { id: 3, name: 'Brown Jacket', price: '$83.97', rating: 4.9, image: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
  { id: 4, name: 'Yellow Shirt', price: '$120.00', rating: 5.0, image: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' },
];

function JacketScreen({ navigation }) {
  const route = useRoute(); // Sử dụng useRoute để nhận tham số
  const { title } = route.params; // Lấy giá trị 'title' từ tham số được truyền

  const renderItem = ({ item }) => (
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
      <TouchableOpacity style={styles.wishlistIcon}>
        <Icon name="heart" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Sử dụng Header component */}
      <Header 
        title={title} 
        onBackPress={() => navigation.goBack()} 
      />

      <FlatList
        data={jacketProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  productsContainer: {
    padding: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    marginRight: '2%',
    elevation: 2,
    padding: 10,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
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
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wishlistIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default JacketScreen;
